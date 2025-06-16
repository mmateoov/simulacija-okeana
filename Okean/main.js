import { mat4 } from 'https://cdn.jsdelivr.net/npm/gl-matrix@3.4.0/+esm';
import WebGLUtils from '../WebGLUtils.js';

async function main() {
    /** @type {WebGLRenderingContext} */
    const gl = WebGLUtils.initWebGL();
    gl.enable(gl.DEPTH_TEST);

    WebGLUtils.resizeCanvasToWindow(gl);

    const vertices = await WebGLUtils.loadOBJ("../okeanPlatforma.obj", true);
    const program = await WebGLUtils.createProgram(gl, "./vertex-shader.glsl", "./fargment-shader.glsl");

    const u_mvpLocation = gl.getUniformLocation(program, "u_mvp");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const waveHeightLocation = gl.getUniformLocation(program, "u_waveHeight");
    const waveSpeedLocation = gl.getUniformLocation(program, "u_waveSpeed");
    const waveSteepnessLocation = gl.getUniformLocation(program, "u_waveSteepness");

    const waveHeight = 0.08;
    const waveSpeed = 2;
    const waveSteepness = 1;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    const startTime = Date.now();

    const VAO = WebGLUtils.createVAO(gl, program, vertices, 8, [
        { name: "in_position", size: 3, offset: 0 },
    ]);

    function render(){
        WebGLUtils.resizeCanvasToWindow(gl);
        const { modelMat, viewMat, projectionMat } = WebGLUtils.createModelViewProjection(gl, [2, 2, 5]);
        const mvpMat = mat4.create();
        mat4.multiply(mvpMat, projectionMat, viewMat);
        mat4.multiply(mvpMat, mvpMat, modelMat);
        const currentTime = (Date.now() - startTime) / 1000;

        gl.useProgram(program);
        gl.uniformMatrix4fv(u_mvpLocation, false, mvpMat);
        gl.uniform1f(timeLocation, currentTime);
        gl.uniform1f(waveHeightLocation, waveHeight);
        gl.uniform1f(waveSpeedLocation, waveSpeed);
        gl.uniform1f(waveSteepnessLocation, waveSteepness);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.bindVertexArray(VAO);
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 8);
        requestAnimationFrame(render);
    }

    render();
}

main();