console.clear();

// animation mode
let isScrollAnimation = false;

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

  // UTILS

  mat2 rotate(float th) {
      return mat2(cos(th), sin(th), -sin(th), cos(th)); 
  }

  // FRACTALS COMPUTATIONS
  vec4 z_n_Julia(vec4 q, float n, float r) {
      /*
      Computes the q (quaternion) to the power of n using polar coordinates
      */
      float phi = acos(q.x/r);
      
      vec3 n_hat = q.yzw/(r*sin(phi));
      float n_phi = n*phi;
      return pow(r, n) * vec4(cos(n_phi), n_hat*sin(n_phi));
  }



  // Hubbard-Douady potential SDF
  float distToJuliaSet(vec3 p) 
  {
      // transformations (rot, scale...)
      //p.xz*=rotate(cos(u_time*0.5)*2.1);
      //p.yx *= rotate(sin(u_time*0.2)*0.7);
      
      vec4 c = vec4(clamp(-2.0*smoothstep(1.0, 0.0, u_time*0.06), -3.0, -0.6), 0.3*cos(u_time*0.5), 0.6*sin(u_time*0.4), 0.01);
      
      float n = 2.0;
      float n_minus = n-1.0;
      float size_bulb = 4.0;
      vec4 z = vec4(p, 0.0);
      float lz_2 = dot(z,z); // length squared of vector z
      float r = sqrt(lz_2);
      float dz = 1.0; // derivative

      for (int i = 0; i<7; i++) 
      {
          
          dz = n * dz * pow(r, n_minus); //dz_k+1 = n * dz_k * length(z)**(n-1) + 1
          z = c + z_n_Julia(z, n, r);
          lz_2 = dot(z, z);
          r = sqrt(lz_2);
          if (r > size_bulb) break; //if r > size_bulb we consider the suite to be convergent (?)
      }
      return 0.5*r*log(r)/dz;
  }


  // RAYMARCHING 

  float map(vec3 p) 
  {
      
      return distToJuliaSet(p);
  }

  vec3 intersectBoundingSphere(vec3 p, vec3 rd)
  {
    //f(t) = t² + 2.0 * d.CP * t - r*r + PC*PC

    // Delta f
    float d_CP = dot(p, rd);
    float r_sq = 2.3;
    float D = 4.0*(d_CP*d_CP + r_sq -dot(p,p));
    if (D < 0.0) return vec3(D, 0.0, 0.0);
    
    float mb_over2 = -d_CP;
    float sqrt_D_over2 = sqrt(D)/2.0;
    float d1 = mb_over2 + sqrt_D_over2;
    float d2 = mb_over2 - sqrt_D_over2;

    // p is inside the sphere = we don't care about it
    if (d1*d2 < 0.0) return vec3(D, 0.0, 0.0); 

    // the sphere is behind p = we don't care about it
    if (d1 < 0.0) return  vec3(D, 0.0, 0.0);

    // the sphere stands in front of p = specular required!

    // one intersection point
    if (abs(D) < 1.0e-5) return vec3(D, mb_over2, mb_over2);

    // two intersection points
    return vec3(D, d2, d1);

  }

  float rayMarch(in vec3 ro, in vec3 rd, inout int id_object, inout float last_dist_obj)
  {
      float d = 0.0;
      int last_i = 0;
      float last_dist = 10.0;
      for (int i = 0; i<60; i++) 
      {
          last_i = i;
          if (d > 5.0) break;

          vec3 p = ro + rd*d;          
          float dist = map(p);
          d += dist;

          if (dist < 0.003) 
          {
            last_dist = dist;
            break;
          }
      }
      id_object = last_i;
      last_dist_obj = last_dist;
      return d;
  }

  vec3 initCamera(vec2 uv, vec3 eye, vec3 look_at, float zoom)
  {
      vec3 fwd = normalize(look_at - eye);
      vec3 rgt = normalize(cross(fwd, vec3(0.0, 1.0, 0.0)));
      vec3 local_up = cross(rgt, fwd);
      
      return normalize(zoom*fwd + uv.x*rgt + uv.y * local_up);
  }



  vec3 getNormal(vec3 p) 
  {
      vec2 eps = vec2(0.01, 0.0);
      vec3 n = vec3(
      map(p+eps.xyy) - map(p-eps.xyy), 
      map(p+eps.yxy) - map(p-eps.yxy),
      map(p+eps.yyx) - map(p-eps.yyx));
      return normalize(n);
  }


  vec3 getColor(vec3 eye, vec3 p, float sdf, int id_object, vec3 rayTest, float last_dist_obj) 
  { 
    vec3 color = pow(vec3(0.0), vec3(2.2));


    vec3 v = normalize(eye - p);

    vec3 l = normalize(vec3(10.0, 50.0, 1.0) - p);
    
    vec3 l2 = normalize(vec3(-10.0, 5.0, 1.0) - p);

    vec3 h = normalize(l + v);
    vec3 h2 = normalize(l2 + v);

    vec3 n = getNormal(p);

    float spec = max(pow(dot(n, h), 32.0), 0.0);
    float spec2 = max(pow(dot(n, h2), 32.0), 0.0);

    if (sdf < 10.0) return color*1./sdf * float(id_object) + vec3(spec) + vec3(spec2);
    else vec3(1.0, 0.0, 0.0);
  }


  void main()
  {
    vec2 uv = v_position*resizeFactor;
    float ratio = u_canva.x/u_canva.y;
    if (ratio > 1.0) uv.x *=ratio;
    else uv.y /= ratio;

    vec3 ro = vec3(0.0, 0.0, 1.0);
    float factor = 0.1*smoothstep(0.0,10.0,10.0*u_time)+ 1.0;
    ro.xz = 2.*vec2(cos(u_time*0.2), sin(u_time*0.1));
    ro.xz /=factor;
    vec3 look_at = vec3(0.0, 0.0, 0.0); //look at
    
    float zoom = 1.6;
    vec3 rd = initCamera(uv, ro, look_at, zoom);
    
    vec3 rayTest = intersectBoundingSphere(ro, rd);

    int id_object = 0;
    float last_dist_obj = 10.0;
    float sdf = rayMarch(ro, rd, id_object, last_dist_obj);


    vec3 intersection = ro + sdf * rd;
    
    
    vec3 color = getColor(ro, intersection, sdf, id_object, rayTest, last_dist_obj);

    gl_FragColor = vec4(pow(color, vec3(1.0/2.2)), 1.0);
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

function heho() {
  console.log("TEST");
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
  const canvas = document.querySelector('#mandelbulb');

  // Lookup the size the browser is displaying the canvas in CSS pixels.
  const displayWidth  = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  const needResize = canvas.width  !== displayWidth ||
                     canvas.height !== displayHeight;

  if (needResize) {
    // Make the canvas the same size
    canvas.width  = displayWidth/1.5;
    canvas.height = displayHeight/1.5;
  }

  // adapting resolution
  var resizeFactor = 2.0;
  var elapsedTime = (Date.now() - start_time) / 1000.0;
  if (isScrollAnimation) return;
  if (window.matchMedia("(max-width:1600px").matches) 
  {
    resizeFactor = 1.5;
    window.requestAnimationFrame(render);
  }
  else {
    window.requestAnimationFrame(render);
  }
  var gl = canvas.getContext('webgl');
  if (!gl) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
    return;
  }
  gl.viewport(0.0, 0.0, gl.canvas.width, gl.canvas.height);
  // init shader program
  const programId = initShaderProgram(gl);
  // init particle buffers
  const vertices = [-1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0];
  initVBO(gl, vertices, programId, "position", 2, 0, 0);

  gl.useProgram(programId);

  // // uniforms

  // time
  const timeLoc = gl.getUniformLocation(programId, "u_time");
  if (timeLoc != -1.0) 
  {

    gl.uniform1f(timeLoc, elapsedTime);
  }

  // resize factor 
  const resizeLoc = gl.getUniformLocation(programId, "resizeFactor");
  if (timeLoc != -1.0) 
  {

    gl.uniform1f(resizeLoc, resizeFactor);
  }
  // canva size
  const canvaLoc = gl.getUniformLocation(programId, "u_canva");
  if (canvaLoc != -1.0) 
  {

    gl.uniform2fv(canvaLoc, [gl.canvas.width, gl.canvas.height]);
  }

  gl.clearColor(0.071, 0.071, 0.102, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  // draw call
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

window.requestAnimationFrame(render);

function onScroll(event)
{
  console.log("SCROLL");
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
console.log("SCROLL");
let isMobile = true;
window.addEventListener("load", () => {
    isMobile = navigator.userAgent.toLowerCase().match(/mobile/i);
});

function switchAnimation()
{
  console.log("wsitching");
  isScrollAnimation = !isScrollAnimation;
  render();
}