export interface UniformInfo {
    type: string;
    value: any;
    location: WebGLUniformLocation;
    [propName: string]: any;
}