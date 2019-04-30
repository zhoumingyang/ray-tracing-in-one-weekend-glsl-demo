import { globals } from './global';

export class Camera {
    public lookAt: number[];
    public lookFrom: number[];
    public up: number[];
    public fov: number;
    public aspect: number;
    public aperture: number;
    public focusDist: number;

    constructor(_lookat?: number[], _lookfrom?: number[], _up?: number[],
        _fov?: number, _aspect?: number, _aperture?: number, _focusDist?: number) {
        this.lookAt = (_lookat && _lookat.length === 3) ? _lookat : [0.0, 0.0, 0.0];
        this.lookFrom = (_lookfrom && _lookfrom.length === 3) ? _lookfrom : [13.0, 2.0, 3.0];
        this.up = (_up && _up.length === 3) ? _up : [0.0, 1.0, 0.0];
        this.fov = _fov || 20.0;
        this.aspect = _aspect || (globals.CANVAS_WIDTH / globals.CANVAS_HEIGHT);
        this.aperture = _aperture || 0.1;
        this.focusDist = _focusDist || 10.0;
    }
}