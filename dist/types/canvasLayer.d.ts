import { TimeChartOptions } from './options';
export declare class CanvasLayer {
    canvas: HTMLCanvasElement;
    gl: WebGL2RenderingContext;
    constructor(el: HTMLElement, options: TimeChartOptions);
    onResize(): void;
    clear(): void;
}
