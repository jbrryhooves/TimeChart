import { Selection } from "d3-selection";
import { ResolvedOptions } from './options';
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
    constructor(el: HTMLElement, options: ResolvedOptions, model: RenderModel);
    update(): void;
    onResize(): void;
}
