import Parser from '../lib/Parser';
import { LegendaryData as data } from './test.data';
/**
 * [list] - selects from list, same as ...
 * [list:unique(1)] - selects 1, unique, from list
 * [list:unique(2)] - selects 2, unique, from list
 * [list:any(2)] - selects 2, not unqiue
 * [listA|listB|...listN] - selects 1 from either A..N
 * [listA:any(2).join(' ')] - select 2, join with ' '
 * {A|B} - select A or B
 * [list.sublist] - select 1, unqiue, from sublist
 * {import:list} - specifies that one list belongs to another list
 * {a} - uses a/an on the next word
 * {A} - uses A/An on the next word
 * @param source 
 */
const ossuary = new Parser(data);

const o = (str: string): void => {
  console.log(ossuary.parse(str));
};

// Good
const good = [
  '[animals] is my favorite animal.',
  '[mammals|reptiles] is cool, too.',
  '{A} [animals.mammals|mammals^10] is a mammal.',
  '{something cool|anything^10|nothing^.1} will happen.',
  '[mammals:unique(2)^2|primates:unique(1000)]',
  '{A} {dog|elephant} or {a} {grey donkey|apple}.',
  '{This is a |test 4 2 5| of}',
  '{höòw áb-out açentß?|trûë--}',
  '[reptiles] are really cool.',
  '[mammals.insects:unique(2)] is an animal',
  `{I'm full of punctation!?|Caltrops!;;;;}`
];
console.log('\tGood\t\t~~~~~~~~~~~~~~~\n');
good.map(o);

// Bad
const bad = [
  'afspoijeaposi',
  '[null] is a thing',
  '{{{{{{{{why}}}}}}}',
]
console.log('\tBad\t\t~~~~~~~~~~~~~~~\n');
bad.map(o);