const schlick: string =
    `float schlick(float cosine, float refIdx) {
        float r0 = (1.0 - refIdx) / (1.0 + refIdx);
        r0 = r0 * r0;
        return r0 + (1.0 - r0) * pow((1.0 - cosine), 5.0);
    }`;

const doRefract: string =
    `bool doRefract(vec3 v, vec3 n, float ni_over_nt, out vec3 refracted) {
        vec3 uv = normalize(v);
        float dt = dot(uv, n);
        float discriminant = 1.0 - ni_over_nt * ni_over_nt * (1.0 - dt * dt);
        if (discriminant > 0.0) {
            refracted = ni_over_nt * (uv - n * dt) - n * sqrt(discriminant);
            return true;
        }
        return false;
    }`;

export const Refract: any = {
    schlick,
    doRefract
};