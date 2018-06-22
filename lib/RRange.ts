class RRange {

  public low: number;
  public high: number;

  constructor (low: number, high: number) {
    this.low = low;
    this.high = high;
  }

  diff (): number {
    return this.high - this.low;
  }
  
}
export { RRange };