import { ResolvedRenderOptions } from "./options";
export declare class Legend {
    private el;
    private options;
    legend: HTMLElement;
    constructor(el: HTMLElement, options: ResolvedRenderOptions);
    update(): void;
}
