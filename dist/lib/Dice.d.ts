declare enum StandardDice {
    d2 = "d2",
    d4 = "d4",
    d6 = "d6",
    d8 = "d8",
    d10 = "d10",
    d12 = "d12",
    d20 = "d20"
}
declare enum RollErrors {
    MaxDiceError = "Iterations greater than maximum dice allowed.",
    MaxValueError = "Size of dice greater than maximum die value."
}
interface RollOptions {
    asArray?: boolean;
    maxDice?: number;
    maxValue?: number;
}
declare const rollDice: (dice: string, options?: RollOptions) => number | number[];
export { rollDice, StandardDice, RollOptions, RollErrors };
