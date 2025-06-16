Key priorities:

1. Infinite ocean that extends to the horizon.

2. Functional waves (at least moving waves that look like water).

3. Minimal but acceptable visual quality (lighting, fog for depth).

We'll break the project into three parallel tracks:

Track 1: Core Infrastructure and Geometry (Person A)

Track 2: Wave Simulation and Shaders (Person B)

Track 3: Lighting, Fog, and Integration (Person C)

Here's a detailed breakdown:

### Track 1: Core Infrastructure and Geometry (Person A)

**Goal:** Set up the WebGL context, create an expanding grid for the ocean surface that appears infinite, and handle camera setup.

**Day 1:**

1. Create the HTML structure with a canvas.

2. Initialize WebGL context and handle resize events.

3. Design a radial grid geometry that is denser near the camera and sparser towards the horizon. This will give the illusion of an infinite ocean without too many vertices.

- The grid should be made of triangles.

- The grid should extend to the far plane (horizon).

4. Set up a simple camera that looks at the ocean (fixed for now, can be orbiting if time permits).

**Day 2:**

1. Integrate with the wave shader (from Person B) by passing the grid geometry to the shader program.

2. Help with debugging and performance optimization.

### Track 2: Wave Simulation and Shaders (Person B)

**Goal:** Create the vertex and fragment shaders that will animate the ocean surface with waves.

**Day 1:**

1. Write a vertex shader that displaces the grid vertices vertically (y-direction) using a sum of sine waves to simulate waves.

- Use multiple waves with different directions, amplitudes, and frequencies.

- Example: `y = A1 * sin(D1.x*x + D1.y*z + time*S1) + A2 * sin(D2.x*x + D2.y*z + time*S2) + ...`

2. Calculate normals in the vertex shader (or fragment shader) for lighting (to be used by Person C).

- The normal can be computed by taking the cross product of the partial derivatives of the position.

**Day 2:**

1. Refine the wave parameters to look more natural.

2. Integrate the shader with the geometry from Person A and the lighting from Person C.

3. Optimize the shader for performance.

### Track 3: Lighting, Fog, and Integration (Person C)

**Goal:** Add lighting to the waves to make them look three-dimensional and add fog so that the horizon blends with the sky.

**Day 1:**

1. Design a simple directional light (sun) and implement diffuse lighting in the fragment shader.

- Use the normals calculated by Person B.

2. Implement a fog effect that blends the ocean color into the sky color at the horizon.

- Exponential fog: `fogFactor = exp(-density * distance)`

- Then mix the ocean color with the sky color based on fogFactor.

**Day 2:**

1. Integrate the lighting and fog with the shaders from Person B.

2. Tune the fog and lighting parameters for a realistic look.

3. Set up a simple sky (either with a clear color or a gradient).

4. Help with integration and debugging.

### Common Steps and Integration Points

- **Day 1 End:**

- Person A should have the grid geometry rendering (without waves) and the WebGL context set up.

- Person B should have a standalone shader that can create waves (can be tested on a flat grid).

- Person C should have a shader that applies lighting and fog (can be tested on a simple geometry).

- **Day 2:**

- Integrate all three parts:

1. Person A's grid is used as input.

2. Person B's wave displacement and normal calculation in the vertex shader.

3. Person C's lighting and fog in the fragment shader.

- Tune parameters together (wave amplitude, speed, fog density, light direction).

### Minimalist Features

- **Geometry:** Radial grid (about 10 rings, each ring with increasing segment count and radius) to cover from near to far.

- **Waves:** 2-3 sine waves with different directions and parameters.

- **Lighting:** One directional light (sun) with diffuse component only.

- **Fog:** Exponential fog to blend with a solid sky color.

### Code Structure (Agreed upon by all)

- **Vertex Shader:**

- Attributes: `a_position` (x, z, and we compute y)

- Uniforms: `u_time`, `u_wave_params` (amplitudes, directions, speeds), `u_modelViewMatrix`, `u_projectionMatrix`

- Output: `v_normal` (to fragment shader), `v_position` (world position)

- **Fragment Shader:**

- Uniforms: `u_lightDirection`, `u_fogDensity`, `u_skyColor`, `u_waterColor`

- Input: `v_normal`, `v_position`

We'll use a common coordinate system:

- X: right, Y: up, Z: forward.

### Day 1 Deliverables for Each Person

**Person A:**

- A WebGL program that renders a radial grid (as a set of triangles) that extends to the horizon.

**Person B:**

- A vertex shader that takes a grid and animates it with waves (with normals calculation).

**Person C:**

- A fragment shader that computes diffuse lighting and exponential fog.

### Day 2 Integration Plan

1. Combine the shaders into one program.

2. Pass the grid from Person A to the shader program.

3. Set up the camera and projection matrices (Person A).

4. Set up the wave parameters, light direction, and fog (Person B and C together).

We'll use a single JavaScript file and one pair of shaders. We can use a shared Git repository to merge code at the end of Day 1 and during Day 2.

Let's start coding accordingly and meet at the end of each day to integrate.