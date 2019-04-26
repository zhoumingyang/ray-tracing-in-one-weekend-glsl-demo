import { RayTracer } from './raytracer';

const appRun = (): void => {
    console.log('app running');
    const canvas = <HTMLCanvasElement>document.getElementById('rayCanvas');
    try {
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