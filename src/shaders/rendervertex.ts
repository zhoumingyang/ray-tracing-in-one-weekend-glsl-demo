export const renderVertexSource: string =
    `#version 300 es
precision highp float;
precision highp int;
layout(location = 0) in vec3 vertex;
out vec2 texCoord;
void main() {
    texCoord = vertex.xy * 0.5 + 0.5;
    gl_Position = vec4(vertex, 1.0);
}`;