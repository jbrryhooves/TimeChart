import { RenderModel } from "./renderModel";
import { ResolvedOptions } from './options';
export declare class LineChartRenderer {
    private model;
    private gl;
    private options;
    private program;
    private arrays;
    private height;
    private width;
    constructor(model: RenderModel, gl: WebGL2RenderingContext, options: ResolvedOptions);
    syncBuffer(): void;
    onResize(width: number, height: number): void;
    drawFrame(): void;
    private ySvgToCanvas;
    syncDomain(): void;
}
