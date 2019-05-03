import { globals } from './global';
import { Texture } from './texture';

export class Material {
    public texture: Texture;
    public fuzz: number;
    public refIdx: number;
    public type: number;

    constructor(texture: Texture = new Texture(), fuzz: number = 0.0,
        refIdx: number = 1.0, type: number = globals.MATERIALTYPE.LAMBERTIAN) {
        this.texture = texture;
        this.fuzz = fuzz || 0.0;
        this.refIdx = refIdx || 1.0;
        this.type = type;
    }
}