import { RayTracer } from './raytracer';
import { globals } from './global';
import { uiRun } from './ui/uiRun';
import { Handler } from './handler';

const appRun = (): void => {
    console.log('app running');
    const canvas = <HTMLCanvasElement>document.getElementById('rayCanvas');
    try {
        canvas.width = globals.CANVAS_WIDTH;
        canvas.height = globals.CANVAS_HEIGHT;
        const gl: WebGLRenderingContext = <WebGLRenderingContext>canvas.getContext('webgl2', { antialias: false });
        let hander: Handler;
        if (gl) {
            const traceScene = new RayTracer(gl);
            traceScene.init();
            traceScene.render();
            hander = new Handler(traceScene);
        }
        uiRun(hander);
    } catch (e) {
        console.log(e);
    }
}

appRun();