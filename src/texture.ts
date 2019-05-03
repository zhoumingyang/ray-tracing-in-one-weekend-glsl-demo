import { globals } from './global';
import { vec3 } from './math/vec';

export class Texture {
    public color: vec3;
    public oddColor: vec3;
    public evenColor: vec3;
    public type: number;

    constructor(color: vec3 = new vec3(1.0, 1.0, 1.0),
        oddColor: vec3 = new vec3(0.0, 0.0, 0.0),
        evenColor: vec3 = new vec3(0.0, 0.0, 0.0),
        type: number = globals.TEXTURETYPE.CONSTANT_TEXTURE) {
        this.color = color;
        this.oddColor = oddColor;
        this.evenColor = evenColor;
        this.type = type;
    }
}