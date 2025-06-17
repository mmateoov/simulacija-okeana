#version 300 es
precision mediump float;

out vec4 out_color;

void main() {
	vec3 color = vec3(0.09f, 0.4f, 0.85f);
	out_color = vec4(color, 1.0f);
}