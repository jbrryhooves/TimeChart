import { ResolvedOptions } from './options';
export interface DataPoint {
    x: number;
    y: number;
}
export declare class RenderModel {
    private options;
    xScale: import("d3-scale").ScaleTime<number, number>;
    yScale: import("d3-scale").ScaleLinear<number, number>;
    private xAutoInitized;
    private yAutoInitized;
    private seriesInfo;
    constructor(options: ResolvedOptions);
    onResize(width: number, height: number): void;
    update(): void;
}
