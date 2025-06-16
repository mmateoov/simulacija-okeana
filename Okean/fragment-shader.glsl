#version 300 es
precision mediump float;

uniform vec3 u_view_direction;

uniform vec3 u_ambient_color;
uniform vec3 u_light_direction;
uniform vec3 u_light_color;

in vec3 v_normal;
out vec4 out_color;

void main() {
	vec3 ambient = u_ambient_color;

	float diffuseStrength = max(dot(v_normal, u_light_direction), 0.0);
	vec3 diffuse = diffuseStrength * u_light_color;

	vec3 viewSource = normalize(u_view_direction);
	vec3 reflectDir = reflect(-u_light_direction, v_normal);
	float specularStrength = max(dot(viewSource, reflectDir), 0.0);
	specularStrength = pow(specularStrength, 8.0);
	vec3 specular = specularStrength * u_light_color;

	vec3 lighting = ambient + diffuse + specular;

	vec3 modelColor = vec3(0.24f, 0.79f, 0.94f);

	out_color = vec4(lighting * modelColor, 1.0);
}