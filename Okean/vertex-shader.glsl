#version 300 es
precision mediump float;

uniform mat4 u_mvp;
uniform float u_time;
uniform float u_waveHeight;
uniform float u_waveSpeed;
uniform float u_waveSteepness;

in vec3 in_position;

// Simple pseudo-random function for noise
float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

// Fractional Brownian Motion (fBm) for wave surface variation
float fBm(vec2 p, int octaves) {
    float total = 0.0;
    float frequency = 1.0;
    float amplitude = 0.5;
    float maxAmplitude = 0.0;
    
    for (int i = 0; i < octaves; i++) {
        total += amplitude * rand(p * frequency);
        maxAmplitude += amplitude;
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    
    return total / maxAmplitude;
}

void main() {
    // Parametri talasni
    float amplitude = u_waveHeight;
    float speed = u_waveSpeed * 0.5;
    float steepness = u_waveSteepness;
    
    // Primary wave direction (can be made uniform for directional waves)
    vec2 waveDir1 = normalize(vec2(1.0, 0.5));
    vec2 waveDir2 = normalize(vec2(-0.7, 0.3));
    vec2 waveDir3 = normalize(vec2(0.3, -0.9));
    
    // Position in wave space
    vec2 pos = in_position.xz;
    
    // Gerstner wave function - creates characteristic wave peaks
    vec3 gerstnerOffset = vec3(0.0);
    
    // First wave
    float waveFactor1 = dot(waveDir1, pos) * 4.0 + u_time * speed;
    float sinWave1 = sin(waveFactor1);
    float cosWave1 = cos(waveFactor1);
    
    gerstnerOffset.y += amplitude * sinWave1;
    
    // Second wave
    float waveFactor2 = dot(waveDir2, pos) * 6.0 + u_time * speed * 1.3;
    float sinWave2 = sin(waveFactor2);
    float cosWave2 = cos(waveFactor2);

    gerstnerOffset.y += amplitude * sinWave2 * 0.7;
    
    // Third wave
    float waveFactor3 = dot(waveDir3, pos) * 8.0 + u_time * speed * 0.7;
    float sinWave3 = sin(waveFactor3);
    float cosWave3 = cos(waveFactor3);
   
    gerstnerOffset.y += amplitude * sinWave3 * 0.5;
    
    // Add surface noise for realism
    float noise = fBm(pos * 2.0 + u_time * 0.1, 4);
    vec3 noiseOffset = vec3(0.0, noise * 0.05, 0.0);
    
    // Combine wave displacement
    vec3 displacedPosition = in_position + gerstnerOffset + noiseOffset;
    
    gl_Position = u_mvp * vec4(displacedPosition, 1.0);
}