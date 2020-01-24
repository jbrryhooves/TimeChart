import { DataPoint } from './renderModel';
import { TimeChartOptions, TimeChartSeriesOptions } from './options';
export default class TimeChart {
    private el;
    private options;
    private renderModel;
    private lineChartRenderer;
    private canvasLayer;
    private svgLayer;
    constructor(el: HTMLElement, options?: Partial<TimeChartOptions>);
    onResize(): void;
    update(): void;
    addDataSeries(data: DataPoint[], options?: Partial<TimeChartSeriesOptions>): void;
}
