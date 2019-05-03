const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const UNIFORMTYPE = {
    INT: 'int',
    FLOAT: 'float',
    VEC3: 'vec3',
    VEC4: 'vec4',
    DOUBLE: 'double',
    SPHERE: 'Sphere'
};

const MATERIALTYPE = {
    DIFFUSE: 0,
    LAMBERTIAN: 1,
    METAL: 2,
    DIELECTRIC: 3,
};

const STRUCTUNIFORMDEFINE = {
    'Sphere': {
        'center': 'vec3',
        'radius': 'float',
        'material.albedo': 'vec3',
        'material.fuzz': 'float',
        'material.refIdx': 'float',
        'material.type': 'int'
    }
};

const TRACESHADERDEFINE = {
    'MAXSPHERENUM': 100,
    'SPHERENUM': 100,
    'MAXFLOATNUM': 3.402823e+38,
    'PI': 3.14159265358979323,
    'TWO_PI': 6.28318530717958648,
    'FOUR_PI': 12.5663706143591729,
    'DIFFUSE': 0,
    'LAMBERTIAN': 1,
    'METAL': 2,
    'DIELECTRIC': 3
};

export const globals: any = {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    UNIFORMTYPE,
    MATERIALTYPE,
    STRUCTUNIFORMDEFINE,
    TRACESHADERDEFINE
}