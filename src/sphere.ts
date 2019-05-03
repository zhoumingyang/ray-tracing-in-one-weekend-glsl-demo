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
        uniformValue.set(`spheres[${idx}].material.texture.color`, this.material.texture.color);
        uniformValue.set(`spheres[${idx}].material.texture.oddColor`, this.material.texture.oddColor);
        uniformValue.set(`spheres[${idx}].material.texture.evenColor`, this.material.texture.evenColor);
        uniformValue.set(`spheres[${idx}].material.texture.type`, this.material.texture.type);
        uniformValue.set(`spheres[${idx}].material.fuzz`, this.material.fuzz);
        uniformValue.set(`spheres[${idx}].material.refIdx`, this.material.refIdx);
        uniformValue.set(`spheres[${idx}].material.type`, this.material.type);
    }
}