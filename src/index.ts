import { RayTracer } from './raytracer';
import { globals } from './global';

const appRun = (): void => {
    console.log('app running');
    const canvas = <HTMLCanvasElement>document.getElementById('rayCanvas');
    try {
        canvas.width = globals.CANVAS_WIDTH;
        canvas.height = globals.CANVAS_HEIGHT;
        const gl: WebGLRenderingContext = <WebGLRenderingContext>canvas.getContext('webgl2', { antialias: false });
        if (gl) {
            const traceScene = new RayTracer(gl);
            traceScene.init();
            traceScene.render();
        }
    } catch (e) {
        console.log(e);
    }
}

appRun();