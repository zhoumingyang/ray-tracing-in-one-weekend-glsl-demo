const drand48: string =
    `float drand48(vec2 seed) {
        return 2.000 * fract(sin(dot(seed.xy, vec2(12.9898, 78.233))) * 43758.5453) - 1.000;
    }`;

const random_in_unit_dist: string =
    `vec3 random_in_unit_dist(vec2 seed) {
        vec3 p;
        int n = 0;
        do {
            p = vec3(drand48(seed.xy), drand48(seed.yx), 0);
            n++;
        }while(dot(p, p) >= 1.0 && n < 3);
        return p;
    }`;

const random_in_unit_sphere: string =
    `vec3 random_in_unit_sphere(vec3 p) {
        int n = 0;
        do {
            p = vec3(drand48(p.xy), drand48(p.zy), drand48(p.xz));
            n++;
        }while(dot(p, p) >= 1.0 && n < 3);
        return p;
    }`;

const rand: string =
    `float rand( inout uvec2 seed ) {
        seed += uvec2(1);
        uvec2 q = 1103515245U * ( (seed >> 1U) ^ (seed.yx) );
        uint  n = 1103515245U * ( (q.x) ^ (q.y >> 3U) );
        return float(n) * (1.0 / float(0xffffffffU));
    }`;

const randomSphereDirection: string =
    `vec3 randomSphereDirection(inout uvec2 seed) {
        vec2 r = vec2(rand(seed), rand(seed)) * TWO_PI;
        return vec3( sin(r.x) * vec2(sin(r.y), cos(r.y)), cos(r.x) );
    }`;

const randomDirectionInHemisphere: string =
    `vec3 randomDirectionInHemisphere( vec3 nl, inout uvec2 seed ) {
        float up = rand(seed); 
        float over = sqrt(1.0 - up * up); //uniform distribution
        float around = rand(seed) * TWO_PI;
        vec3 u = normalize( cross( abs(nl.x) > 0.1 ? vec3(0, 1, 0) : vec3(1, 0, 0), nl ) );
        vec3 v = cross(nl, u);
        return normalize(cos(around) * over * u + sin(around) * over * v + up * nl); //uniform distribution
    }`;

const randomCosWeightedDirectionInHemisphere: string =
    `vec3 randomCosWeightedDirectionInHemisphere( vec3 nl, inout uvec2 seed ) {
        vec2 uv = vec2(rand(seed), rand(seed));
        float r1 = TWO_PI * uv.x;
        float r2 = uv.y;
        float r2s = sqrt(r2);
        vec3 u = normalize( cross( abs(nl.x) > 0.1 ? vec3(0, 1, 0) : vec3(1, 0, 0), nl ) );
        vec3 v = cross(nl, u);
        return normalize(u * cos(r1) * r2s + v * sin(r1) * r2s + nl * sqrt(1.0 - r2));
    }`;

export const RandomFunction: any = {
    drand48,
    random_in_unit_dist,
    random_in_unit_sphere,
    rand,
    randomSphereDirection,
    randomDirectionInHemisphere,
    randomCosWeightedDirectionInHemisphere
};