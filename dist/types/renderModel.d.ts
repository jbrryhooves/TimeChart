import { ResolvedRenderOptions } from './options';
import { EventDispatcher } from './utils';
export interface DataPoint {
    x: number;
    y: number;
}
interface MinMax {
    min: number;
    max: number;
}
export declare class RenderModel {
    private options;
    xScale: import("d3-scale").ScaleLinear<number, number>;
    yScale: import("d3-scale").ScaleLinear<number, number>;
    xRange: MinMax | null;
    yRange: MinMax | null;
    private seriesInfo;
    constructor(options: ResolvedRenderOptions);
    resize(width: number, height: number): void;
    updated: EventDispatcher<[]>;
    update(): void;
    private redrawRequested;
    requestRedraw(): void;
}
export {};
