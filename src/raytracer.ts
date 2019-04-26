import { Util } from './util';
import { renderVertexSource } from './shaders/rendervertex';
import { renderFragmentSource } from './shaders/renderfragment';
import { blueSkyTraceVertexSource } from './shaders/blueskytracevertex';
import { blueSkyTraceFragmentSource } from './shaders/blueskytracefragment';
import { sphereHitTraceVertexSource } from './shaders/shperehittracevertex';
import { sphereHitTraceFragmentSource } from './shaders/spherehittracefragment';
import { sphereNormalTraceVertexSource } from './shaders/spherenormaltracevertex';
import { sphereNormalTraceFragmentSource } from './shaders/spherenormaltracefragment';
import { sphereObjectsTraceVertexSource } from './shaders/sphereobjectstracevertex';
import { sphereObjectsTraceFragmentSource } from './shaders/sphereobjectstracefragment';
import { sphereAntialiasingTraceVertexSource } from './shaders/sphereantialiasingtracevertex';
import { sphereAntialiasingTraceFragmentSource } from './shaders/sphereantialiasingtracefragment';
import { diffuseSphereTraceVertexSource } from './shaders/diffusespheretracevertex';
import { diffuseSphereTraceFragmentSource } from './shaders/diffusespheretracefragment';
import { metalShpereTraceVertexSource } from './shaders/metalspheretracevertex';
import { metalSphereTraceFragmentSource } from './shaders/metalspheretracefragment';
import { dielectricSphereTraceVertexSource } from './shaders/dielectricsspheretracevertex';
import { dielectricsSphereTraceFragmentSource } from './shaders/dielectricsspheretracefragment';
import { cameraSphereTraceVertexSource } from './shaders/cameraspheretracevertex';
import { cameraSphereTraceFragmentSource } from './shaders/cameraspheretracefragment';
import { defocusBlurTraceVertexSource } from './shaders/defocusblurtracevertex';
import { defocueBlurTraceFragmentSource } from './shaders/defocusblurtracefragment';
import { finalSceneVertexSource } from './shaders/finalscenevertex';
import { finalSceneFragmentSource } from './shaders/finalscenefragment';

const canvasWidth = 400;
const canvasHeight = 200;

export class RayTracer {
    public gl: WebGLRenderingContext;
    public frameBuffer: any;
    public vertexBuffer: WebGLBuffer;
    public textures: WebGLTexture[];
    public renderProgram: WebGLProgram;
    public traceProgram: WebGLProgram;
    public screenAttribute: number;
    public traceAttribute: number;
    private vertices: number[];

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.vertices = [
            -2, -1,
            -2, +1,
            +2, -1,
            +2, +1];
        this.screenAttribute = 0;
        this.traceAttribute = 0;
    }

    public init() {
        this.initBufferData();
        this.frameBuffer = this.gl.createFramebuffer();
        this.initTextures();
        this.initScreenRenderProgram();
        this.initTraceRenderProgram();
    }

    public initBufferData() {
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(this.screenAttribute);
        this.gl.vertexAttribPointer(this.screenAttribute, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.traceAttribute);
        this.gl.vertexAttribPointer(this.traceAttribute, 2, this.gl.FLOAT, false, 0, 0);
        Util.errorCheck(this.gl);
    }

    public initTextures(): void {
        const type = this.gl.getExtension('OES_texture_float') ? this.gl.FLOAT : this.gl.UNSIGNED_BYTE;
        this.textures = [];
        for (let i = 0; i < 2; i++) {
            this.textures.push(this.gl.createTexture());
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[i]);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, canvasWidth, canvasHeight, 0, this.gl.RGB, type, null);
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        Util.errorCheck(this.gl);
    }

    public initScreenRenderProgram(): void {
        this.renderProgram = Util.compileShader(this.gl, renderVertexSource, renderFragmentSource);
        this.gl.enableVertexAttribArray(this.screenAttribute);
        Util.errorCheck(this.gl);
    }

    public initTraceRenderProgram(): void {
        // sky color
        // this.traceProgram = Util.compileShader(this.gl, blueSkyTraceVertexSource, blueSkyTraceFragmentSource);

        // add a sphere in sky
        // this.traceProgram = Util.compileShader(this.gl, sphereHitTraceVertexSource, sphereHitTraceFragmentSource);

        // shade sphere use normal
        // this.traceProgram = Util.compileShader(this.gl, sphereNormalTraceVertexSource, sphereNormalTraceFragmentSource);

        // shade two spheres
        // this.traceProgram = Util.compileShader(this.gl, sphereObjectsTraceVertexSource, sphereObjectsTraceFragmentSource);

        // sphere antialiasing using random ray
        // this.traceProgram = Util.compileShader(this.gl, sphereAntialiasingTraceVertexSource, sphereAntialiasingTraceFragmentSource);

        // diffuse sphere
        // this.traceProgram = Util.compileShader(this.gl, diffuseSphereTraceVertexSource, diffuseSphereTraceFragmentSource);

        // metal sphere
        // this.traceProgram = Util.compileShader(this.gl, metalShpereTraceVertexSource, metalSphereTraceFragmentSource);

        // dielectric sphere
        // this.traceProgram = Util.compileShader(this.gl, dielectricSphereTraceVertexSource, dielectricsSphereTraceFragmentSource);

        // camera sphere
        // this.traceProgram = Util.compileShader(this.gl, cameraSphereTraceVertexSource, cameraSphereTraceFragmentSource);

        // focus blur
        // this.traceProgram = Util.compileShader(this.gl, defocusBlurTraceVertexSource, defocueBlurTraceFragmentSource);

        // final scene
        this.traceProgram = Util.compileShader(this.gl, finalSceneVertexSource, finalSceneFragmentSource);
        this.gl.enableVertexAttribArray(this.traceAttribute);
        Util.errorCheck(this.gl);
    }

    public renderRayTracing(): void {
        //do ray tracing render
        this.gl.useProgram(this.traceProgram);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[0]);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textures[1], 0);
        this.gl.vertexAttribPointer(this.traceAttribute, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.textures.reverse();
        Util.errorCheck(this.gl);
    }

    public renderScreen(): void {
        //do render to screen
        this.gl.useProgram(this.renderProgram);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[0]);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.vertexAttribPointer(this.screenAttribute, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        Util.errorCheck(this.gl);
    }

    public render(): void {
        requestAnimationFrame(this.render.bind(this));
        this.renderRayTracing();
        this.renderScreen();
    }
}