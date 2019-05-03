import { globals } from './global';
import { Util } from './util';
import { vec3 } from './math/vec';
import { Camera } from './camera';
import { Shader } from './shader';
import { Material } from './material';
import { Sphere } from './sphere';
import { renderVertexSource } from './shaders/rendervertex';
import { renderFragmentSource } from './shaders/renderfragment';
import { realTimeRayTracingVertexSource } from './shaders/realtimeraytracingvertex';
import { realTimeRayTracingFragmentSource } from './shaders/realtimeraytracingfragment';
import { bvhRayTraceVertexSource } from './shaders/bvhraytracevertex';
import { bvhRayTraceFragmentSource } from './shaders/bvhraytracefragment';

export class RayTracer {
    public gl: WebGLRenderingContext;
    public frameBuffer: any;
    public vertexBuffer: WebGLBuffer;
    public textures: WebGLTexture[];
    public renderShader: Shader;
    public traceShader: Shader;
    public screenAttribute: number;
    public traceAttribute: number;
    public traceUniformValue: Map<string, any>;
    public camera: Camera;
    public samples: number;
    public sphereCount: number;
    public spheres: Sphere[];
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
        this.samples = 1;
        this.spheres = [];
        this.sphereCount = 0;
        this.traceUniformValue = new Map();
    }

    public init() {
        this.traceUniformValue.set('clientWidth', globals.CANVAS_WIDTH);
        this.traceUniformValue.set('clientHeight', globals.CANVAS_HEIGHT);
        this.traceUniformValue.set('samples', this.samples);
        this.initCamera();
        this.initBufferData();
        this.frameBuffer = this.gl.createFramebuffer();
        this.initTextures();
        this.initScene();
        this.initScreenRenderShader();
        this.initTraceRenderShader();
    }

    public initCamera() {
        const lookat: vec3 = new vec3(0.0, 0.0, 0.0);
        const lookfrom: vec3 = new vec3(13.0, 2.0, 3.0);
        const up: vec3 = new vec3(0.0, 1.0, 0.0);
        const fov: number = 20.0;
        const aspect: number = globals.CANVAS_WIDTH / globals.CANVAS_HEIGH;
        const aperture: number = 0.1;
        const focusDist: number = 10.0;
        this.camera = new Camera(lookat, lookfrom, up, fov, aspect, aperture, focusDist);
        this.traceUniformValue.set('lookat', this.camera.lookAt);
        this.traceUniformValue.set('lookfrom', this.camera.lookFrom);
        this.traceUniformValue.set('up', this.camera.up);
        this.traceUniformValue.set('fov', this.camera.fov);
        this.traceUniformValue.set('aspect', this.camera.aspect);
        this.traceUniformValue.set('aperture', this.camera.aperture);
        this.traceUniformValue.set('focusDist', this.camera.focusDist);
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
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, globals.CANVAS_WIDTH, globals.CANVAS_HEIGHT, 0, this.gl.RGB, type, null);
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        Util.errorCheck(this.gl);
    }

    public initScene(): void {
        let i: number = 1;
        this.spheres[0] = new Sphere(new vec3(0.0, -1000.0, 0.0), 1000.0,
            new Material(new vec3(0.5, 0.5, 0.5), 0.0, 1.0, globals.MATERIALTYPE.LAMBERTIAN));
        this.spheres[0].setUniformValue(this.traceUniformValue, 0);
        for (let a = -3; a < 3; a++) {
            for (let b = -3; b < 3; b++) {
                const chooseMat: number = Util.random();
                const center: vec3 = new vec3(a + 0.9 * Util.random(), 0.2, b + 0.9 * Util.random());
                const std: vec3 = new vec3(4.0, 0.2, 0.0);
                if (center.distanceTo(std) > 0.9) {
                    if (chooseMat < 0.8) {
                        let sa: vec3 = new vec3(Util.random() * Util.random(), Util.random() * Util.random(), Util.random() * Util.random());
                        this.spheres[i++] = new Sphere(center, 0.2, new Material(sa, 0.0, 1.0, globals.MATERIALTYPE.LAMBERTIAN));
                        this.spheres[i - 1].setUniformValue(this.traceUniformValue, i - 1);
                    } else if (chooseMat < 0.95) {
                        let sa: vec3 = new vec3(0.5 * (1.0 + Util.random()), 0.5 * (1.0 + Util.random()), 0.5 * (1.0 + Util.random()));
                        let f: number = 0.5 * Util.random();
                        this.spheres[i++] = new Sphere(center, 0.2, new Material(sa, f, 1.0, globals.MATERIALTYPE.METAL));
                        this.spheres[i - 1].setUniformValue(this.traceUniformValue, i - 1);
                    } else {
                        this.spheres[i++] = new Sphere(center, 0.2, new Material(new vec3(0.0, 0.0, 0.0), 0.0, 1.5, globals.MATERIALTYPE.DIELECTRIC));
                        this.spheres[i - 1].setUniformValue(this.traceUniformValue, i - 1);
                    }
                }
            }
        }
        this.spheres[i++] = new Sphere(new vec3(0.0, 1.0, 0.0), 1.0, new Material(new vec3(0.0, 0.0, 0.0), 0.0, 1.5, globals.MATERIALTYPE.DIELECTRIC));
        this.spheres[i - 1].setUniformValue(this.traceUniformValue, i - 1);
        this.spheres[i++] = new Sphere(new vec3(-4.0, 1.0, 0.0), 1.0, new Material(new vec3(0.4, 0.2, 0.1), 0.0, 1.0, globals.MATERIALTYPE.LAMBERTIAN));
        this.spheres[i - 1].setUniformValue(this.traceUniformValue, i - 1);
        this.spheres[i++] = new Sphere(new vec3(4.0, 1.0, 0.0), 1.0, new Material(new vec3(1.0, 1.0, 1.0), 0.0, 1.0, globals.MATERIALTYPE.METAL));
        this.spheres[i - 1].setUniformValue(this.traceUniformValue, i - 1);
        this.sphereCount = i;
        this.traceUniformValue.set('sphereCount', this.sphereCount);
    }

    public initScreenRenderShader(): void {
        this.renderShader = new Shader(this.gl, renderVertexSource, renderFragmentSource);
        this.gl.enableVertexAttribArray(this.screenAttribute);
        Util.errorCheck(this.gl);
    }

    public initTraceRenderShader(): void {
        // real time render
        this.traceShader = new Shader(this.gl, realTimeRayTracingVertexSource, realTimeRayTracingFragmentSource);
        this.traceShader.initUniform(this.traceUniformValue);
        this.gl.enableVertexAttribArray(this.traceAttribute);
        Util.errorCheck(this.gl);
    }

    public renderRayTracing(): void {
        //do ray tracing render
        this.traceShader.startProgram();
        this.traceShader.updateUniformValue('samples', this.samples);
        this.traceShader.setUniform();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[0]);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textures[1], 0);
        this.gl.vertexAttribPointer(this.traceAttribute, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.textures.reverse();
        this.samples++;
        Util.errorCheck(this.gl);
    }

    public renderScreen(): void {
        //do render to screen
        this.renderShader.startProgram();
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