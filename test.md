WebGLUtils.setUniformMatrix4fv(gl, program,
    ["u_model", "u_view", "u_projection"],
    [modelMat, viewMat, projectionMat]
  );

  const lightDir = vec3.fromValues(5.0, 2.0, 1.0);
  const lightColor = vec3.fromValues(1.0, 1.0, 1.0); // white light
  const ambientColor = vec3.fromValues(0.1, 0.1, 0.1);

  WebGLUtils.setUniform3f(gl, program,
    ["u_view_direction", "u_ambient_color", "u_light_direction", "u_light_color"],
    [cameraPos, ambientColor, lightDir, lightColor]
  );

  const VAO = WebGLUtils.createVAO(gl, program, vertices, 8, [
    { name: "in_position", size: 3, offset: 0 },
    { name: "in_normal", size: 3, offset: 5 },
  ]);