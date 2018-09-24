declare enum StandardDice {
    d2 = "d2",
    d4 = "d4",
    d6 = "d6",
    d8 = "d8",
    d10 = "d10",
    d12 = "d12",
    d20 = "d20"
}
declare const rollDice: (dice: string) => number;
export { rollDice, StandardDice };
