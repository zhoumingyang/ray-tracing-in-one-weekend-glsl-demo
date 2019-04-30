const ray: string =
    `struct Ray {
        vec3 origin;
        vec3 direction;
    };`;

const pointAtParameter: string =
    `vec3 pointAtParameter(Ray r, float t) {
        return r.origin + t * r.direction;
    }`;

export const Ray: any = {
    ray,
    pointAtParameter
};