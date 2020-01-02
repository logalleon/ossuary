import Parser from "../lib/Parser";

const phrase = '{This^1|Or That^0.8}';

const p = new Parser({});

for (let i = 0; i < 100; i++) {
  console.log(p.parse(phrase));
}