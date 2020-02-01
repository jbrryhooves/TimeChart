/** lower bound */
export declare function domainSearch<T>(data: ArrayLike<T>, start: number, end: number, value: number, key: (v: T) => number): number;
export declare class EventDispatcher<TArgs extends Array<any>> {
    private callbacks;
    on(callback: (...args: TArgs) => void): void;
    dispatch(...args: TArgs): void;
}
