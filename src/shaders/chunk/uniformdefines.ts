const traceVertexUniformDefines: string =
    `
`;

const traceFragmentUniformDefines: string =
    `uniform sampler2D diffuse;
    uniform int clientWidth;
    uniform int clientHeight;
    uniform vec3 lookfrom;
    uniform vec3 lookat;
    uniform vec3 up;
    uniform float fov;
    uniform float aspect;
    uniform float aperture;
    uniform float focusDist;
    uniform int samples;
    uniform int setNewColor;
    int sphereNumber;
    #define MAXSPHERENUM 100
    #define SPHERENUM 100
    #define MAXFLOATNUM 3.402823e+38 //C++ FLT_MAX
    #define PI 3.14159265358979323
    #define TWO_PI 6.28318530717958648
    #define FOUR_PI 12.5663706143591729
    #define CONSTANT_TEXTURE 0
    #define CHECKER_TEXTURE 1
    #define DIFFUSE 0
    #define LAMBERTIAN 1
    #define METAL 2
    #define DIELECTRIC 3
    out vec4 fragColor;`;

export const UniformDefines: any = {
    traceVertexUniformDefines,
    traceFragmentUniformDefines,
}