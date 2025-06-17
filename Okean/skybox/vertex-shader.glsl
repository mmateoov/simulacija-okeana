attribute vec3 a_position;

uniform mat4 u_mvp;

varying vec3 v_texCoord;

void main() {
    v_texCoord = a_position;
    gl_Position = u_mvp * vec4(a_position, 1.0);
    gl_Position.z = gl_Position.w; // Set depth to maximum
}