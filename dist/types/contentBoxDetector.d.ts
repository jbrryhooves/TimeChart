import { ResolvedRenderOptions } from './options';
export declare class ContentBoxDetector {
    static meta: {
        name: string;
        required: string[];
        optional: string[];
    };
    node: HTMLElement;
    constructor(el: HTMLElement, options: ResolvedRenderOptions);
}
