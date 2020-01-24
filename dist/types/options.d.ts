import { ColorSpaceObject, ColorCommonInstance } from 'd3-color';
declare type ColorSpecifier = ColorSpaceObject | ColorCommonInstance | string;
export interface TimeChartOptions {
    lineWidth: number;
    backgroundColor: ColorSpecifier;
    paddingLeft: number;
    paddingRight: number;
    paddingTop: number;
    paddingBottom: number;
    xRange: {
        min: number | Date;
        max: number | Date;
    } | 'auto';
    yRange: {
        min: number;
        max: number;
    } | 'auto';
    realTime: boolean;
    /** Milliseconds since `new Date(0)`. Every x in data are relative to this.
     *
     * Set this option and keep the absolute value of x small for higher floating point precision.
     **/
    baseTime: number;
}
export interface TimeChartSeriesOptions {
    lineWidth?: number;
    name: string;
    color: ColorSpecifier;
}
export declare function resolveColorRGBA(color: ColorSpecifier): [number, number, number, number];
export {};
