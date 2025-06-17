precision mediump float;

uniform samplerCube u_skybox;
varying vec3 v_texCoord;

void main() {
    gl_FragColor = textureCube(u_skybox, v_texCoord);
}