export const metalSphereTraceFragmentSource: string =
    `#version 300 es
    precision highp float;
    precision highp int;
    uniform sampler2D diffuse;
    out vec4 fragColor;
    #define SPHERENUM 4
    #define MAXFLOATNUM 3.402823e+38 //C++ FLT_MAX
    #define M_PI 3.1415926535897932384626433832795
    #define VIEWPORTWIDTH 400.0
    #define VIEWPORTHEIGHT 200.0
    #define DIFFUSE 0
    #define LAMBERTIAN 1
    #define METAL 2
    
    float drand48(vec2 seed) {
        return 2.000 * fract(sin(dot(seed.xy, vec2(12.9898, 78.233))) * 43758.5453) - 1.000;
    }
    
    vec3 random_in_unit_sphere(vec3 p) {
        int n = 0;
        do{
            p = vec3(drand48(p.xy), drand48(p.zy), drand48(p.xz));
            n++;
        }while(dot(p, p) >= 1.0 && n < 3);
        return p;
    }
    
    struct Material {
        vec3 albedo;
        float fuzz;
        int type;
    };
    
    struct hit_record {
        float t;
        vec3 p;
        vec3 normal;
        Material material;
    };
    
    struct Ray {
        vec3 origin;
        vec3 direction;
    };
    
    struct Sphere {
        vec3 center;
        float radius;
        Material material;
    };
    
    struct Camera {
        vec3 origin;    
        vec3 lowLeftCorner;
        vec3 horizontal;
        vec3 vertical;
    };
    
    Sphere spheres[SPHERENUM];
    
    vec3 pointAtParameter(Ray r, float t) {
        return r.origin + t * r.direction;
    }
    
    bool lambetianScatter(in Ray inRay, hit_record rec, out vec3 attenuation, out Ray outRay, Material mat) {
        vec3 target = rec.p + rec.normal + random_in_unit_sphere(rec.p);
        outRay = Ray(rec.p, target - rec.p);
        attenuation = mat.albedo;
        return true;
    }
    
    bool metalScatter(in Ray inRay, hit_record rec, out vec3 attenuation, out Ray outRay, Material mat) {
        vec3 reflected = reflect(normalize(inRay.direction), rec.normal);
        outRay = Ray(rec.p, reflected + mat.fuzz * random_in_unit_sphere(rec.p));
        attenuation = mat.albedo;
        return (dot(outRay.direction, rec.normal) > 0.0);
    }
    
    bool hitSphere(Ray r, Sphere sphere, float t_min, float t_max, inout hit_record rec) {
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
                //rec.normal = (rec.p - sphere.center) / sphere.radius;
                rec.normal = normalize(rec.p - sphere.center);
                rec.material = sphere.material;
                return true;
            }
            temp = (-b + sqrt(b*b-a*c)) / a;
            if(temp < t_max && temp > t_min) {
                rec.t = temp;
                rec.p = pointAtParameter(r, temp);
                //rec.normal = (rec.p - sphere.center) / sphere.radius;
                rec.normal = normalize(rec.p - sphere.center);
                rec.material = sphere.material;
                return true;
            }
        }
        return false;
    }
    
    Ray createRayFromCamera(Camera camera, float u, float v) {
        vec3 rayOrigin = camera.origin;
        vec3 rayDirection = camera.lowLeftCorner + u * camera.horizontal + v * camera.vertical - camera.origin;
        return Ray(rayOrigin, rayDirection);
    }
    
    bool hitSpheres(Ray r, inout hit_record rec) {
        bool hitAnything = false;
        float closet = MAXFLOATNUM;
        for(int i = 0; i < SPHERENUM; i++) {
            if(hitSphere(r, spheres[i], 0.001, closet, rec)) {
                hitAnything = true;
                closet = rec.t;
            }
        }
        return hitAnything;
    }
    
    vec3 calculateColor(Ray r, vec2 seed) {
        hit_record tmpRec;
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
                if(tmpRec.material.type == METAL) {
                    if (metalScatter(r, tmpRec, tmpAttenuation, outRay, tmpRec.material)) {
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
    
    Camera initCamera() {
        vec3 origin = vec3(0.0, 0.0, 1.0);
        vec3 camForward = vec3(-2.0, -1.0, 0.0);
        vec3 camRight = vec3(4.0, 0.0, 0.0);
        vec3 camUp = vec3(0.0, 2.0, 0.0);
        Camera camera = Camera(origin, camForward, camRight, camUp);
        return camera;
    }
    
    void setUpScene() {
        spheres[0] = Sphere(vec3(0.0, 0.0, 0.0), 0.5, Material(vec3(0.8, 0.3, 0.3), 0.0, LAMBERTIAN));
        spheres[1] = Sphere(vec3(0.0, -100.5, 0.0), 100.0, Material(vec3(0.8, 0.8, 0.0), 0.0, LAMBERTIAN));
        spheres[2] = Sphere(vec3(1.0, 0.0, 0.0), 0.5, Material(vec3(0.8, 0.6, 0.2), 0.5, METAL));
        spheres[3] = Sphere(vec3(-1.0, 0.0, 0.0), 0.5, Material(vec3(0.8, 0.8, 0.8), 0.5, METAL));
    }
    
    void main() {
        int samples = 80;
        Camera camera = initCamera();
        setUpScene();
        vec3 curSceneColor = vec3(0.0, 0.0, 0.0);
        vec3 seed = vec3(0.0, 0.0, 0.0);
        for(int i = 0; i < samples; i++) {
            vec2 uv = vec2(float(gl_FragCoord.x + drand48(seed.xy+float(i))) / float(VIEWPORTWIDTH), float(gl_FragCoord.y + drand48(seed.xy+float(i))) / float(VIEWPORTHEIGHT));
            Ray r = createRayFromCamera(camera, uv.x, uv.y);
            curSceneColor += calculateColor(r, gl_FragCoord.xy).rgb;
        }
        curSceneColor = vec3(curSceneColor.r / 100.0, curSceneColor.g / 100.0, curSceneColor.b / 100.0);
        curSceneColor = vec3(sqrt(curSceneColor.r), sqrt(curSceneColor.g), sqrt(curSceneColor.b));
        vec4 finalColor = vec4(curSceneColor.rgb, 1.0);
        fragColor = finalColor;
    }`;