#version 300 es
precision highp float;

layout(location = 0) in vec3 i_position;

uniform mat4 mvp_matrix;
// uniform vec2 resolution;
// uniform sampler2D depth_texture;

out vec3 position;

void main() {
    position = i_position; // vec3(i_position, 0.);
    position.y *= 10.;
    gl_Position = mvp_matrix * vec4(position, 1.);
}
