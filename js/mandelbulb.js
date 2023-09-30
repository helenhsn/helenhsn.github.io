console.clear();

var current_time = 0.0;

const vsSource = `
  attribute vec2 position; 

  varying lowp vec2 v_position;

  void main(void){ 
  gl_Position=vec4(position, 0.0, 1.0); 
  v_position = position;
  }
  `;

const fsSource = `
  varying lowp vec2 v_position; 
  void main(void){
  gl_FragColor=vec4(0.9, 0.0 ,0.9 ,1.0);
  }
  `;

main();


/*-------------- BUFFER RELATED FUNCTIONS -------------- */
function initVBO(gl, data, programId, nameAttrib, numFloats, stride, offset) {
  console.log("init vbo");

  const id = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, id);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

  heho();
  var loc = gl.getAttribLocation(programId, nameAttrib);
  console.log(loc);
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

  console.log(source);

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


function main() {
  console.log("main");

  const canvas = document.querySelector("#mandelbulb");

  // gl context
  const gl = canvas.getContext("webgl");

  if (!gl) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
    return;
  }

  // init shader program
  const programId = initShaderProgram(gl);
  // init particle buffers
  const vertices = [-0.9, -0.9, 0.9, -0.9, 0.9, 0.9, -0.9, -0.9, 0.9, 0.9, -0.9, 0.9];
  initVBO(gl, vertices, programId, "position", 2, 0, 0);

  gl.useProgram(programId);

  console.log(gl.canvas.clientHeight);
  gl.clearColor(0.06, 0.16, 0.09, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  // draw call
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}
