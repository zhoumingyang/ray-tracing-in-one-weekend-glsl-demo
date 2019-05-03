import { UniformDefines } from './chunk/uniformdefines';
import { RandomFunction } from './chunk/randomfunction';
import { Texture } from './chunk/texture';
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
    ${Texture.texture}
    ${Material.traceMaterial}
    ${Material.createMaterial}
    ${HitRecord.hitRecord}
    ${Ray.ray}
    ${Ray.pointAtParameter}
    ${Sphere.sphere}
    uniform Sphere spheres[MAXSPHERENUM];
    uniform int sphereCount;
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
        for(int bounces = 0; bounces < 6; bounces++) {
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

    void main() {
        sphereNumber = sphereCount;
        if ( sphereCount > MAXSPHERENUM ) {
            sphereNumber = MAXSPHERENUM;
        }
        vec3 preSceneColor = texture(diffuse, vec2(float(gl_FragCoord.x)/float(clientWidth), float(gl_FragCoord.y)/float(clientHeight))).rgb;
        preSceneColor.rgb *= preSceneColor.rgb;
        Camera camera = createCamera(lookfrom, lookat, up, fov, aspect, aperture, focusDist);
        vec3 curSceneColor = vec3(0.0, 0.0, 0.0);
        vec3 seed = vec3(0.0, 0.0, 0.0);
        vec2 uv = vec2(float(gl_FragCoord.x + drand48(seed.xy + float(samples))) / float(clientWidth), float(gl_FragCoord.y + drand48(seed.xy + float(samples))) / float(clientHeight));
        Ray r = createRayFromCamera(camera, uv.x, uv.y);
        curSceneColor += calculateColor(r, gl_FragCoord.xy).rgb;
        if (samples - 1 > 0) {
            preSceneColor.rgb = preSceneColor.rgb * float(samples - 1);
        }
        curSceneColor += preSceneColor;
        vec4 finalColor = vec4(curSceneColor.rgb / float(samples), 1.0);
        finalColor = vec4(sqrt(finalColor.r), sqrt(finalColor.g), sqrt(finalColor.b), 1.0);
        fragColor = finalColor;
    }`;