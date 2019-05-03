import { globals } from './global';
import { vec3 } from './math/vec';

export class Material {
    public albedo: vec3;
    public fuzz: number;
    public refIdx: number;
    public type: number;

    constructor(albedo: vec3 = new vec3(1.0, 1.0, 1.0), fuzz: number = 0.0,
        refIdx: number = 1.0, type: number = globals.MATERIALTYPE.LAMBERTIAN) {
        this.albedo = albedo;
        this.fuzz = fuzz || 0.0;
        this.refIdx = refIdx || 1.0;
        this.type = type;
    }
}