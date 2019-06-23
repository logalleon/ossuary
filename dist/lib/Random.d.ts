declare class IntegerRange {
    low: number;
    high: number;
    constructor(low: number, high: number);
    diff(): number;
}
declare function pluck(arr: Array<any>, gen?: null | any): any;
declare function weightedPluck(arr: string[], gen?: null | any): string;
declare function randomInt(min: number, max: number, gen?: null | any): number;
declare function randomIntRange(range: IntegerRange, gen?: null | any): number;
declare function clamp(value: number, low: number, high: number): number;
export { randomInt, pluck, clamp, weightedPluck, randomIntRange, IntegerRange };
