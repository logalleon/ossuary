"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pluck = (arr) => {
    return arr[randomInt(0, arr.length - 1)];
};
exports.pluck = pluck;
const weightedPluck = (arr) => {
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
        }
        else {
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
};
exports.weightedPluck = weightedPluck;
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
exports.randomInt = randomInt;
const randomIntR = (range) => {
    return randomInt(range.low, range.high);
};
exports.randomIntR = randomIntR;
const clamp = (value, low, high) => {
    if (value < low) {
        return low;
    }
    if (value > high) {
        return high;
    }
    return value;
};
exports.clamp = clamp;
//# sourceMappingURL=Random.js.map