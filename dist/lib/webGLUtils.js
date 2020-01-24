export class LinkedWebGLProgram {
    constructor(gl, vertexSource, fragmentSource) {
        var _a;
        this.gl = gl;
        const program = throwIfFalsy(gl.createProgram());
        gl.attachShader(program, throwIfFalsy(createShader(gl, gl.VERTEX_SHADER, vertexSource)));
        gl.attachShader(program, throwIfFalsy(createShader(gl, gl.FRAGMENT_SHADER, fragmentSource)));
        gl.linkProgram(program);
        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!success) {
            const message = (_a = gl.getProgramInfoLog(program), (_a !== null && _a !== void 0 ? _a : 'Unknown Error.'));
            gl.deleteProgram(program);
            throw new Error(message);
        }
        this.program = program;
    }
    use() {
        this.gl.useProgram(this.program);
    }
}
export function createShader(gl, type, source) {
    var _a;
    const shader = throwIfFalsy(gl.createShader(type));
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        const message = (_a = gl.getShaderInfoLog(shader), (_a !== null && _a !== void 0 ? _a : 'Unknown Error.'));
        gl.deleteShader(shader);
        throw new Error(message);
    }
    return shader;
}
export function throwIfFalsy(value) {
    if (!value) {
        throw new Error('value must not be falsy');
    }
    return value;
}
//# sourceMappingURL=webGLUtils.js.map