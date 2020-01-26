import { ResolvedOptions } from './options';
import { RenderModel } from './renderModel';
export declare class CanvasLayer {
    canvas: HTMLCanvasElement;
    gl: WebGL2RenderingContext;
    constructor(el: HTMLElement, options: ResolvedOptions, model: RenderModel);
    onResize(): void;
    clear(): void;
}
