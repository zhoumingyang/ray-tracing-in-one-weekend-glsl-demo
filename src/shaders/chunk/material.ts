const traceMaterial: string =
    `struct Material {
        vec3 albedo;
        float fuzz;
        float refIdx;
        int type;
    };`;

const createMaterial: string =
    `Material creatMaterial(vec3 albedo, float fuzz, float refIdx, int type) {
        return Material(albedo, fuzz, refIdx, type);
    }`;

const lambetianScatter: string =
    `bool lambetianScatter(in Ray inRay, hitRecord rec, out vec3 attenuation, out Ray outRay, Material mat) {
        vec3 target = rec.p + rec.normal + random_in_unit_sphere(rec.p);
        outRay = Ray(rec.p, target - rec.p);
        attenuation = mat.albedo;
        return true;
    }`;

const metalScatter: string =
    `bool metalScatter(in Ray inRay, hitRecord rec, out vec3 attenuation, out Ray outRay, Material mat) {
        vec3 reflected = reflect(normalize(inRay.direction), rec.normal);
        outRay = Ray(rec.p, reflected + mat.fuzz * random_in_unit_sphere(rec.p));
        attenuation = mat.albedo;
        return (dot(outRay.direction, rec.normal) > 0.0);
    }`;

const dielectricsScatter: string =
    ` bool dielectricsScatter(in Ray inRay, hitRecord rec, out vec3 attenuation, out Ray outRay, Material mat) {
        vec3 outWardNormal;
        vec3 reflected = reflect(inRay.direction, rec.normal);
        float ni_over_nt;
        vec3 refracted;
        float reflectProb;
        float cosine;
        attenuation = vec3(1.0, 1.0, 1.0);

        if ( dot(inRay.direction, rec.normal) > 0.0 ) {
            outWardNormal = -rec.normal;
            ni_over_nt = mat.refIdx;
            cosine = mat.refIdx * dot(inRay.direction, rec.normal) / length(inRay.direction);
        } else {
            outWardNormal = rec.normal;
            ni_over_nt = 1.0 / mat.refIdx;
            cosine = -dot(inRay.direction, rec.normal) / length(inRay.direction);
        }
        
        if (doRefract(inRay.direction, outWardNormal, ni_over_nt, refracted)){
            reflectProb = schlick(cosine, mat.refIdx);
        } else {
            reflectProb = 1.0;
        }

        if (drand48(inRay.direction.xy) < reflectProb) {
            outRay = Ray(rec.p, reflected);
        } else {
            outRay = Ray(rec.p, refracted);
        }
        return true;
    }`;

export const Material: any = {
    traceMaterial,
    createMaterial,
    lambetianScatter,
    metalScatter,
    dielectricsScatter
};