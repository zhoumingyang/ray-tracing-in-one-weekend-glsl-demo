export const diffuseSphereTraceFragmentSource: string =
    `#version 300 es
    precision highp float;
    precision highp int;
    uniform sampler2D diffuse;
    out vec4 fragColor;
    #define SPHERENUM 2
    #define MAXFLOATNUM 3.402823e+38 //C++ FLT_MAX
    #define M_PI 3.1415926535897932384626433832795
    #define VIEWPORTWIDTH 400.0
    #define VIEWPORTHEIGHT 200.0
    
    float drand48(vec2 seed) {
        return 2.0 * fract(sin(dot(seed.xy, vec2(12.9898, 78.233))) * 43758.5453) - 1.0;
    }

    vec3 random_in_unit_sphere(vec3 p) {
        int n = 0;
        do{
            p = vec3(drand48(p.xz), drand48(p.zy), drand48(p.xy));
            n++;
        }while(dot(p, p) >= 1.0 && n < 3);
        return p;
    }
    
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
        float b = dot(oc, r.direction);
        float c = dot(oc, oc) - sphere.radius * sphere.radius;
        float discriminant = b * b - a * c;
        if(discriminant > 0.0) {
            float temp = (-b - sqrt(b*b-a*c)) / a;
            if(temp < t_max && temp > t_min) {
                rec.t = temp;
                rec.p = pointAtParameter(r, temp);
                rec.normal = (rec.p - sphere.center) / sphere.radius;
                return true;
            }
            temp = (-b + sqrt(b*b-a*c)) / a;
            if(temp < t_max && temp > t_min) {
                rec.t = temp;
                rec.p = pointAtParameter(r, temp);
                rec.normal = (rec.p - sphere.center) / sphere.radius;
                return true;
            }
        }
        return false;
    }
    
    struct Camera {
        vec3 origin;      
        vec3 lowLeftCorner;  
        vec3 horizontal;   
        vec3 vertical;
    };
    
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
        for(int bounces = 0; bounces < 4; bounces++) {
            if(hitSpheres(r, tmpRec)) {
                attenuation = attenuation * 0.5;
                vec3 target = tmpRec.p + tmpRec.normal + random_in_unit_sphere(tmpRec.p);
                r = Ray(tmpRec.p, target - tmpRec.p);
            }
        }
        vec3 unitDirection = normalize(r.direction);
        float t = 0.5 * (unitDirection.y + 1.0);
        vec3 tmpColor = (1.0 - t) * vec3(1.0, 1.0, 1.0) + t * vec3(0.5, 0.7, 1.0);
        return attenuation * tmpColor;
    }
    
    void main() {
        int samples = 100;
        vec3 origin = vec3(0.0, 0.0, 1.0);
        vec3 camForward = vec3(-2.0, -1.0, 0.0);
        vec3 camRight = vec3(4.0, 0.0, 0.0);
        vec3 camUp = vec3(0.0, 2.0, 0.0);
        Camera camera = Camera(origin, camForward, camRight, camUp);
        spheres[0] = Sphere(vec3(0.0, 0.0, 0.0), 0.5);
        spheres[1] = Sphere(vec3(0.0, -100.5, 0.0), 100.0);
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