import { globals } from './global';
import { Util } from './util';
import { vec3, vec4 } from './math/vec';
import { mat4 } from './math/mat4';
import { Ray } from './math/ray';
import { Camera } from './camera';
import { Shader } from './shader';
import { Texture } from './texture';
import { Material } from './material';
import { Sphere } from './sphere';
import { renderVertexSource } from './shaders/rendervertex';
import { renderFragmentSource } from './shaders/renderfragment';
import { realTimeRayTracingVertexSource } from './shaders/realtimeraytracingvertex';
import { realTimeRayTracingFragmentSource } from './shaders/realtimeraytracingfragment';

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
    public setNewColor: boolean;
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
        this.setNewColor = false;
    }

    public init() {
        this.traceUniformValue.set('clientWidth', globals.CANVAS_WIDTH);
        this.traceUniformValue.set('clientHeight', globals.CANVAS_HEIGHT);
        this.traceUniformValue.set('samples', this.samples);
        this.traceUniformValue.set('setNewColor', this.setNewColor);
        this.initCamera();
        this.initBufferData();
        this.frameBuffer = this.gl.createFramebuffer();
        this.initTextures();
        this.initScene();
        this.initScreenRenderShader();
        this.initTraceRenderShader();
        this.gl.canvas.addEventListener('click', this.onMouseClick.bind(this), false);
    }

    private onMouseClick(event: any): void {
        //viewport space to ndc space;
        let nx: number = (2.0 * event.clientX) / globals.CANVAS_WIDTH - 1.0;
        let ny: number = 1.0 - (2.0 * event.clientY) / globals.CANVAS_HEIGHT;
        let nz: number = 1.0;
        const verNdc: vec3 = new vec3(nx, ny, nz);

        const verClip: vec4 = new vec4(verNdc.x, verNdc.y, -1.0, 1.0);

        // clip space to eye space
        const projectMat4: mat4 = this.camera.projectMatrix;
        const inverseProjectMat4: mat4 = new mat4().inverse(projectMat4);
        let verEye: vec4 = inverseProjectMat4.multiplyVec4(verClip);
        verEye = new vec4(verEye.x, verEye.y, -1.0, 0.0);

        // eye space to world space
        const viewMat4: mat4 = this.camera.viewMatrix;
        const inverseViewMat4: mat4 = new mat4().inverse(viewMat4);
        let verWorld = inverseViewMat4.multiplyVec4(verEye);
        verWorld.normalize();
        const rayDir: vec3 = new vec3(verWorld.x, verWorld.y, verWorld.z);

        const ray: Ray = new Ray(this.camera.lookFrom, rayDir);
        const hitSpheres: Sphere[] = [];
        this.spheres.forEach((sphere: Sphere) => {
            if (ray.hitSphere(sphere)) {
                hitSpheres.push(sphere);
            }
        });
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
        this.camera.setUniformValue(this.traceUniformValue);
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
        const black = new vec3(0.0, 0.0, 0.0);
        const white = new vec3(1.0, 1.0, 1.0);
        let i: number = 1;
        let texture = new Texture(black, new vec3(0.2, 0.3, 0.1), new vec3(0.9, 0.9, 0.9), globals.TEXTURETYPE.CHECKER_TEXTURE);
        this.spheres[0] = new Sphere(new vec3(0.0, -1000.0, 0.0), 1000.0,
            new Material(texture, 0.0, 1.0, globals.MATERIALTYPE.LAMBERTIAN));
        this.spheres[0].setUniformValue(this.traceUniformValue, 0);
        for (let a = -5; a < 5; a++) {
            for (let b = -4; b < 4; b++) {
                const chooseMat: number = Util.random();
                const center: vec3 = new vec3(a + 0.9 * Util.random(), 0.2, b + 0.9 * Util.random());
                const std: vec3 = new vec3(4.0, 0.2, 0.0);
                if (center.distanceTo(std) > 0.9) {
                    if (chooseMat < 0.8) {
                        let sa: vec3 = new vec3(Util.random() * Util.random(), Util.random() * Util.random(), Util.random() * Util.random());
                        texture = new Texture(sa, black, black, globals.TEXTURETYPE.CONSTANT_TEXTURE);
                        this.spheres[i++] = new Sphere(center, 0.2, new Material(texture, 0.0, 1.0, globals.MATERIALTYPE.LAMBERTIAN));
                        this.spheres[i - 1].setUniformValue(this.traceUniformValue, i - 1);
                    } else if (chooseMat < 0.95) {
                        let sa: vec3 = new vec3(0.5 * (1.0 + Util.random()), 0.5 * (1.0 + Util.random()), 0.5 * (1.0 + Util.random()));
                        texture = new Texture(sa, black, black, globals.TEXTURETYPE.CONSTANT_TEXTURE);
                        let f: number = 0.5 * Util.random();
                        this.spheres[i++] = new Sphere(center, 0.2, new Material(texture, f, 1.0, globals.MATERIALTYPE.METAL));
                        this.spheres[i - 1].setUniformValue(this.traceUniformValue, i - 1);
                    } else {
                        texture = new Texture(black, black, black, globals.TEXTURETYPE.CONSTANT_TEXTURE);
                        this.spheres[i++] = new Sphere(center, 0.2, new Material(texture, 0.0, 1.5, globals.MATERIALTYPE.DIELECTRIC));
                        this.spheres[i - 1].setUniformValue(this.traceUniformValue, i - 1);
                    }
                }
            }
        }
        texture = new Texture(black, black, black, globals.TEXTURETYPE.CONSTANT_TEXTURE);
        this.spheres[i++] = new Sphere(new vec3(0.0, 1.0, 0.0), 1.0, new Material(texture, 0.0, 1.5, globals.MATERIALTYPE.DIELECTRIC));
        this.spheres[i - 1].setUniformValue(this.traceUniformValue, i - 1);

        texture = new Texture(white, black, black, globals.TEXTURETYPE.CONSTANT_TEXTURE);
        this.spheres[i++] = new Sphere(new vec3(4.0, 1.0, 0.0), 1.0, new Material(texture, 0.0, 1.0, globals.MATERIALTYPE.METAL));
        this.spheres[i - 1].setUniformValue(this.traceUniformValue, i - 1);

        texture = new Texture(new vec3(0.4, 0.2, 0.1), black, black, globals.TEXTURETYPE.CONSTANT_TEXTURE);
        this.spheres[i++] = new Sphere(new vec3(-4.0, 1.0, 0.0), 1.0, new Material(texture, 0.0, 1.0, globals.MATERIALTYPE.LAMBERTIAN));
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
        if (this.setNewColor) {
            this.traceShader.updateUniformValue('setNewColor', this.setNewColor);
            this.setNewColor = false;
        }
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