import { UniformDefines } from './chunk/uniformdefines';
import { RandomFunction } from './chunk/randomfunction';
import { Material } from './chunk/material';
import { HitRecord } from './chunk/hitrecord';
import { Ray } from './chunk/ray';
import { Sphere } from './chunk/sphere';
import { Camera } from './chunk/camera';
import { Refract } from './chunk/refract';

export const realTimeRayTracingFragmentSource: string =
    `#version 300 es
    precision highp float;
    precision highp int;
    ${UniformDefines.traceFragmentUniformDefines}
    ${RandomFunction.drand48}
    ${RandomFunction.random_in_unit_dist}
    ${RandomFunction.random_in_unit_sphere}
    ${Refract.schlick}
    ${Refract.doRefract}
    ${Material.traceMaterial}
    ${Material.createMaterial}
    ${HitRecord.hitRecord}
    ${Ray.ray}
    ${Ray.pointAtParameter}
    ${Sphere.sphere}
    Sphere spheres[SPHERENUM];
    int sphereCount = 0;
    ${Sphere.hitSphere}
    ${Sphere.hitSpheres}
    ${Camera.camera}
    ${Camera.createCamera}
    ${Camera.creatRayFromCamera}
    ${Material.lambetianScatter}
    ${Material.metalScatter}
    ${Material.dielectricsScatter}
    vec3 calculateColor(Ray r, vec2 seed) {
        hitRecord tmpRec;
        float attenuation = 1.0;
        vec3 totalAttenuation = vec3(1.0, 1.0, 1.0);
        for(int bounces = 0; bounces < 4; bounces++) {
            if(hitSpheres(r, tmpRec)) {
                vec3 tmpAttenuation;
                Ray outRay;
                if (tmpRec.material.type == LAMBERTIAN) {
                    if (lambetianScatter(r, tmpRec, tmpAttenuation, outRay, tmpRec.material)) {
                        totalAttenuation *= tmpAttenuation;
                        r = outRay;
                    } else {
                        totalAttenuation *= vec3(0.0, 0.0, 0.0);
                    }
                }
                if (tmpRec.material.type == METAL) {
                    if (metalScatter(r, tmpRec, tmpAttenuation, outRay, tmpRec.material)) {
                        totalAttenuation *= tmpAttenuation;
                        r = outRay;
                    } else {
                        totalAttenuation *= vec3(0.0, 0.0, 0.0);
                    }
                }
                if (tmpRec.material.type == DIELECTRIC) {
                    if(dielectricsScatter(r, tmpRec, tmpAttenuation, outRay, tmpRec.material)) {
                        totalAttenuation *= tmpAttenuation;
                        r = outRay;
                    } else {
                        totalAttenuation *= vec3(0.0, 0.0, 0.0);
                    }
                }
            }
        }
        vec3 unitDirection = normalize(r.direction);
        float t = 0.5 * (unitDirection.y + 1.0);
        vec3 tmpColor = (1.0 - t) * vec3(1.0, 1.0, 1.0) + t * vec3(0.5, 0.7, 1.0);
        return totalAttenuation * tmpColor;
    }

    void setUpRandomScene() {
        int i = 1;
        spheres[0] = Sphere(vec3(0.0, -1000.0, 0.0), 1000.0, Material(vec3(0.5, 0.5, 0.5), 0.0, 1.0, LAMBERTIAN));
        for (int a = -3; a < 3; a++) {
            for (int b = -2; b < 2; b++) {
                float choose_mat = drand48(vec2(float(i), float(i)));
                vec3 center = vec3(float(a)+0.9 * drand48(vec2(float(a), float(b))), 0.2, float(b) + 0.9 * drand48(vec2(float(b), float(a))));
                if (length(center - vec3(4.0, 0.2, 0.0)) > 0.9) {
                    if(choose_mat < 0.8) {
                        vec3 a = vec3(drand48(center.xy) * drand48(center.yx), drand48(center.yz) * drand48(center.zy), drand48(center.xz) * drand48(center.zx));
                        spheres[i++] = Sphere(center, 0.2, Material(a, 0.0, 1.0, LAMBERTIAN));
                    } else if(choose_mat < 0.95) {
                        vec3 a = vec3(0.5 * (1.0 + drand48(choose_mat * center.xy)), 0.5 * (1.0 + drand48(choose_mat * center.xz)), 0.5 * (1.0 + drand48(choose_mat * center.yz)));
                        float f = 0.5 * drand48(a.xy);
                        spheres[i++] = Sphere(center, 0.2, Material(a, f, 1.0, METAL));
                    } else {
                        spheres[i++] = Sphere(center, 0.2, Material(vec3(0.0, 0.0, 0.0), 0.0, 1.5, DIELECTRIC));
                    }
                }
            }
        }
        spheres[i++] = Sphere(vec3(0.0, 1.0, 0.0),  1.0,  Material(vec3(0.0, 0.0, 0.0),  0.0, 1.5, DIELECTRIC));
        spheres[i++] = Sphere(vec3(-4.0, 1.0, 0.0), 1.0,  Material(vec3(0.4, 0.2, 0.1),  0.0, 1.0, LAMBERTIAN));
        spheres[i++] = Sphere(vec3(4.0, 1.0, 0.0),  1.0,  Material(vec3(1.0, 1.0, 1.0),  0.0, 1.0, METAL));
        sphereCount = i;
    }

    void main() {
        int samples = 30;
        Camera camera = createCamera(lookfrom, lookat, up, fov, aspect, aperture, focusDist);
        setUpRandomScene();
        vec3 curSceneColor = vec3(0.0, 0.0, 0.0);
        vec3 seed = vec3(0.0, 0.0, 0.0);
        for(int i = 0; i < samples; i++) {
            vec2 uv = vec2(float(gl_FragCoord.x + drand48(seed.xy + float(i))) / float(clientWidth), float(gl_FragCoord.y + drand48(seed.xy + float(i))) / float(clientHeight));
            Ray r = createRayFromCamera(camera, uv.x, uv.y);
            curSceneColor += calculateColor(r, gl_FragCoord.xy).rgb;
        }
        curSceneColor = vec3(curSceneColor.r / 100.0, curSceneColor.g / 100.0, curSceneColor.b / 100.0);
        curSceneColor = vec3(sqrt(curSceneColor.r), sqrt(curSceneColor.g), sqrt(curSceneColor.b));
        vec4 finalColor = vec4(curSceneColor.rgb, 1.0);
        fragColor = finalColor;
    }`;