#version 300 es
precision mediump float;

uniform mat4 u_mvp;
uniform float u_time;
uniform float u_waveHeight;
uniform float u_waveSpeed;
uniform float u_waveSteepness;

in vec3 in_position;
in vec3 in_normal;
in vec2 in_texCoord;

out vec3 v_position;
out vec3 v_normal;
out vec2 v_texCoord;

// Gerstner wave function with derivatives
void gerstnerWave(in vec2 pos, in vec2 dir, in float amplitude, in float steepness, in float frequency, in float speed,
                  out vec3 displacement, out vec3 dD_dx, out vec3 dD_dz) {
    float phase = frequency * dot(dir, pos) + u_time * speed;
    float c = cos(phase);
    float s = sin(phase);
    float QA = steepness * amplitude;

    // Displacement
    displacement.x = QA * dir.x * c;
    displacement.y = amplitude * s;
    displacement.z = QA * dir.y * c;

    // Derivatives
    float dPhase_dx = frequency * dir.x;
    float dPhase_dz = frequency * dir.y;
    
    dD_dx.x = -QA * dir.x * dPhase_dx * s;
    dD_dx.y = amplitude * dPhase_dx * c;
    dD_dx.z = -QA * dir.y * dPhase_dx * s;
    
    dD_dz.x = -QA * dir.x * dPhase_dz * s;
    dD_dz.y = amplitude * dPhase_dz * c;
    dD_dz.z = -QA * dir.y * dPhase_dz * s;
}

void main() {
    // Wave parameters
    float amplitude = u_waveHeight;
    float speed = u_waveSpeed;
    float steepness = u_waveSteepness;
    
    // Wave directions
    vec2 waveDir1 = normalize(vec2(1.0, 0.5));
    vec2 waveDir2 = normalize(vec2(-0.7, 0.3));
    vec2 waveDir3 = normalize(vec2(0.3, -0.9));
    
    // Initialize displacement and derivatives
    vec3 position = in_position;
    vec3 dD_dx = vec3(0.0);
    vec3 dD_dz = vec3(0.0);
    vec3 disp;

    // Accumulate wave contributions
    vec3 dD1_dx, dD1_dz;
    gerstnerWave(in_position.xz, waveDir1, amplitude, steepness, 4.0, speed, disp, dD1_dx, dD1_dz);
    position += disp;
    dD_dx += dD1_dx;
    dD_dz += dD1_dz;
    
    vec3 dD2_dx, dD2_dz;
    gerstnerWave(in_position.xz, waveDir2, amplitude * 0.7, steepness * 0.8, 6.0, speed * 1.3, disp, dD2_dx, dD2_dz);
    position += disp;
    dD_dx += dD2_dx;
    dD_dz += dD2_dz;
    
    vec3 dD3_dx, dD3_dz;
    gerstnerWave(in_position.xz, waveDir3, amplitude * 0.5, steepness * 0.6, 8.0, speed * 0.7, disp, dD3_dx, dD3_dz);
    position += disp;
    dD_dx += dD3_dx;
    dD_dz += dD3_dz;

    // Calculate tangent and binormal vectors
    vec3 tangent = vec3(1.0 + dD_dx.x, dD_dx.y, dD_dx.z);
    vec3 binormal = vec3(dD_dz.x, dD_dz.y, 1.0 + dD_dz.z);
    
    // Calculate normal from cross product
    vec3 normal = normalize(cross(binormal, tangent));
    
    // Pass data to fragment shader
    v_position = position;
    v_normal = normal;
    v_texCoord = in_texCoord;
    
    gl_Position = u_mvp * vec4(position, 1.0);
}