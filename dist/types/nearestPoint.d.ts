import { SVGLayer } from './svgLayer';
import { ContentBoxDetector } from "./contentBoxDetector";
import { RenderModel } from './renderModel';
import { ResolvedRenderOptions } from './options';
export declare class NearestPoint {
    private model;
    private options;
    static meta: {
        name: string;
        required: string[];
    };
    private intersectPoints;
    private lastX;
    constructor(svg: SVGLayer, model: RenderModel, options: ResolvedRenderOptions, detector: ContentBoxDetector);
    adjustIntersectPoints(): void;
}
