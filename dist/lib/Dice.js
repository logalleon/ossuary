"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Random_1 = require("./Random");
var StandardDice;
(function (StandardDice) {
    StandardDice["d2"] = "d2";
    StandardDice["d4"] = "d4";
    StandardDice["d6"] = "d6";
    StandardDice["d8"] = "d8";
    StandardDice["d10"] = "d10";
    StandardDice["d12"] = "d12";
    StandardDice["d20"] = "d20";
})(StandardDice || (StandardDice = {}));
exports.StandardDice = StandardDice;
var RollErrors;
(function (RollErrors) {
    RollErrors["MaxDiceError"] = "Iterations greater than maximum dice allowed.";
    RollErrors["MaxValueError"] = "Size of dice greater than maximum die value.";
})(RollErrors || (RollErrors = {}));
exports.RollErrors = RollErrors;
const rollDice = (dice, options) => {
    let roll = 0;
    let arr = [];
    const [die, bonus] = dice.split('+');
    const [iterations, range] = die.split('d');
    if (options && options.maxDice && Number(iterations) > options.maxDice) {
        throw new Error(RollErrors.MaxDiceError);
    }
    for (let i = 0; i < (iterations ? Number(iterations) : 1); i++) {
        const val = Random_1.randomInt(1, Number(range));
        if (options && options.asArray) {
            arr.push(val);
        }
        roll += val;
    }
    if (arr.length) {
        // Bonus always gets tacked to the end
        arr.push(bonus);
        return arr;
    }
    else {
        return roll + (bonus ? Number(bonus) : 0);
    }
};
exports.rollDice = rollDice;
