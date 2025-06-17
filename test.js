import { mat4, vec3 } from 'https://cdn.jsdelivr.net/npm/gl-matrix@3.4.0/+esm';
import WebGLUtils from '../WebGLUtils.js';

async function main() {
  /** @type {WebGLRenderingContext} */
  const gl = WebGLUtils.initWebGL();
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  WebGLUtils.resizeCanvasToWindow(gl);

  const vertices = await WebGLUtils.loadOBJ("../cube.obj", true);

  const program = await WebGLUtils.createProgram(gl, "vertex-shader.glsl", "fragment-shader.glsl");

  const cameraPos = [2, 2, 5];
  const { modelMat, viewMat, projectionMat } = WebGLUtils.createModelViewProjection(gl, cameraPos);

  WebGLUtils.setUniformMatrix4fv(gl, program,
    ["u_model", "u_view", "u_projection"],
    [modelMat, viewMat, projectionMat]
  );

  // Setup lights
  const lightDir = vec3.fromValues(5.0, 2.0, 1.0);
  const lightColor = vec3.fromValues(1.0, 1.0, 1.0); // white light
  const ambientColor = vec3.fromValues(0.1, 0.1, 0.1); // dimmed ambient light

  vec3.normalize(lightDir, lightDir);

  WebGLUtils.setUniform3f(gl, program,
    ["u_view_direction", "u_ambient_color", "u_light_direction", "u_light_color"],
    [cameraPos, ambientColor, lightDir, lightColor]
  );

  const VAO = WebGLUtils.createVAO(gl, program, vertices, 8, [
    { name: "in_position", size: 3, offset: 0 },
    { name: "in_normal", size: 3, offset: 5 },
  ]);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(program);
  gl.bindVertexArray(VAO);
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 8);
}

main();