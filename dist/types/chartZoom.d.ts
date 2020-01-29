import { ScaleLinear, ScaleTime } from 'd3-scale';
interface AxisOptions {
    scale: ScaleLinear<number, number> | ScaleTime<number, number>;
    minDomain?: number;
    maxDomain?: number;
    minDomainExtent?: number;
    maxDomainExtent?: number;
}
interface ResolvedAxisOptions {
    scale: ScaleLinear<number, number> | ScaleTime<number, number>;
    minDomain: number;
    maxDomain: number;
    minDomainExtent: number;
    maxDomainExtent: number;
}
interface ResolvedOptions {
    x?: ResolvedAxisOptions;
    y?: ResolvedAxisOptions;
}
interface ChartZoomOptions {
    x?: AxisOptions;
    y?: AxisOptions;
}
interface CapableElement extends ElementCSSInlineStyle {
    addEventListener<K extends keyof GlobalEventHandlersEventMap>(type: K, listener: (this: CapableElement, ev: GlobalEventHandlersEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
}
declare type UpdateCallback = () => void;
export declare class ChartZoom {
    private el;
    private majorDirection;
    private previousPoints;
    private enabled;
    options: ResolvedOptions;
    constructor(el: CapableElement, options?: ChartZoomOptions);
    update(): void;
    private syncEnabled;
    private syncTouchAction;
    private touchPoints;
    /**
     * @returns If domain changed
     */
    private applyNewDomain;
    private updateCallbacks;
    onUpdate(callback: UpdateCallback): void;
    private dirOptions;
    private onTouchStart;
    private onTouchEnd;
    private onTouchMove;
}
export {};
