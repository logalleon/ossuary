import { RRange } from "./RRange";
declare const pluck: (arr: any[]) => any;
declare const weightedPluck: (arr: string[]) => string;
declare const randomInt: (min: any, max: any) => any;
declare const randomIntR: (range: RRange) => number;
declare const clamp: (value: number, low: number, high: number) => number;
export { randomInt, pluck, clamp, weightedPluck, randomIntR };
