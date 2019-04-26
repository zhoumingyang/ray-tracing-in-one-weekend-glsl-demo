export const sphereNormalTraceFragmentSource: string =
    `#version 300 es
precision highp float;
precision highp int;
uniform sampler2D diffuse;
out vec4 fragColor;

struct Ray {
    vec3 origin;
    vec3 direction;
};

vec3 pointAtParameter(Ray r, float t) {
    return r.origin + t * r.direction;
}

float hit_sphere(vec3 center, float radius, Ray r) {
    vec3 oc = r.origin - center;
    float a = dot(r.direction, r.direction);
    float b = 2.0 * dot(oc, r.direction);
    float c = dot(oc, oc) - radius * radius;
    float discriminant = b * b - 4.0 * a *c;
    if(discriminant < 0.0) {
        return -1.0;
    }
    return (-b - sqrt(discriminant)) / (2.0 * a);
}

vec3 calculateColor(Ray r) {
    vec3 sphereCenter = vec3(0.0, 0.0, 0.0);
    float radius = 0.5;
    float param = hit_sphere(sphereCenter, radius, r);
    if(param > 0.0) {
        vec3 normal = pointAtParameter(r, param) - sphereCenter;
        vec3 N = normalize(normal);
        return 0.5 * vec3(N.x + 1.0, N.y + 1.0, N.z + 1.0);
    }
    vec3 unitDirection = normalize(r.direction);
    float t = 0.5 * (unitDirection.y + 1.0);
    return (1.0 - t) * vec3(1.0, 1.0, 1.0) + t * vec3(0.5, 0.7, 1.0);
}

void main() {
    vec2 uv = vec2(gl_FragCoord.x / 400.0, gl_FragCoord.y / 200.0);
    vec3 rayPosition = vec3(0.0, 0.0, 1.0);
    float u = uv.x;
    float v = uv.y;
    vec3 camForward = vec3(-2.0, -1.0, -1.0);
    vec3 camRight = vec3(4.0, 0.0, 0.0);
    vec3 camUp = vec3(0.0, 2.0, 0.0);
    vec3 rayDir = normalize( camRight * u + camUp * v + camForward );
    Ray r = Ray(rayPosition, rayDir);
    vec4 curSceneColor = vec4(calculateColor(r).rgb, 1.0);
    vec4 finalColor = curSceneColor;
    fragColor = finalColor;
}`;