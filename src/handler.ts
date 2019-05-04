import { globals } from './global';
import { vec3 } from './math/vec';
import { RayTracer } from './raytracer';

export class Handler {
    public traceScene: RayTracer;
    constructor(traceScene: RayTracer) {
        this.traceScene = traceScene;
    }

    public setSelectedColor(color: vec3): void {
        if (!this.traceScene || !this.traceScene.spheres ||
            !this.traceScene.spheres.length) {
            return;
        }
        const sphereCnt = this.traceScene.spheres.length - 1;
        this.traceScene.spheres[sphereCnt].material.texture.color = color;
        this.traceScene.traceShader.updateUniformValue(`spheres[${sphereCnt}].material.texture.color`, color);
        this.traceScene.samples = 1;
        this.traceScene.setNewColor = true;
    }
}