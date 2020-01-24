import { RenderModel } from "./renderModel";
import { TimeChartOptions } from './options';
export declare class LineChartRenderer {
    private model;
    private gl;
    private options;
    private program;
    private arrays;
    private height;
    constructor(model: RenderModel, gl: WebGL2RenderingContext, options: TimeChartOptions);
    syncBuffer(): void;
    onResize(width: number, height: number): void;
    drawFrame(): void;
    private ySvgToCanvas;
    syncDomain(): void;
}
