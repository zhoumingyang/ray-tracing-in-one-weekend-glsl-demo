export const Util = {
    compileSource: (gl: WebGLRenderingContext, shaderSource: string, type: number): WebGLShader => {
        const shader: WebGLShader = gl.createShader(type);
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw 'compile error: ' + gl.getShaderInfoLog(shader);
        }
        return shader;
    },

    compileShader: (gl: WebGLRenderingContext, vertexSrouce: string, fragmentSource: string): WebGLProgram => {
        const shaderProgram: WebGLProgram = gl.createProgram();
        const vertexShader: WebGLShader = Util.compileSource(gl, vertexSrouce, gl.VERTEX_SHADER);
        const fragmentShader: WebGLShader = Util.compileSource(gl, fragmentSource, gl.FRAGMENT_SHADER);
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            throw 'link error: ' + gl.getProgramInfoLog(shaderProgram);
        }
        return shaderProgram;
    },

    errorCheck: (gl: WebGLRenderingContext): void => {
        const err = gl.getError();
        if (err !== gl.NO_ERROR) {
            console.log(err);
        }
    }
};