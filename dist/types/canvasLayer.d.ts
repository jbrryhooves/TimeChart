import { ResolvedOptions } from './options';
export declare class CanvasLayer {
    canvas: HTMLCanvasElement;
    gl: WebGL2RenderingContext;
    constructor(el: HTMLElement, options: ResolvedOptions);
    onResize(): void;
    clear(): void;
}
