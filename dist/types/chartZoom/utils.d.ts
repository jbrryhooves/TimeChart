import { ScaleLinear } from 'd3-scale';
export declare function zip<T1, T2>(...rows: [T1[], T2[]]): [T1, T2][];
/**
 * least squares
 *
 * beta^T = [b, k]
 * X = [[1, x_1],
 *      [1, x_2],
 *      [1, x_3], ...]
 * Y^T = [y_1, y_2, y_3, ...]
 * beta = (X^T X)^(-1) X^T Y
 * @returns `{k, b}`
 */
export declare function linearRegression(data: {
    x: number;
    y: number;
}[]): {
    k: number;
    b: number;
};
export declare function scaleK(scale: ScaleLinear<number, number>): number;
