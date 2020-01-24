import { TimeChartOptions, ResolvedOptions } from './options';
export default class TimeChart {
    private el;
    options: ResolvedOptions;
    private renderModel;
    private lineChartRenderer;
    private canvasLayer;
    private svgLayer;
    constructor(el: HTMLElement, options?: TimeChartOptions);
    onResize(): void;
    update(): void;
}
