/* Example: 06-phong
 * Rotating a 3D model with Phong shading
 * Mouse dragging and callbacks are used to rotate the model.
 */

/* TASKS:
 * 1. Fix a bug where light on object is not rotated with the model.
 */

import { mat4, vec3 } from 'https://cdn.jsdelivr.net/npm/gl-matrix@3.4.0/+esm';
import WebGLUtils from '../WebGLUtils.js';

async function main() {
  /** @type {WebGLRenderingContext} */
  const gl = WebGLUtils.initWebGL();
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  WebGLUtils.resizeCanvasToWindow(gl);

  const vertices = await WebGLUtils.loadOBJ("./Shapes/torus.obj", true);
  const texture = await WebGLUtils.loadTexture(gl, "./Shapes/brick.jpg");

  const program = await WebGLUtils.createProgram(gl, "vertex-shader.glsl", "fragment-shader.glsl");

  const cameraPos = [2, 2, 5];
  const { modelMat, viewMat, projectionMat } = WebGLUtils.createModelViewProjection(gl, cameraPos);

  WebGLUtils.setUniformMatrix4fv(gl, program,
    ["u_model", "u_view", "u_projection"],
    [modelMat, viewMat, projectionMat]
  );

  // Setup lights
  const lightDir = vec3.fromValues(5.0, 2.0, 1.0);
  const lightColor = vec3.fromValues(1.0, 1.0, 1.0);    // white light
  const ambientColor = vec3.fromValues(0.1, 0.1, 0.1);  // dimmed ambient light

  vec3.normalize(lightDir, lightDir);

  WebGLUtils.setUniform3f(gl, program,
    ["u_view_direction", "u_ambient_color", "u_light_direction", "u_light_color"],
    [cameraPos, ambientColor, lightDir, lightColor]
  );
  // Setup texture
   gl.useProgram(program);
   const textureLoc = gl.getUniformLocation(program, "u_texture");
   gl.uniform1i(textureLoc, 0); // Texture unit 0
   

   

  const VAO = WebGLUtils.createVAO(gl, program, vertices, 8, [
    { name: "in_position", size: 3, offset: 0 },
    { name: "in_uv", size: 2, offset: 3 },
    { name: "in_normal", size: 3, offset: 5 },
  ]);

  // Variables to store the state of mouse dragging and rotation angles
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;
  let rotationX = 0;
  let rotationY = 0;
  const ROTATION_SPEED = 0.005;
  let angle = 0;
let scale = 1.0;

// Handle user input for scaling
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") {
        scale += 0.5;
    } else if (event.key === "ArrowDown") {
        scale = Math.max(0.1, scale - 0.7);
    }
});



  // We register event listeners (callback functions) for mouse dragging
  gl.canvas.addEventListener('mousedown', (event) => {
    isDragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
  });

  gl.canvas.addEventListener('mouseup', () => {
    isDragging = false;
  });

  gl.canvas.addEventListener('mouseleave', () => {
    isDragging = false;
  });

  gl.canvas.addEventListener('mousemove', (event) => {
    if (!isDragging) return;

    // Deltas represent rotation angles based on mouse movement
    const deltaX = event.clientX - lastX;
    const deltaY = event.clientY - lastY;

    // We multiply the deltas by a sensitivity factor to control the rotation speed
    rotationY += deltaX * ROTATION_SPEED;
    rotationX += deltaY * ROTATION_SPEED;

    lastX = event.clientX;
    lastY = event.clientY;
  });

function render() {
    angle += 0.01;

    // Reset model matrix
    mat4.identity(modelMat);
    
    // Apply rotations
    mat4.rotateX(modelMat, modelMat, rotationX);
    mat4.rotateY(modelMat, modelMat, rotationY);

    // Apply scaling
    mat4.scale(modelMat, modelMat, [scale, scale, scale]);

    // Clear the canvas and depth buffer
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Update shader uniform
    WebGLUtils.setUniformMatrix4fv(gl, program, ["u_model"], [modelMat]);

    gl.useProgram(program);
    gl.bindVertexArray(VAO);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 8);

    requestAnimationFrame(render);
}

  render();
}



main();