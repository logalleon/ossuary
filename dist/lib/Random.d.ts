declare class IntegerRange {
    low: number;
    high: number;
    constructor(low: number, high: number);
    diff(): number;
}
declare function pluck(arr: Array<any>): any;
declare function weightedPluck(arr: string[]): string;
declare function randomInt(min: number, max: number): number;
declare function randomIntRange(range: IntegerRange): number;
declare function clamp(value: number, low: number, high: number): number;
export { randomInt, pluck, clamp, weightedPluck, randomIntRange, IntegerRange };
