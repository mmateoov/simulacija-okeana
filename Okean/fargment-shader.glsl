#version 300 es
precision mediump float;

out vec4 out_color;

void main() {
	vec3 color = vec3(0.0f, 0.64f, 1.0f);
	out_color = vec4(color, 1.0f);
}