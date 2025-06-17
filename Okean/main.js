import { mat4 } from 'https://cdn.jsdelivr.net/npm/gl-matrix@3.4.0/+esm';
import WebGLUtils from '../WebGLUtils.js';

async function main() {
    const gl = WebGLUtils.initWebGL();
    if (!gl) {
        console.error('WebGL initialization failed');
        return;
    }
    gl.enable(gl.DEPTH_TEST);
    WebGLUtils.resizeCanvasToWindow(gl);

    // Generate grid plane (10x10 = 100 vertices)
    const gridSize = 10;
    const scale = 5;
    const vertices = [];
    
    for (let z = 0; z < gridSize; z++) {
        for (let x = 0; x < gridSize; x++) {
            const u = x / (gridSize - 1);
            const v = z / (gridSize - 1);
            const posX = (u * 2 - 1) * scale;
            const posZ = (v * 2 - 1) * scale;
            
            vertices.push(
                posX, 0, posZ,    // Position
                0, 1, 0,          // Normal
                u, v               // TexCoord
            );
        }
    }

    // Generate indices for triangles
    const indices = [];
    for (let z = 0; z < gridSize - 1; z++) {
        for (let x = 0; x < gridSize - 1; x++) {
            const topLeft = z * gridSize + x;
            const topRight = topLeft + 1;
            const bottomLeft = (z + 1) * gridSize + x;
            const bottomRight = bottomLeft + 1;
            
            indices.push(topLeft, bottomLeft, topRight);
            indices.push(topRight, bottomLeft, bottomRight);
        }
    }

    const program = await WebGLUtils.createProgram(gl, "./vertex-shader.glsl", "./fargment-shader.glsl");
    if (!program) {
        console.error('Program creation failed');
        return;
    }

    // Create VAO
    const VAO = gl.createVertexArray();
    gl.bindVertexArray(VAO);

    // Create and bind vertex buffer
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Position attribute
    const posLoc = gl.getAttribLocation(program, "in_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 8 * 4, 0);

    // Create and bind index buffer
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // Unbind VAO
    gl.bindVertexArray(null);

    // Get uniform locations
    const u_mvpLocation = gl.getUniformLocation(program, "u_mvp");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const waveHeightLocation = gl.getUniformLocation(program, "u_waveHeight");
    const waveSpeedLocation = gl.getUniformLocation(program, "u_waveSpeed");
    const waveSteepnessLocation = gl.getUniformLocation(program, "u_waveSteepness");

    const waveHeight = 0.08;
    const waveSpeed = 3;
    const waveSteepness = 0.3;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    const startTime = Date.now();

    function render() {
        WebGLUtils.resizeCanvasToWindow(gl);
        
        // Create matrices
        const projectionMat = mat4.create();
        mat4.perspective(
            projectionMat,
            Math.PI / 4,
            gl.canvas.width / gl.canvas.height,
            0.1,
            100.0
        );
        
        const viewMat = mat4.create();
        mat4.lookAt(viewMat, [0, 3, 5], [0, 0, 0], [0, 1, 0]);
        
        const modelMat = mat4.create();
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
        
        // Bind VAO (which includes the element array buffer)
        gl.bindVertexArray(VAO);
        
        // Draw using indices
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
        
        // Unbind VAO
        gl.bindVertexArray(null);
        
        requestAnimationFrame(render);
    }

    render();
}

main();