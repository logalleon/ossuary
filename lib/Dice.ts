import { randomInt } from "./Random";

enum StandardDice {
  d2 = 'd2',
  d4 = 'd4',
  d6 = 'd6',
  d8 = 'd8',
  d10 = 'd10',
  d12 = 'd12',
  d20 = 'd20'
}

enum RollErrors {
  MaxDiceError = 'Iterations greater than maximum dice allowed.',
  MaxValueError = 'Size of dice greater than maximum die value.'
}

interface RollOptions {
  asArray?: boolean,
  maxDice?: number,
  maxValue?: number
}

const rollDice = (dice: string, options?: RollOptions): number | number[] => {
  let roll = 0;
  let arr = [];
  const [die, bonus] = dice.split('+');
  const [iterations, range] = die.split('d');
  if (options && options.maxDice && Number(iterations) > options.maxDice) {
    throw new Error(RollErrors.MaxDiceError);
  }
  for (let i = 0; i < (iterations ? Number(iterations) : 1); i++) {
    const val = randomInt(1, Number(range));
    if (options && options.asArray) {
      arr.push(val);
    }
    roll += val;
  }
  if (arr.length) {
    // Bonus always gets tacked to the end
    arr.push(bonus);
    return arr;
  } else {
    return roll + (bonus ? Number(bonus) : 0);
  }
};

export { rollDice, StandardDice, RollOptions, RollErrors };