export declare class LinkedWebGLProgram {
    private gl;
    program: WebGLProgram;
    constructor(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string);
    use(): void;
}
export declare function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader;
export declare function throwIfFalsy<T>(value: T | undefined | null): T;
