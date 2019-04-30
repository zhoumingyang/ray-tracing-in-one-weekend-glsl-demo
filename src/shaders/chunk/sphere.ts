const sphere: string =
    ` struct Sphere {
        vec3 center;
        float radius;
        Material material;
    };`;

const hitSphere: string =
    `bool hitSphere(Ray r, Sphere sphere, float t_min, float t_max, inout hitRecord rec) {
        vec3 oc = r.origin - sphere.center;
        float a = dot(r.direction, r.direction);
        float b = dot(oc, r.direction);
        float c = dot(oc, oc) - sphere.radius * sphere.radius;
        float discriminant = b * b - a * c;
        if(discriminant > 0.0) {
            float temp = (-b - sqrt(b*b-a*c)) / a;
            if(temp < t_max && temp > t_min) {
                rec.t = temp;
                rec.p = pointAtParameter(r, temp);
                rec.normal = normalize(rec.p - sphere.center);
                rec.material = sphere.material;
                return true;
            }
            temp = (-b + sqrt(b*b-a*c)) / a;
            if(temp < t_max && temp > t_min) {
                rec.t = temp;
                rec.p = pointAtParameter(r, temp);
                rec.normal = normalize(rec.p - sphere.center);
                rec.material = sphere.material;
                return true;
            }
        }
        return false;
    }`;

const hitSpheres: string =
    `bool hitSpheres(Ray r, inout hitRecord rec) {
        bool hitAnything = false;
        float closet = MAXFLOATNUM;
        for(int i = 0; i < sphereCount; i++) {
            if(hitSphere(r, spheres[i], 0.001, closet, rec)) {
                hitAnything = true;
                closet = rec.t;
            }
        }
        return hitAnything;
    }`;

export const Sphere: any = {
    sphere,
    hitSphere,
    hitSpheres
};