import { globals } from './global';

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
    },

    parseUniformSource: (sourceString: string, result: Map<string, string>): Map<string, string> => {
        const uniform: string = 'uniform';
        const arrayLeftSymbol: string = "[";
        const arrayRightSymbol: string = "]";
        const space: string = " ";
        const semicolon: string = ";";
        const equal: string = "=";
        while (sourceString && sourceString.indexOf(uniform) !== -1) {
            const uniformPos: number = sourceString.indexOf(uniform);
            sourceString = sourceString.substr(uniformPos);
            const semicolonPos: number = sourceString.indexOf(semicolon);
            if (semicolonPos !== -1) {
                const tmpDefineStr = sourceString.substr(0, semicolonPos);
                const splitResult = tmpDefineStr.split(space);
                if (splitResult.length >= 3) {
                    const typeStr: string = splitResult[1];
                    const varDefineStr: string = splitResult[2];
                    if (tmpDefineStr.includes(arrayLeftSymbol) && tmpDefineStr.includes(arrayRightSymbol)) {
                        const leftPos: number = varDefineStr.indexOf(arrayLeftSymbol);
                        const rightPos: number = varDefineStr.indexOf(arrayRightSymbol);
                        if (leftPos !== -1 && rightPos !== -1) {
                            const numStr: string = varDefineStr.substr(leftPos, rightPos);
                            const varName: string = varDefineStr.substr(0, leftPos);
                            const num: number = parseInt(globals.TRACESHADERDEFINE[numStr] || numStr) || 100;
                            if (globals.STRUCTUNIFORMDEFINE[typeStr]) {
                                const tmp = globals.STRUCTUNIFORMDEFINE[typeStr];
                                for (let i = 0; i < num; i++) {
                                    for (let key in tmp) {
                                        result.set(`${varName}[${i}].${key}`, tmp[key]);
                                    }
                                }
                            } else {
                                for (let i = 0; i < num; i++) {
                                    result.set(`${varName}[${i}]`, typeStr);
                                }
                            }
                        }
                    } else {
                        result.set(varDefineStr, typeStr);
                    }
                }
                sourceString = sourceString.substr(semicolonPos + 1);
            }
        }
        return result;
    },

    random: (): number => {
        return Math.round(Math.random());
    }
};