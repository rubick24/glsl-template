#version 300 es
precision highp float;

// uniform sampler2D depth_texture;

const vec3 light_direction = normalize(vec3(1., 1., 1.));

in vec3 position;
out vec4 fragColor;

void main() {
    // vec2 uv = position.xz;

    vec3 normal = normalize(cross(dFdx(position), dFdy(position)));
    float diff = dot(normal, light_direction);

    fragColor = vec4(vec3(0.4 + diff * 0.6), 1.);
}
