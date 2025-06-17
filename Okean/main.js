import { mat4, vec3 } from 'https://cdn.jsdelivr.net/npm/gl-matrix@3.4.0/+esm';
import WebGLUtils from '../WebGLUtils.js';

const modelMat = mat4.create();
const viewMat = mat4.create();
const projectionMat = mat4.create();
const mvpMat = mat4.create();

async function main() {
  /** @type {WebGLRenderingContext} */
  const gl = WebGLUtils.initWebGL();
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  WebGLUtils.resizeCanvasToWindow(gl);

    const vertices = await WebGLUtils.loadOBJ("../cube.obj", true); // ucitavanje tacaka iz obj fajla
    const program = await WebGLUtils.createProgram(gl, "./vertex-shader.glsl", "./fragment-shader.glsl"); // učitava šejdere

    // Kamera
    const cameraPosition = vec3.fromValues(10, 10, 10); // fiksna početna pozicija
    let horizontalRot = 0;          // horizontalna rotacija kamere
    let tilt = 10;                  // pocetan tilt kamere

    const tiltSpeed = 10;          // brzina tiltovanja po kliku
    const rotationSpeed = 2;     // brzina horizontalne rotacije po kliku
    const moveSpeed = 5;

    const worldSize = 1000;         // veličina sveta koji rendujemo


    const lightDir = vec3.fromValues(5.0, 2.0, 1.0);
    const lightColor = vec3.fromValues(1.0, 1.0, 1.0); // white light
    const ambientColor = vec3.fromValues(1.0, 1.0, 1.0);

    // Učitavanje u buffer
    const VAO = WebGLUtils.createVAO(gl, program, vertices, 8, [
        { name: "in_position", size: 3, offset: 0 },
        { name: "in_normal", size: 3, offset: 5 },
    ]);

  //   WebGLUtils.setUniformMatrix4fv(gl, program,
  //   ["u_model", "u_view", "u_projection"],
  //   [modelMat, viewMat, projectionMat]
  // );

    function render() {
        
        // Ograničava tilt da bi se sprečio gimbal lock
        const maxTilt = Math.PI / 2 * 0.99;
        tilt = Math.max(-maxTilt, Math.min(maxTilt, tilt));

        // Forward vektor (pravac u kojem kamera gleda)
        const forward = vec3.fromValues(
            Math.cos(tilt) * Math.sin(horizontalRot),
            Math.sin(tilt),
            Math.cos(tilt) * Math.cos(horizontalRot)
        );

        // Kamera gleda u pravcu vektora forward
        const target = vec3.create();
        vec3.add(target, cameraPosition, forward);

        const up = [0, 1, 0]; // up vektor

        // Skaliranje objekta do horizonta
        mat4.scale(modelMat, modelMat, [worldSize, 1, worldSize]);

        // Postavljena kamera u 3D prostoru
        mat4.lookAt(viewMat, cameraPosition, target, up);

        // Postavlja prespektivu kamere
        mat4.perspective(projectionMat, Math.PI / 4, gl.canvas.width / gl.canvas.height, 0.1, worldSize);

        // Matrica koja spaja sve u jednu
        const mvpMat = mat4.create();
        mat4.multiply(mvpMat, projectionMat, viewMat);
        mat4.multiply(mvpMat, mvpMat, modelMat);// Skaliranje objekta do horizonta
        

        WebGLUtils.setUniformMatrix4fv(gl, program, ["u_mvp"], [mvpMat]);

        WebGLUtils.setUniformMatrix4fv(gl, program,
        ["u_model", "u_view", "u_projection"],
        [modelMat, viewMat, projectionMat]
        );

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(program);
        gl.bindVertexArray(VAO);
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 8);
    }

document.addEventListener('keydown', function (event) {
    const forward = vec3.fromValues(
        Math.cos(tilt) * Math.sin(horizontalRot),
        Math.sin(tilt),
        Math.cos(tilt) * Math.cos(horizontalRot)
    );
    vec3.normalize(forward, forward);

    const upVector = vec3.fromValues(0, 1, 0); // Definiše gde je 'gore' u 3D prostoru

    WebGLUtils.setUniform3f(gl, program,
    ["u_view_direction", "u_ambient_color", "u_light_direction", "u_light_color"],
    [cameraPosition, ambientColor, lightDir, lightColor]
    );

    // Rotacija kamere oko Y-ose
    if (event.key === 'a') {
        horizontalRot += rotationSpeed;
    }
    if (event.key === 'd') {
        horizontalRot -= rotationSpeed;
    }
    // Rotacija kamere oko X-ose
    if (event.key === 'ArrowUp') {
        tilt += rotationSpeed;
    }
    if (event.key === 'ArrowDown') {
        tilt -= rotationSpeed;
    }
    // Pomeranje kamere napred nazad
    if (event.key === 'w') {
        const move = vec3.create();
        vec3.scale(move, forward, moveSpeed);
        vec3.add(cameraPosition, cameraPosition, move);
    }
    if (event.key === 's') {
        const move = vec3.create();
        vec3.scale(move, forward, moveSpeed);
        vec3.sub(cameraPosition, cameraPosition, move);
    }
    // Pomeranje kamere gore dole
    if (event.key === ' ') { 
        const move = vec3.create();
        vec3.scale(move, upVector, tiltSpeed);
        vec3.add(cameraPosition, cameraPosition, move);
    }
    if (event.key === 'Shift') {
        const move = vec3.create();
        vec3.scale(move, upVector, tiltSpeed);
        vec3.sub(cameraPosition, cameraPosition, move);
    }

    console.log("Camera at:", cameraPosition[0], cameraPosition[1], cameraPosition[2]);

    render(); // Ponovo iscrtava scenu sa novom pozicijom/rotacijom kamere
});

    render();
}

main();