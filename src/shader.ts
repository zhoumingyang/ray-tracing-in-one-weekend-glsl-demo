import { Util } from './util';
import { UniformInfo } from './interface';
import { globals } from './global';

export class Shader {
    public gl: WebGLRenderingContext;
    public vertexSource: string;
    public fragmentSource: string;
    public program: WebGLProgram;
    public uniformVar: Map<string, string>;
    public uniformInfoMap: Map<string, UniformInfo>;
    public uniformValue: Map<string, any>;

    constructor(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
        this.gl = gl;
        this.uniformVar = new Map();
        this.uniformValue = new Map();
        this.uniformInfoMap = new Map();
        this.vertexSource = vertexSource;
        this.fragmentSource = fragmentSource;
        this.program = Util.compileShader(gl, vertexSource, fragmentSource);
        this.uniformVar = Util.parseUniformSource(vertexSource, this.uniformVar);
        this.uniformVar = Util.parseUniformSource(fragmentSource, this.uniformVar);
        console.log(this.uniformVar);
    }

    public initUniform(uniformValue?: Map<string, any>): void {
        const tmpUniformValue = uniformValue || this.uniformValue;
        if (!tmpUniformValue || !this.uniformVar || !this.uniformInfoMap) {
            return;
        }
        this.uniformVar.forEach((type, name) => {
            const pos: WebGLUniformLocation = this.gl.getUniformLocation(this.program, name);
            const value = tmpUniformValue.get(name);
            if (value) {
                this.uniformInfoMap.set(name, { type: type, value: value, location: pos })
            }
        });
    }

    public updateUniformValue(name: string, value: any): void {
        if (!this.uniformInfoMap) {
            return;
        }
        const tmpInfo = this.uniformInfoMap.get(name);
        if (tmpInfo) {
            tmpInfo.value = value;
            this.uniformInfoMap.set(name, tmpInfo);
            this.uniformValue && this.uniformValue.set(name, tmpInfo.value);
        }
    }

    public setUniform(): void {
        if (!this.uniformInfoMap || !this.gl) {
            return;
        }
        this.uniformInfoMap.forEach((info: any, name: string) => {
            const ctype: string = info.type;
            switch (ctype) {
                case globals.UNIFORMTYPE.INT:
                    this.gl.uniform1i(info.location, info.value);
                    break;
                case globals.UNIFORMTYPE.FLOAT:
                    this.gl.uniform1f(info.location, info.value);
                    break;
                case globals.UNIFORMTYPE.VEC3:
                    this.gl.uniform3fv(info.location, new Float32Array(Object.values(info.value)));
                    break;
                case globals.UNIFORMTYPE.VEC4:
                    this.gl.uniform4fv(info.location, new Float32Array(Object.values(info.value)));
                    break;
                default:
                    break;
            }
        });
    }

    public startProgram() {
        this.gl.useProgram(this.program);
    }
}