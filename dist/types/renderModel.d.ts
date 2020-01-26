import { ResolvedOptions } from './options';
export interface DataPoint {
    x: number;
    y: number;
}
declare type UpdateCallback = () => void;
export declare class RenderModel {
    private options;
    xScale: import("d3-scale").ScaleTime<number, number>;
    yScale: import("d3-scale").ScaleLinear<number, number>;
    private xAutoInitized;
    private yAutoInitized;
    private seriesInfo;
    constructor(options: ResolvedOptions);
    resize(width: number, height: number): void;
    private updateCallbacks;
    onUpdate(callback: UpdateCallback): void;
    update(): void;
    private redrawRequested;
    requestRedraw(): void;
}
export {};
