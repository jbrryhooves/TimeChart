import { Selection } from "d3-selection";
import { TimeChartOptions } from './options';
import { RenderModel } from './renderModel';
export declare class SVGLayer {
    private options;
    private model;
    xg: Selection<SVGGElement, unknown, null, undefined>;
    yg: Selection<SVGGElement, unknown, null, undefined>;
    xAxis: import("d3-axis").Axis<number | Date | {
        valueOf(): number;
    }>;
    yAxis: import("d3-axis").Axis<number | {
        valueOf(): number;
    }>;
    svgNode: SVGSVGElement;
    constructor(el: HTMLElement, options: TimeChartOptions, model: RenderModel);
    update(): void;
    onResize(): void;
}
