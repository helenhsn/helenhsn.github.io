console.clear();

// animation mode
let isScrollAnimation = false;
let frameCounter = 0; // Frame counter

let programId = null;
let verticesBuffer = null;

function initializeWebGL() {
  const canvas = document.querySelector('#spiral');

  // Get the WebGL context
  gl = canvas.getContext('webgl');
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  // Initialize shader program
  programId = initShaderProgram(gl);

  // Initialize vertex buffer
  const vertices = [-1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0];
  verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  const positionLoc = gl.getAttribLocation(programId, "position");
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionLoc);
}

// setting time uniform
var start_time = Date.now();
var last_scroll_time = 0.0;
const vsSource = `
  attribute vec2 position; 

  varying highp vec2 v_position;

  void main(void)
  {
    gl_Position = vec4(position, 0.0, 1.0);
    v_position = position;
  }

  `;

const fsSource = `
  precision highp float;
  varying highp vec2 v_position; 

  uniform float u_time;
  uniform float resizeFactor;
  uniform vec2 u_canva;


float random(in vec2 uv)
{
    return fract(sin(dot(uv.xy, 
                         vec2(12.9898, 78.233))) * 
                 43758.5453123);
}

float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

float tri(float t)
{
    return 2.0*abs(t*0.05 - floor(t*0.05 + 0.5));
}

float fbm( in vec2 x)
{    
    float G = exp2(-0.9);
    float f = 3.0;
    float a = .6+0.2*tri(u_time);
    float t = 0.0;
    for( int i=0; i<2; i++ )
    {
        t += a*noise(f*x);
        f *= 2.0;
        a *= G;
    }
    return t;
}

float pattern( in vec2 p )
{
    vec2 q = vec2( 0.75*fbm( p + vec2(0.8, 2.0) ),
                   0.05*fbm( p + vec2(-.2,8.3) ) );

    return fbm( p + 4.0*q );
}
  void main()
  {
    vec2 uv = v_position;
    float ratio = u_canva.x/u_canva.y;
    if (ratio > 1.0) uv.x *=ratio;
    else uv.y /= ratio;
    uv*=0.5;

     // tube
    float f = 1. / length(uv);
    
    // add the angle
    f += atan(uv.x, uv.y)*5.0;
    f -= u_time*0.4;
   	f = sin(f);
    
    // add the darkness to the end of the tunnel
    f *= sin(length(pattern(uv)) - .4);
	
    vec3 color = mix(vec3(0.0, 0.0, 0.0), vec3(0.9529, 0.64314, 0.54902), f);
	
    gl_FragColor = vec4(color, 1.0);
  }

`;



/*-------------- BUFFER RELATED FUNCTIONS -------------- */
function initVBO(gl, data, programId, nameAttrib, numFloats, stride, offset) {

  const id = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, id);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

  var loc = gl.getAttribLocation(programId, nameAttrib);
  gl.vertexAttribPointer(loc, numFloats, gl.FLOAT, gl.FALSE, stride, offset);
  gl.enableVertexAttribArray(loc);
}


/*-------------- SHADER PROGRAMS FUNCTIONS -------------- */

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);


  gl.shaderSource(shader, source);
  gl.compileShader(shader);


  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function initShaderProgram(gl) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.log(
      `Unable to initialize the shader program: ${gl.getProgramInfoLog(
        shaderProgram
      )}`
    );
    return null;
  }

  return shaderProgram;
}



function render() {
  if (!gl || !programId) return;

  const canvas = document.querySelector('#spiral');

  // Increment the frame counter
  frameCounter++;

  // Skip rendering every other frame
  if (frameCounter % 2 !== 0) {
    window.requestAnimationFrame(render);
    return;
  }

  // Lookup the size the browser is displaying the canvas in CSS pixels.
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  const needResize = canvas.width !== displayWidth || canvas.height !== displayHeight;

  if (needResize) {
    // Make the canvas the same size
    canvas.width = displayWidth / 1.5;
    canvas.height = displayHeight / 1.5;
  }

  // Check screen size and skip rendering if smaller than 768px
  if (window.innerWidth <= 768) {
    console.log("Screen size is too small. Skipping rendering.");
    return;
  }

  // Adapting resolution
  var resizeFactor = 2.0;
  var elapsedTime = (Date.now() - start_time) / 1000.0;

  if (isScrollAnimation) return;

  if (window.matchMedia("(max-width:1600px").matches) {
    resizeFactor = 1.5;
    window.requestAnimationFrame(render);
  } else {
    window.requestAnimationFrame(render);
  }

  // WebGL rendering setup
  gl.viewport(0.0, 0.0, gl.canvas.width, gl.canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(programId);

  // Set uniforms

  // Time
  const timeLoc = gl.getUniformLocation(programId, "u_time");
  if (timeLoc != -1) {
    gl.uniform1f(timeLoc, elapsedTime);
  }

  // Resize factor
  const resizeLoc = gl.getUniformLocation(programId, "resizeFactor");
  if (resizeLoc != -1) {
    gl.uniform1f(resizeLoc, resizeFactor);
  }

  // Canvas size
  const canvaLoc = gl.getUniformLocation(programId, "u_canva");
  if (canvaLoc != -1) {
    gl.uniform2fv(canvaLoc, [gl.canvas.width, gl.canvas.height]);
  }

  // Draw
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

   // Increment the frame counter
   frameCounter++;
}

window.requestAnimationFrame(render);

function onScroll(event)
{
  event.preventDefault(); 

  var distanceY = window.scrollY;
  if (distanceY > 0) {
    console.log("oui");
    render();
    last_scroll_time += 0.1;
  }
}
window.addEventListener("resize", render);
window.addEventListener("scroll", onScroll);
window.addEventListener("touchmove", onScroll);
window.addEventListener("load", () => {
  initializeWebGL(); // Called once after the page is fully loaded
  window.requestAnimationFrame(render); // Start the render loop
});


function switchAnimation()
{
  isScrollAnimation = !isScrollAnimation;
  render();
}