console.clear();

// setting time uniform
var start_time = Date.now();

const vsSource = `
  attribute vec2 position; 

  varying lowp vec2 v_position;

  void main(void)
  {
    gl_Position = vec4(position, 0.0, 1.0);
    v_position = position;
  }

  `;

const fsSource = `
  precision lowp float;
  varying lowp vec2 v_position; 

  uniform float u_time;
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
      p.xz*=rotate(cos(u_time*0.5)*0.8);
      p.yx *= rotate(sin(u_time*0.9)*0.2);
      
      //vec4 c = normalize(vec4(.19, -.01, 0.9* sin(u_time*.9), 0.5));
      //vec4 c = vec4(-0.605,0.339,-0.0889,-0.22);
      vec4 c = vec4(clamp(-2.0*smoothstep(1.0, 0.0, u_time*0.06), -3.0, -0.6), 0.3*cos(u_time*0.5), 0.6*sin(u_time*0.4), 0.01);
      
      float n = 2.0;
      float n_minus = n-1.0;
      float size_bulb = 256.0;
      vec4 z = vec4(p, 0.0);
      float lz_2 = dot(z,z); // length squared of vector z
      float r = sqrt(lz_2);
      float dz = 1.0; // derivative

      for (int i = 0; i<10; i++) 
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

  float rayMarch(in vec3 ro, in vec3 rd, inout int id_object)
  {
      float d = 0.0;
      for (int i = 0; i<500; i++) 
      {
          if (d > 800.0) break;
          vec3 p = ro + rd*d;
          float dist = map(p);
          d += dist;

          if (dist < 0.01) 
          {
            id_object = 1;
            break;
          }
      }
      return d;
  }

  vec3 initCamera(vec2 uv, vec3 eye, vec3 look_at, float zoom)
  {
      vec3 fwd = normalize(look_at - eye);
      vec3 rgt = normalize(cross(fwd, vec3(0.0, 1.0, 0.0)));
      vec3 local_up = cross(rgt, fwd);
      
      return zoom*fwd + uv.x*rgt + uv.y * local_up;
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

  vec3 getColor(vec3 eye, vec3 p, float sdf, int id_object) 
  {
      vec3 l = normalize(vec3(0.0,-5.0, 3.0) - p);
      vec3 l_2 = normalize(vec3(0.3,5.,-5.5)- p);
      vec3 n = getNormal(p);
      vec3 v = normalize(eye - p);
      float intensity = clamp(dot(n, l), 0.0, 1.0);
      float intensity_2 = clamp(dot(n, l_2), 0.0, 1.0);
      
      
      vec3 color = vec3(0.071, 0.071, 0.102);
      if (id_object == 0) return pow(color, vec3(2.2));
      
      vec3 h = normalize(l + v);
      vec3 h_2 = normalize(l_2 + v);

      //blinn phong spec
      float spec = max(pow(dot(n, h), 32.0), 0.0);
      float spec_2 = max(pow(dot(n, h_2), 64.0), 0.0);

      color = pow(color, vec3(2.2)) * intensity;
      color +=pow(vec3(0.953, 0.643, 0.549), vec3(2.2)) * intensity_2;
      color += spec;
      color += spec_2;
      
      float dist = rayMarch(p+n*0.01*2.0, l, id_object);
      if (dist < length(l - p)) 
          intensity *=.6;

      return color;
  }


  void main()
  {
    vec2 uv = v_position;
    uv.x *= u_canva.x/u_canva.y;
    
    vec3 ro = vec3(0.0, 2.5, 3.0);
    ro.xz = 1.5* vec2(cos(u_time*0.5), sin(u_time*3.0*0.5));
    ro.yz =2.0* vec2(cos(-u_time*0.1), sin(u_time*3.0*0.1));
    vec3 look_at = vec3(0.0, 0.0, 0.0); //look at
    
    float zoom = 0.9;
    vec3 rd = initCamera(uv, ro, look_at, zoom);
    
    int id_object = 0;
    float sdf = rayMarch(ro, rd, id_object);

    vec3 intersection = ro + sdf * rd;
    
    
    vec3 color = getColor(ro, intersection, sdf, id_object);

    gl_FragColor = vec4(pow(color, vec3(1.0/2.2)),1.0);
  }

`;

render();


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

  var factor = 1.0;
  if ("matchMedia" in window)
  {
    if (window.matchMedia("(max-width:800px").matches) 
    {
      factor = 1.8;
    }
    if (window.matchMedia("(max-width:1600px").matches) 
    {
      factor = 1.4;
    }
  }

  // adapting resolution
  var res_w = canvas.offsetWidth/factor;
  var res_h = canvas.offsetHeight/factor;
  console.log("debut");
  console.log(canvas.clientWidth);
  console.log(canvas.clientHeight);
  canvas.setAttribute("width", res_w.toString());
  canvas.setAttribute("height", res_h.toString());

  console.log(canvas.width);
  console.log(canvas.height);

  var gl = canvas.getContext('webgl');
  if (!gl) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
    return;
  }


  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
  console.log(renderer);
  // init shader program
  const programId = initShaderProgram(gl);
  // init particle buffers
  const vertices = [-1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0];
  initVBO(gl, vertices, programId, "position", 2, 0, 0);

  gl.useProgram(programId);

  // // uniforms

  // time
  var elapsed_time = (Date.now() - start_time) / 1000.0;
  const timeLoc = gl.getUniformLocation(programId, "u_time");
  if (timeLoc != -1.0) 
  {

    gl.uniform1f(timeLoc, elapsed_time);
  }

  // canva size
  const canvaLoc = gl.getUniformLocation(programId, "u_canva");
  if (canvaLoc != -1.0) 
  {

    gl.uniform2fv(canvaLoc, [canvas.width, canvas.height]);
  }

  gl.clearColor(0.071, 0.071, 0.102, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  // draw call
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  window.requestAnimationFrame(render);
}
window.requestAnimationFrame(render);

