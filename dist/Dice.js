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
const rollDice = (dice) => {
    let roll = 0;
    const [die, bonus] = dice.split('+');
    const [iterations, range] = die.split('d');
    for (let i = 0; i < (iterations ? Number(iterations) : 1); i++) {
        roll += Random_1.randomInt(1, range);
    }
    return roll + (bonus ? Number(bonus) : 0);
};
exports.rollDice = rollDice;
//# sourceMappingURL=Dice.js.map