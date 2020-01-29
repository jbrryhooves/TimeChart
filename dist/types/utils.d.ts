/** lower bound */
export declare function domainSearch<T>(data: ArrayLike<T>, start: number, end: number, value: number, key: (v: T) => number): number;
export declare function zip<T1, T2>(...rows: [T1[], T2[]]): [T1, T2][];
