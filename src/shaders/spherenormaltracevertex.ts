export const sphereNormalTraceVertexSource =
    `#version 300 es
precision highp float;
precision highp int;
layout(location = 0) in vec3 vertex;
void main() {
    gl_Position = vec4(vertex, 1.0);
}`;