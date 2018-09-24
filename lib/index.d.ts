//// <reference type="typescript"/>
declare module 'ossuary' {
  export = Parser
}

export class Parser {
  parse (source: string): string
  parseLists (lists: string [], source: string): string
  reducePluck(arr: string[], quantity: number): string[]
  parseAdHocLists (adHocLists: string[], source: string): string
  deepDive (accessor: string, returnEntireArray?: boolean): string|string[]
  deepDiveRetrieve (accessor: string, returnEntireArray?: boolean): ArbitraryData
}

  // export function pluck (arr: Array<any>): any
  // export function weightedPluck (arr: string[]): string
  // export function randomInt (min, max)
  // export function randomIntR (range: RRange): number
  // export function clamp (value: number, low: number, high: number): number
  // export class RRange {
  //     public low: number;
  //     public high: number;
  //     constructor (low: number, high: number)
  // }