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

const rollDice = (dice: string): number => {
  let roll = 0;
  const [die, bonus] = dice.split('+');
  const [iterations, range] = die.split('d');
  for (let i = 0; i < (iterations ? Number(iterations) : 1); i++) {
    roll += randomInt(1, Number(range));
  }
  return roll + (bonus ? Number(bonus) : 0);
};

export { rollDice, StandardDice };