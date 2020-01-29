import { TimeChartOptions, ResolvedOptions } from './options';
export default class TimeChart {
    private el;
    options: ResolvedOptions;
    private model;
    private lineChartRenderer;
    private canvasLayer;
    private svgLayer;
    constructor(el: HTMLElement, options?: TimeChartOptions);
    private registerZoom;
    onResize(): void;
    update(): void;
}
