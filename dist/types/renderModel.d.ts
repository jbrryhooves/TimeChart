import { TimeChartSeriesOptions, TimeChartOptions } from './options';
export interface DataSeries {
    options: TimeChartSeriesOptions;
    data: DataPoint[];
    yRangeUpdatedIndex: number;
}
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
    series: DataSeries[];
    constructor(options: TimeChartOptions);
    onResize(width: number, height: number): void;
    update(): void;
}
