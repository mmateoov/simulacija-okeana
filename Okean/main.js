import { mat4, vec3 } from 'https://cdn.jsdelivr.net/npm/gl-matrix@3.4.0/+esm';
import WebGLUtils from '../WebGLUtils.js';

async function main() {
    
    const gl = WebGLUtils.initWebGL();    
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    WebGLUtils.resizeCanvasToWindow(gl);

    // Camera setup
    const cameraPosition = vec3.fromValues(2, 15, 15); // Adjusted to be closer to plane
    let horizontalRot = 0;
    let tilt = 10;
    const tiltSpeed = 0.2;
    const rotationSpeed = 2;
    const moveSpeed = 50;
    const worldSize = 1000;

    // Generate grid plane
    const gridSize = 100;
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
    

    // Generate indices
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
   

    // Shader setup
    
    const program = await WebGLUtils.createProgram(gl, "./vertex-shader.glsl", "./fargment-shader.glsl");
    
    
  
    
    // Create VAO
    const VAO = gl.createVertexArray();
    gl.bindVertexArray(VAO);
    

    // Vertex buffer
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Position attribute
    const posLoc = gl.getAttribLocation(program, "in_position");
    
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 8 * 4, 0);

    // Normal attribute
    const normalLoc = gl.getAttribLocation(program, "in_normal");
    if (normalLoc === -1) console.warn("in_normal attribute not found - lighting won't work");
    else {
        gl.enableVertexAttribArray(normalLoc);
        gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 8 * 4, 3 * 4);
    }

    // Index buffer
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    gl.bindVertexArray(null);

    // Get uniforms
    const u_mvpLocation = gl.getUniformLocation(program, "u_mvp");
    
    
    const timeLocation = gl.getUniformLocation(program, "u_time");
    
    
    const waveHeightLocation = gl.getUniformLocation(program, "u_waveHeight");
    const waveSpeedLocation = gl.getUniformLocation(program, "u_waveSpeed");
    const waveSteepnessLocation = gl.getUniformLocation(program, "u_waveSteepness");

    const waveHeight = 0.08;
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
    

    // Key state tracking
    const keyState = {};
    document.addEventListener('keydown', (e) => {
        keyState[e.key] = true;
        console.log(`Key pressed: ${e.key}`);
    });
    document.addEventListener('keyup', (e) => keyState[e.key] = false);

    function updateCamera(deltaTime) {
        // Calculate forward vector
        const forward = vec3.fromValues(
            Math.cos(tilt) * Math.sin(horizontalRot),
            Math.sin(tilt),
            Math.cos(tilt) * Math.cos(horizontalRot)
        );
        vec3.normalize(forward, forward);
        
        // Calculate right vector
        const upVector = vec3.fromValues(0, 1, 0);
        const right = vec3.create();
        vec3.cross(right, forward, upVector);
        vec3.normalize(right, right);
        
        // Handle rotation
        if (keyState['a']) horizontalRot += rotationSpeed * deltaTime;
        if (keyState['d']) horizontalRot -= rotationSpeed * deltaTime;
        if (keyState['ArrowUp']) tilt += rotationSpeed * deltaTime;
        if (keyState['ArrowDown']) tilt -= rotationSpeed * deltaTime;
        
        // Handle movement
        if (keyState['w']) vec3.add(cameraPosition, cameraPosition, 
            vec3.scale(vec3.create(), forward, moveSpeed * deltaTime));
        if (keyState['s']) vec3.add(cameraPosition, cameraPosition, 
            vec3.scale(vec3.create(), forward, -moveSpeed * deltaTime));
        if (keyState[' ']) vec3.add(cameraPosition, cameraPosition, 
            vec3.scale(vec3.create(), upVector, moveSpeed * deltaTime));
        if (keyState['Shift']) vec3.add(cameraPosition, cameraPosition, 
            vec3.scale(vec3.create(), upVector, -moveSpeed * deltaTime));
    }

    let lastFrameTime = performance.now();
    
    function render() {
        let currentTime = performance.now();

        let deltaTime = (currentTime - lastFrameTime) / 1000;
        lastFrameTime = currentTime;
        
        updateCamera(deltaTime);
        WebGLUtils.resizeCanvasToWindow(gl);
        
        // Camera forward vector
        const forward = vec3.fromValues(
            Math.cos(tilt) * Math.sin(horizontalRot),
            Math.sin(tilt),
            Math.cos(tilt) * Math.cos(horizontalRot)
        );
        const target = vec3.create();
        vec3.add(target, cameraPosition, forward);
        
       
        
        // Matrices
        const projectionMat = mat4.create();
        mat4.perspective(
            projectionMat,
            Math.PI / 4,
            gl.canvas.width / gl.canvas.height,
            0.1,
            worldSize
        );
        
        const viewMat = mat4.create();
        mat4.lookAt(viewMat, cameraPosition, target, [0, 1, 0]);
        
        const modelMat = mat4.create();
        const mvpMat = mat4.create();
        mat4.multiply(mvpMat, projectionMat, viewMat);
        mat4.multiply(mvpMat, mvpMat, modelMat);
        
        

        // Clear with visible color
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.clearColor(0.1, 0.1, 0.1, 1.0); // Dark background for contrast
        gl.useProgram(program);
        
        // Set uniforms only if locations exist
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
        
        // Draw call with validation
        const errorBeforeDraw = gl.getError();
        if (errorBeforeDraw !== gl.NO_ERROR) {
            console.error(`WebGL error before draw: ${errorBeforeDraw}`);
        }
        
        console.log(`Drawing ${indices.length} indices`);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
        
        const errorAfterDraw = gl.getError();
        if (errorAfterDraw !== gl.NO_ERROR) {
            console.error(`WebGL error after draw: ${errorAfterDraw}`);
        }
        
        requestAnimationFrame(render);
    }

    render();
}

main();