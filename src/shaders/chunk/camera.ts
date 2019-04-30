const camera: string =
    `struct Camera {
        vec3 origin;    
        vec3 lowLeftCorner;
        vec3 horizontal;
        vec3 vertical;
        vec3 u;
        vec3 v;
        vec3 w;
        float lensRadius;
    };`;

const createCamera: string =
    `Camera createCamera(vec3 lookfrom, vec3 lookat, vec3 vup, float vfov, 
        float aspect, float aperture, float focusDist) {
    
        float lensRadius = aperture / 2.0;
        vec3 u, v, w;
        float theta = vfov * PI / 180.0;
        float half_height = tan(theta / 2.0);
        float half_width = aspect * half_height;
        vec3 origin = lookfrom;
        w = normalize(lookfrom - lookat);
        u = normalize(cross(vup, w));
        v = cross(w, u);
        vec3 lower_left_corner = origin - half_width * focusDist * u - half_height * focusDist * v - focusDist * w;
        vec3 horizontal = 2.0 * half_width * focusDist * u; 
        vec3 vertical = 2.0 * half_height * focusDist * v;
    
        Camera camera;
        camera.origin = origin;
        camera.lowLeftCorner = lower_left_corner;
        camera.horizontal = horizontal;
        camera.vertical = vertical;
        camera.u = u;
        camera.v = v;
        camera.w = w;
        camera.lensRadius = lensRadius;
        return camera;
    }`;

const creatRayFromCamera: string =
    `Ray createRayFromCamera(Camera camera, float u, float v) {
        vec3 rd = camera.lensRadius * random_in_unit_dist(vec2(u,v));
        vec3 offset = camera.u * rd.x + camera.v * rd.y;
        vec3 rayOrigin = camera.origin + offset;
        vec3 rayDirection = camera.lowLeftCorner + u * camera.horizontal + v * camera.vertical - camera.origin - offset;
        return Ray(rayOrigin, rayDirection);
    }`;

export const Camera: any = {
    camera,
    createCamera,
    creatRayFromCamera
};