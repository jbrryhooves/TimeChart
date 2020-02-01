import { CapableElement, ChartZoomOptions, ResolvedOptions } from "./options";
export declare class ChartZoom {
    private el;
    options: ResolvedOptions;
    private touch;
    private mouse;
    private wheel;
    private boundary;
    private scaleUpdated;
    constructor(el: CapableElement, options?: ChartZoomOptions);
    private dispatchScaleUpdated;
    onScaleUpdated(callback: () => void): void;
    /** Call this when scale updated outside */
    update(): void;
}
