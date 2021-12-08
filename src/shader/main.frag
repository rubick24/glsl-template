#version 300 es
precision highp float;

uniform float time;
uniform float fovY;
uniform vec2 resolution;
uniform vec2 mouse;
uniform vec3 cameraPosition;
uniform mat4 viewMatrixInverse;

uniform sampler2D textTexture;

in vec2 fragCoord;
out vec4 fragColor;

const float PI = 3.1415926;

const float edge = 0.5;
const float delta = 0.005;
const vec4 u_color = vec4(0., 0., 0., 1.);

void main() {
    vec2 uv = fragCoord / resolution;
    vec2 p = uv * 2. - 1.;
    p.x *= resolution.x / resolution.y;

    float c = texture(textTexture, uv).r;

    float alpha = smoothstep(edge - delta, edge + delta, c);
    fragColor = vec4(u_color.rgb, alpha * u_color.a);

    // fragColor = vec4(vec3(1. - length(p)), 1.);
}
