import { mat4, vec3 } from 'https://cdn.jsdelivr.net/npm/gl-matrix@3.4.0/+esm';
import WebGLUtils from '../WebGLUtils.js';

async function loadCubeMap(gl, paths) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    const faceTargets = [
        gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
    ];

    return new Promise((resolve, reject) => {
        let loadedImages = 0;
        faceTargets.forEach((target, i) => {
            const image = new Image();
            image.src = paths[i];
            image.crossOrigin = "";

            image.onload = () => {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

                loadedImages++;
                if (loadedImages === faceTargets.length) {
                    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    resolve(texture);
                }
            };

            image.onerror = () => {
                reject(new Error(`Failed to load cubemap face: ${paths[i]}`));
            };
        });
    });
}

async function main() {
    const gl = WebGLUtils.initWebGL();
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    WebGLUtils.resizeCanvasToWindow(gl);

    // Camera setup
    const cameraPosition = vec3.fromValues(2, 15, 15);
    let horizontalRot = 0;
    let tilt = 10;
    const rotationSpeed = 2;
    const moveSpeed = 50;
    const worldSize = 1000;

    // Generate grid plane
    const gridSize = 100;
    const scale = 50;
    const vertices = [];
    for (let z = 0; z < gridSize; z++) {
        for (let x = 0; x < gridSize; x++) {
            const u = x / (gridSize - 1);
            const v = z / (gridSize - 1);
            const posX = (u * 2 - 1) * scale;
            const posZ = (v * 2 - 1) * scale;
            vertices.push(posX, 0, posZ, 0, 1, 0, u, v);
        }
    }

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

    // Skybox cube vertices (positions only)
    const skyboxVertices = new Float32Array([
        -1,  1, -1,  -1, -1, -1,   1, -1, -1,
         1, -1, -1,   1,  1, -1,  -1,  1, -1,
        -1, -1,  1,  -1, -1, -1,  -1,  1, -1,
        -1,  1, -1,  -1,  1,  1,  -1, -1,  1,
         1, -1, -1,   1, -1,  1,   1,  1,  1,
         1,  1,  1,   1,  1, -1,   1, -1, -1,
        -1, -1,  1,  -1,  1,  1,   1,  1,  1,
         1,  1,  1,   1, -1,  1,  -1, -1,  1,
        -1,  1, -1,   1,  1, -1,   1,  1,  1,
         1,  1,  1,  -1,  1,  1,  -1,  1, -1,
        -1, -1, -1,  -1, -1,  1,   1, -1, -1,
         1, -1, -1,  -1, -1,  1,   1, -1,  1
    ]);

    // Create skybox shader program
    const skyboxProgram = await WebGLUtils.createProgram(gl, "./skybox/vertex-shader.glsl", "./skybox/fragment-shader.glsl");

    // Create VAO and VBO for skybox
    const skyboxVAO = gl.createVertexArray();
    gl.bindVertexArray(skyboxVAO);

    const skyboxVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, skyboxVBO);
    gl.bufferData(gl.ARRAY_BUFFER, skyboxVertices, gl.STATIC_DRAW);

    const skyboxPosLoc = gl.getAttribLocation(skyboxProgram, "a_position");
    gl.enableVertexAttribArray(skyboxPosLoc);
    gl.vertexAttribPointer(skyboxPosLoc, 3, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);

    // Load cubemap textures
    const skyboxTexture = await loadCubeMap(gl, [
        "./skybox/Daylight Box_Pieces/Daylight Box_Right.jpg",
        "./skybox/Daylight Box_Pieces/Daylight Box_Left.jpg",
        "./skybox/Daylight Box_Pieces/Daylight Box_Top.jpg",
        "./skybox/Daylight Box_Pieces/Daylight Box_Bottom.jpg",
        "./skybox/Daylight Box_Pieces/Daylight Box_Front.jpg",
        "./skybox/Daylight Box_Pieces/Daylight Box_Back.jpg"
    ]);

    // Main shader program for grid
    const program = await WebGLUtils.createProgram(gl, "./vertex-shader.glsl", "./fargment-shader.glsl");
    
    
  
    
    // Create VAO
    const VAO = gl.createVertexArray();
    gl.bindVertexArray(VAO);
    

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "in_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 8 * 4, 0);

    const normalLoc = gl.getAttribLocation(program, "in_normal");
    if (normalLoc !== -1) {
        gl.enableVertexAttribArray(normalLoc);
        gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 8 * 4, 3 * 4);
    }

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    gl.bindVertexArray(null);

    // Uniform locations for grid
    const u_mvpLocation = gl.getUniformLocation(program, "u_mvp");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const waveHeightLocation = gl.getUniformLocation(program, "u_waveHeight");
    const waveSpeedLocation = gl.getUniformLocation(program, "u_waveSpeed");
    const waveSteepnessLocation = gl.getUniformLocation(program, "u_waveSteepness");

    const waveHeight = 0.1;
    const waveSpeed = 1;
    const waveSteepness = 0.05;

    const lightDirectionLocation = gl.getUniformLocation(program, "u_light_direction");
    const lightColorLocation = gl.getUniformLocation(program, "u_light_color");
    const ambientColorLocation = gl.getUniformLocation(program, "u_ambient_color");

    const lightDir = vec3.fromValues(0.0, 5.0, 0.0); // Light direction
    const lightColor = vec3.fromValues(1.0, 1.0, 1.0); // White light color
    const ambientColor = vec3.fromValues(0.2, 0.2, 0.2); // Ambient light color
    const cameraPositionLocation = gl.getUniformLocation(program, "u_cameraPosition");
    vec3.normalize(lightDir, lightDir);

    gl.clearColor(1.0, 0, 0, 0); // Blue background for visibility
    const startTime = performance.now();
    

    const keyState = {};
    document.addEventListener('keydown', (e) => keyState[e.key] = true);
    document.addEventListener('keyup', (e) => keyState[e.key] = false);

    function updateCamera(deltaTime) {
        const forward = vec3.fromValues(
            Math.cos(tilt) * Math.sin(horizontalRot),
            Math.sin(tilt),
            Math.cos(tilt) * Math.cos(horizontalRot)
        );
        vec3.normalize(forward, forward);

        const upVector = vec3.fromValues(0, 1, 0);
        const right = vec3.create();
        vec3.cross(right, forward, upVector);
        vec3.normalize(right, right);

        if (keyState['ArrowLeft']) horizontalRot += rotationSpeed * deltaTime;
        if (keyState['ArrowRight']) horizontalRot -= rotationSpeed * deltaTime;
        if (keyState['ArrowUp']) tilt -= rotationSpeed * deltaTime;
        if (keyState['ArrowDown']) tilt += rotationSpeed * deltaTime;

        if (keyState['w']) vec3.add(cameraPosition, cameraPosition,
            vec3.scale(vec3.create(), forward, moveSpeed * deltaTime));
        if (keyState['s']) vec3.add(cameraPosition, cameraPosition,
            vec3.scale(vec3.create(), forward, -moveSpeed * deltaTime));
        if (keyState[' ']) vec3.add(cameraPosition, cameraPosition,
            vec3.scale(vec3.create(), upVector, moveSpeed * deltaTime));
        if (keyState['Shift']) vec3.add(cameraPosition, cameraPosition,
            vec3.scale(vec3.create(), upVector, -moveSpeed * deltaTime));

        if (keyState['a']) vec3.add(cameraPosition, cameraPosition,
            vec3.scale(vec3.create(), right, -moveSpeed * deltaTime));
        if (keyState['d']) vec3.add(cameraPosition, cameraPosition,
            vec3.scale(vec3.create(), right, moveSpeed * deltaTime));
    }

    let lastFrameTime = performance.now();

    function render() {
        let currentTime = performance.now();

        let deltaTime = (currentTime - lastFrameTime) / 1000;
        lastFrameTime = currentTime;

        updateCamera(deltaTime);
        WebGLUtils.resizeCanvasToWindow(gl);

        // Clear both color and depth buffers
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const forward = vec3.fromValues(
            Math.cos(tilt) * Math.sin(horizontalRot),
            Math.sin(tilt),
            Math.cos(tilt) * Math.cos(horizontalRot)
        );
        const target = vec3.create();
        vec3.add(target, cameraPosition, forward);

        // Projection matrix
        const projectionMat = mat4.create();
        mat4.perspective(projectionMat, Math.PI / 4, gl.canvas.width / gl.canvas.height, 0.1, worldSize);

        // View matrix
        const viewMat = mat4.create();
        mat4.lookAt(viewMat, cameraPosition, target, [0, 1, 0]);

        // --- Render main scene (grid) first ---
        const modelMat = mat4.create();
        mat4.scale(modelMat, modelMat, [2, 1, 2]);

        const mvpMat = mat4.create();
        mat4.multiply(mvpMat, projectionMat, viewMat);
        mat4.multiply(mvpMat, mvpMat, modelMat);

        // Clear with visible color
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.clearColor(0.1, 0.1, 0.1, 1.0); // Dark background for contrast
        gl.useProgram(program);

        const elapsedTime = (currentTime - startTime) / 1000;
        gl.uniform1f(timeLocation, elapsedTime);
        gl.uniformMatrix4fv(u_mvpLocation, false, mvpMat);
        gl.uniform1f(waveHeightLocation, waveHeight);
        gl.uniform1f(waveSpeedLocation, waveSpeed);
        gl.uniform1f(waveSteepnessLocation, waveSteepness);
        gl.uniform3fv(lightDirectionLocation, lightDir);
        gl.uniform3fv(lightColorLocation, lightColor);
        gl.uniform3fv(ambientColorLocation, ambientColor);
        gl.uniform3fv(cameraPositionLocation, cameraPosition);
        
        
        gl.bindVertexArray(VAO);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);

        // --- Render skybox last ---
        gl.depthMask(false); // Disable depth writing
        gl.depthFunc(gl.LEQUAL); // Change depth test

        gl.useProgram(skyboxProgram);

        // Remove translation from view matrix for skybox
        const viewNoTranslate = mat4.clone(viewMat);
        viewNoTranslate[12] = 0;
        viewNoTranslate[13] = 0;
        viewNoTranslate[14] = 0;

        // Skybox MVP = projection * viewNoTranslate
        const skyboxMVP = mat4.create();
        mat4.multiply(skyboxMVP, projectionMat, viewNoTranslate);

        const u_skyboxMVP = gl.getUniformLocation(skyboxProgram, "u_mvp");
        gl.uniformMatrix4fv(u_skyboxMVP, false, skyboxMVP);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
        const u_skyboxSampler = gl.getUniformLocation(skyboxProgram, "u_skybox");
        gl.uniform1i(u_skyboxSampler, 0);

        gl.bindVertexArray(skyboxVAO);
        gl.drawArrays(gl.TRIANGLES, 0, skyboxVertices.length / 3);
        gl.bindVertexArray(null);

        // Restore depth settings
        gl.depthFunc(gl.LESS);
        gl.depthMask(true);

        requestAnimationFrame(render);
    }

    render();
}

main();