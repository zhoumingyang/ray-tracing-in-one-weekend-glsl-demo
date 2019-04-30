import { Util } from './util';
import { globals } from './global';
import { UniformInfo } from './interface';
import { Camera } from './camera';
import { renderVertexSource } from './shaders/rendervertex';
import { renderFragmentSource } from './shaders/renderfragment';
import { realTimeRayTracingVertexSource } from './shaders/realtimeraytracingvertex';
import { realTimeRayTracingFragmentSource } from './shaders/realtimeraytracingfragment';

export class RayTracer {
    public gl: WebGLRenderingContext;
    public frameBuffer: any;
    public vertexBuffer: WebGLBuffer;
    public textures: WebGLTexture[];
    public renderProgram: WebGLProgram;
    public traceProgram: WebGLProgram;
    public screenAttribute: number;
    public traceAttribute: number;
    public traceUniformInfoMap: Map<string, UniformInfo>;
    public traceUniformValue: Map<string, any>;
    public camera: Camera;
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
        this.traceUniformInfoMap = new Map();
        this.traceUniformValue = new Map();
    }

    public init() {
        this.traceUniformValue.set('clientWidth', globals.CANVAS_WIDTH);
        this.traceUniformValue.set('clientHeight', globals.CANVAS_HEIGHT);
        this.initCamera();
        this.initBufferData();
        this.frameBuffer = this.gl.createFramebuffer();
        this.initTextures();
        this.initScreenRenderProgram();
        this.initTraceRenderProgram();
    }

    public initCamera() {
        const lookat: number[] = [0.0, 0.0, 0.0];
        const lookfrom: number[] = [13.0, 2.0, 3.0];
        const up: number[] = [0.0, 1.0, 0.0];
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

    public initScreenRenderProgram(): void {
        this.renderProgram = Util.compileShader(this.gl, renderVertexSource, renderFragmentSource);
        this.gl.enableVertexAttribArray(this.screenAttribute);
        Util.errorCheck(this.gl);
    }

    private initTRPUniform(uniformVar?: Map<string, string>, vertexSource?: string, fragmentSource?: string): void {
        if (!this.traceProgram && vertexSource && fragmentSource) {
            this.traceProgram = Util.compileShader(this.gl, vertexSource, fragmentSource);
        }
        if (!this.traceProgram) {
            return;
        }
        uniformVar.forEach((type, name) => {
            const pos: WebGLUniformLocation = this.gl.getUniformLocation(this.traceProgram, name);
            const value = this.traceUniformValue.get(name);
            if (value) {
                this.traceUniformInfoMap.set(name, { type: type, value: value, location: pos })
            }
        });
    }

    public initTraceRenderProgram(): void {
        // real time render
        this.traceProgram = Util.compileShader(this.gl, realTimeRayTracingVertexSource, realTimeRayTracingFragmentSource);
        let result: Map<string, string> = new Map();
        result = Util.parseUniformSource(realTimeRayTracingVertexSource, result);
        result = Util.parseUniformSource(realTimeRayTracingFragmentSource, result);
        this.initTRPUniform(result, realTimeRayTracingVertexSource, realTimeRayTracingFragmentSource);
        this.gl.enableVertexAttribArray(this.traceAttribute);
        Util.errorCheck(this.gl);
    }

    private setTraceRenderProgramUniform(): void {
        this.traceUniformInfoMap.forEach((info: any, name: string) => {
            const ctype: string = info.type;
            switch (ctype) {
                case 'int':
                    this.gl.uniform1i(info.location, info.value);
                    break;
                case 'float':
                    this.gl.uniform1f(info.location, info.value);
                    break;
                case 'vec3':
                    if (info.value instanceof Array) {
                        this.gl.uniform3fv(info.location, new Float32Array(info.value));
                    }
                    break;
                case 'vec4':
                    if (info.value instanceof Array) {
                        this.gl.uniform4fv(info.location, new Float32Array(info.value));
                    }
                    break;
                default:
                    break;
            }
        });
    }

    public renderRayTracing(): void {
        //do ray tracing render
        this.gl.useProgram(this.traceProgram);
        this.setTraceRenderProgramUniform();
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