import { ResolvedRenderOptions } from './options';
import { RenderModel } from './renderModel';
export declare class CanvasLayer {
    canvas: HTMLCanvasElement;
    gl: WebGL2RenderingContext;
    constructor(el: HTMLElement, options: ResolvedRenderOptions, model: RenderModel);
    onResize(): void;
    clear(): void;
}
