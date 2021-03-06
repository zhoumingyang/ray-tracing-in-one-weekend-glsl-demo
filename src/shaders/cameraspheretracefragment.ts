export const cameraSphereTraceFragmentSource: string =
    `#version 300 es
    precision highp float;
    precision highp int;
    uniform sampler2D diffuse;
    out vec4 fragColor;
    #define SPHERENUM 5
    #define MAXFLOATNUM 3.402823e+38 //C++ FLT_MAX
    #define M_PI 3.1415926535897932384626433832795
    #define VIEWPORTWIDTH 400.0
    #define VIEWPORTHEIGHT 200.0
    #define DIFFUSE 0
    #define LAMBERTIAN 1
    #define METAL 2
	#define DIELECTRIC 3
    
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
		float refIdx;
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

    float schlick(float cosine, float refIdx) {
        float r0 = (1.0 - refIdx) / (1.0 + refIdx);
        r0 = r0 * r0;
        return r0 + (1.0 - r0) * pow((1.0 - cosine), 5.0);
    }

	bool doRefract(vec3 v, vec3 n, float ni_over_nt, out vec3 refracted) {
		vec3 uv = normalize(v);
		float dt = dot(uv, n);
		float discriminant = 1.0 - ni_over_nt * ni_over_nt * (1.0 - dt * dt);
		if (discriminant > 0.0) {
			refracted = ni_over_nt * (uv - n * dt) - n * sqrt(discriminant);
			return true;
		}
		return false;
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

	bool dielectricsScatter(in Ray inRay, hit_record rec, out vec3 attenuation, out Ray outRay, Material mat) {
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
                rec.normal = (rec.p - sphere.center) / sphere.radius;
                rec.material = sphere.material;
                return true;
            }
            temp = (-b + sqrt(b*b-a*c)) / a;
            if(temp < t_max && temp > t_min) {
                rec.t = temp;
                rec.p = pointAtParameter(r, temp);
                rec.normal = (rec.p - sphere.center) / sphere.radius;
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

    Camera createCamera(vec3 lookfrom, vec3 lookat, vec3 vup, float vfov, float aspect) {
        vec3 u, v, w;
        float theta = vfov * M_PI / 180.0;
        float half_height = tan(theta / 2.0);
        float half_width = aspect * half_height;
        vec3 origin = lookfrom;
        w = normalize(lookfrom - lookat);
        u = normalize(cross(vup, w));
        v = cross(w, u);
        vec3 lower_left_corner = vec3(-half_width, -half_height, -1.0);
        lower_left_corner = origin - half_width * u - half_height * v - w;
        vec3 horizontal = 2.0 * half_width * u; 
        vec3 vertical = 2.0 * half_height * v;
        return Camera(origin, lower_left_corner, horizontal, vertical);
    }
    
    void setUpScene() {
        spheres[0] = Sphere(vec3(0.0, 0.0, 0.0), 0.5, Material(vec3(0.1, 0.2, 0.5), 0.0, 1.0, LAMBERTIAN));
        spheres[1] = Sphere(vec3(0.0, -100.5, 0.0), 100.0, Material(vec3(0.8, 0.8, 0.0), 0.0, 1.0, LAMBERTIAN));
        spheres[2] = Sphere(vec3(1.0, 0.0, 0.0), 0.5, Material(vec3(0.8, 0.6, 0.2), 0.5, 1.0, METAL));
        spheres[3] = Sphere(vec3(-1.0, 0.0, 0.0), 0.5, Material(vec3(1.0, 1.0, 1.0), 0.0, 1.5, DIELECTRIC));
		spheres[4] = Sphere(vec3(-1.0, 0.0, 0.0), -0.45, Material(vec3(1.0, 1.0, 1.0), 0.0, 1.5, DIELECTRIC));
    }
    
    void main() {
        int samples = 100;
        Camera camera = createCamera(vec3(-2.0, 2.0, 1.0), vec3(0.0, 0.0, -1.0), vec3(0.0, 1.0, 0.0), 90.0, float(VIEWPORTWIDTH)/float(VIEWPORTHEIGHT));
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