export const sphereObjectsTraceFragmentSource: string =
    `#version 300 es
precision highp float;
precision highp int;
uniform sampler2D diffuse;
out vec4 fragColor;
#define SPHERENUM 2
#define MAXFLOATNUM 3.402823e+38 //C++ FLT_MAX

struct hit_record {
    float t;
    vec3 p;
    vec3 normal;
};

struct Ray {
    vec3 origin;
    vec3 direction;
};

vec3 pointAtParameter(Ray r, float t) {
    return r.origin + t * r.direction;
}

struct Sphere {
    vec3 center;
    float radius;
};

Sphere spheres[SPHERENUM];

bool hitSphere(Ray r, Sphere sphere, float t_min, float t_max, inout hit_record rec) {
    vec3 oc = r.origin - sphere.center;
    float a = dot(r.direction, r.direction);
    float b = 2.0 * dot(oc, r.direction);
    float c = dot(oc, oc) - sphere.radius * sphere.radius;
    float discriminant = b * b - 4.0 * a *c;
    if(discriminant > 0.0) {
        float temp = (-b-sqrt(b*b-a*c)) / a;
        if(temp < t_max && temp > t_min) {
            rec.t = temp;
            rec.p = pointAtParameter(r, temp);
            rec.normal = (rec.p - sphere.center) / sphere.radius;
            return true;
        }
        temp = (-b+sqrt(b*b-a*c)) / a;
        if(temp < t_max && temp > t_min) {
            rec.t = temp;
            rec.p = pointAtParameter(r, temp);
            rec.normal = (rec.p - sphere.center) / sphere.radius;
            return true;
        }
    }
    return false;
}

vec3 calculateColor(Ray r) {
    hit_record tmpRec;
    bool hitAnything = false;
    float closet = MAXFLOATNUM;
    for(int i = 0; i < SPHERENUM; i++) {
        if(hitSphere(r, spheres[i], 0.0, closet, tmpRec)) {
            hitAnything = true;
            closet = tmpRec.t;
        }
    }
    if(hitAnything) {
        return 0.5 * vec3(tmpRec.normal.x + 1.0, tmpRec.normal.y + 1.0, tmpRec.normal.z + 1.0);
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
    spheres[0] = Sphere(vec3(0.0, 0.0, 0.0), 0.5);
    spheres[1] = Sphere(vec3(0.0, -100.5, 0.0), 100.0);
    vec4 curSceneColor = vec4(calculateColor(r).rgb, 1.0);
    vec4 finalColor = curSceneColor;
    fragColor = finalColor;
}`;