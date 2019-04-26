export const renderFragmentSource: string =
    `#version 300 es
precision highp float;
precision highp int;
in vec2 texCoord;
uniform sampler2D diffuse;
out vec4 fragColor;
void main() {
    fragColor = texture(diffuse, texCoord);
}`;