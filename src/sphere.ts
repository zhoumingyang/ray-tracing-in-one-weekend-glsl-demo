import { Material } from './material';
import { vec3 } from './math/vec';

export class Sphere {
    public center: vec3;
    public radius: number;
    public material: Material;
    constructor(center: vec3 = new vec3(0.0, 0.0, 0.0), radius: number = 0.0,
        material: Material = new Material()) {
        this.center = center;
        this.radius = radius;
        this.material = material;
    }

    setUniformValue(uniformValue: Map<string, any>, idx: number = 0): void {
        uniformValue.set(`spheres[${idx}].center`, this.center);
        uniformValue.set(`spheres[${idx}].radius`, this.radius);
        uniformValue.set(`spheres[${idx}].material.albedo`, this.material.albedo);
        uniformValue.set(`spheres[${idx}].material.fuzz`, this.material.fuzz);
        uniformValue.set(`spheres[${idx}].material.refIdx`, this.material.refIdx);
        uniformValue.set(`spheres[${idx}].material.type`, this.material.type);
    }
}