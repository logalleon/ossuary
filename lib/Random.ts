import { RRange } from "./RRange";

const pluck = (arr: Array<any>): any => {
  return arr[randomInt(0, arr.length - 1)];
}

const weightedPluck = (arr: string[]): string => {
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
  const atIndex = randomInt(0, scaleMax);
  for (let i = 0; i < items.length; i++) {
    currentIndex += scale * (scalars[i] ? scalars[i] : 1);
    if (atIndex <= currentIndex) {
      weightedSelection = items[i];
      break;
    }
  }
  return weightedSelection;
}

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomIntR = (range: RRange): number => {
  return randomInt(range.low, range.high);
}



const clamp = (value: number, low: number, high: number): number => {
  if (value < low) {
    return low;
  }
  if (value > high) {
    return high;
  }
  return value;
}

export { randomInt, pluck, clamp, weightedPluck, randomIntR };