import { ResolvedRenderOptions, TimeChartSeriesOptions } from "./options";
import { RenderModel } from './renderModel';
export declare class Legend {
    private el;
    private options;
    legend: HTMLElement;
    items: Map<TimeChartSeriesOptions, HTMLElement>;
    itemContainer: HTMLElement;
    constructor(el: HTMLElement, model: RenderModel, options: ResolvedRenderOptions);
    update(): void;
}
