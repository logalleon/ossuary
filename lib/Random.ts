class IntegerRange {

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

function pluck (arr: Array<any>, gen?: null | any): any {
  return arr[randomInt(0, arr.length - 1, gen)];
}

function weightedPluck (arr: string[], gen?: null | any): string {
  const scalars = {};
  const items = [].concat(arr);
  let scaleMax = 0;
  let min = 1;
  let max = 1;
  items.forEach((el, i) => {
    if (el.match(/\^/g)) {
      const [str, scalar] = el.split('^');
      scalars[i] = Number(scalar);
      items[i] = str;
    // Default scale if at least one item is scaled is 1
    } else {
      scalars[i] = 1;
    }
    const scalar = scalars[i];
    min = scalar < min ? scalar : min;
    max = scalar > max ? scalar : max;
  });
  const scale = max / min;
  items.forEach((el, i) => {
    scaleMax += scale * (scalars[i] ? scalars[i] : 1);
  });
  let weightedSelection;
  let currentIndex = 0;
  const atIndex = randomInt(0, scaleMax, gen);
  for (let i = 0; i < items.length; i++) {
    currentIndex += scale * (scalars[i] ? scalars[i] : 1);
    // This is probably an item to look at since <= occasionally throws and error
    if (atIndex < currentIndex) {
      weightedSelection = items[i];
      break;
    }
  }
  return weightedSelection;
}

function randomInt (min: number, max: number, gen?: null | any): number {
  return Math.floor((gen ? gen.random() : Math.random()) * (max - min + 1)) + min;
}

function randomIntRange (range: IntegerRange, gen?: null | any): number {
  return randomInt(range.low, range.high, gen);
}

function uniquePluck (arr: any[], count: number): any[][] {
  let values = [];
  let reduced = [];
  if (count >= arr.length || count < 0) return [arr, []];
  reduced = [].concat(arr);
  while (count--) {
    const index = randomInt(0, reduced.length -1);
    values.push(reduced[index]);
    reduced = [].concat(reduced.slice(0, index), reduced.slice(index + 1));
  }
  return [values, reduced];
}



function clamp (value: number, low: number, high: number): number {
  if (value < low) {
    return low;
  }
  if (value > high) {
    return high;
  }
  return value;
}

export { randomInt, pluck, clamp, weightedPluck, randomIntRange, IntegerRange, uniquePluck };