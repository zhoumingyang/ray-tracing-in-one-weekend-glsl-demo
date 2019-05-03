import { globals } from './global';
import { vec3 } from './math/vec';

export class Camera {
    public lookAt: vec3;
    public lookFrom: vec3;
    public up: vec3;
    public fov: number;
    public aspect: number;
    public aperture: number;
    public focusDist: number;

    constructor(_lookat?: vec3, _lookfrom?: vec3, _up?: vec3,
        _fov?: number, _aspect?: number, _aperture?: number, _focusDist?: number) {
        this.lookAt = _lookat || new vec3();
        this.lookFrom = _lookfrom || new vec3(13.0, 2.0, 3.0);
        this.up = _up || new vec3(0.0, 1.0, 0.0);
        this.fov = _fov || 20.0;
        this.aspect = _aspect || (globals.CANVAS_WIDTH / globals.CANVAS_HEIGHT);
        this.aperture = _aperture || 0.1;
        this.focusDist = _focusDist || 10.0;
    }
}