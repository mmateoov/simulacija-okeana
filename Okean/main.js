import { mat4, vec3 } from 'https://cdn.jsdelivr.net/npm/gl-matrix@3.4.0/+esm';
import WebGLUtils from '../WebGLUtils.js';

async function main() {
    /** @type {WebGLRenderingContext} */
    const gl = WebGLUtils.initWebGL();
    WebGLUtils.resizeCanvasToWindow(gl); // Prilagođava veličinu kanvasa na veličinu prozora

    const vertices = await WebGLUtils.loadOBJ("../cube.obj", true); // ucitavanje tacaka iz obj fajla
    const program = await WebGLUtils.createProgram(gl, "./vertex-shader.glsl", "./fargment-shader.glsl"); // učitava šejdere

    // Kamera
    const cameraPosition = vec3.fromValues(0, 0, 10); // fiksna početna pozicija
    let horizontalRot = 0;          // horizontalna rotacija kamere
    let tilt = 10;                  // pocetan tilt kamere

    const tiltSpeed = 0.2;          // brzina tiltovanja po kliku
    const rotationSpeed = 0.02;     // brzina horizontalne rotacije po kliku
    const moveSpeed = 0.2

    const worldSize = 1000;         // veličina sveta koji rendujemo

    // Učitavanje u buffer
    const VAO = WebGLUtils.createVAO(gl, program, vertices, 8, [
        { name: "in_position", size: 3, offset: 0 },
    ]);

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
        const modelMat = mat4.create();
        mat4.scale(modelMat, modelMat, [worldSize, 1, worldSize]);

        // Postavljena kamera u 3D prostoru
        const viewMat = mat4.create();
        mat4.lookAt(viewMat, cameraPosition, target, up);

        // Postavlja prespektivu kamere
        const projectionMat = mat4.create();
        mat4.perspective(projectionMat, Math.PI / 4, gl.canvas.width / gl.canvas.height, 0.1, worldSize);

        // Matrica koja spaja sve u jednu
        const mvpMat = mat4.create();
        mat4.multiply(mvpMat, projectionMat, viewMat);
        mat4.multiply(mvpMat, mvpMat, modelMat);

        WebGLUtils.setUniformMatrix4fv(gl, program, ["u_mvp"], [mvpMat]);

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

    render(); // Ponovo iscrtava scenu sa novom pozicijom/rotacijom kamere
});

    render();
}

main();
