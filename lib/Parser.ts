import { pluck, weightedPluck, randomInt } from './Random';
import * as randomSeed from 'random-seed';

// Data container for any arbitrary kind of data
interface ArbitraryData {
  val: string,
  [key: string]: any
}

enum Tokens {
  A_LOWER = '{a}',
  A_UPPER = '{A}',
  SPACE = ' ',
  UNIQUE = 'unique',
  JOIN = 'join'
}

const vowels: string[] = ['a', 'e', 'i', 'o', 'u', 'y'];

class Parser {

  public lists;

  public random;

  constructor (dictionary: object, seeded?: boolean, seed?: string | number) {
    // Load language libraries
    this.lists = dictionary;
    if (seeded) {
      this.random = randomSeed(seed);
    }
  }

  /**
   * Does things similar to parse, but retrieves the arbitrary data object
   */
  retrieve (source: string): ArbitraryData {
    const lists = source.match(/\[.+\]/g);
    let selection;
    lists.forEach((listGroup) => {
      const listReferences = listGroup.split('|');
      let results = [];
      let weighted = false;
      listReferences.forEach((listReference) => {
        let [accessor] = listReference.match(/([a-zA-Z\^\.[0-9])+/);
        accessor = accessor.replace('[', '').replace(']', '');
        const result = this.deepDiveRetrieve(accessor);
        results.push(result);
        // @TODO
        // if (result.val && result.val.indexOf('^') !== -1) {

        // } else if (result.indexOf('^') !== -1) {
        //   weighted = true;
        // }
      });
      selection = weighted ? weightedPluck(results, this.random) : pluck(results, this.random);
    });
    return selection;
  }

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
   * (a) - uses a/an on the next word
   * (A) - uses A/An on the next word
   * @param source 
   */
  parse (source: string): string {
    const lists = source.match(/\[.+?\]/g);
    const adHocLists = source.match(/\{.+?\}/g);
    if (lists) {
      source = this.parseLists(lists, source);
    }
    if (adHocLists) {
      source = this.parseAdHocLists(adHocLists, source);
    }
    return this.finalPass(source);
  }

  finalPass (source: string): string {
    const offset = 4;
    // (a)
    var a_1 = new RegExp(Tokens.A_LOWER);
    if (source.match(a_1)) {
      while (source.match(a_1)) {
        let index = source.indexOf(Tokens.A_LOWER);
        // Reached the end of the string
        if (index + offset > source.length) {
          break;
        } else {
          let letterToCheck = source[index + offset];
          // @ts-ignore
          source = source.replace(Tokens.A_LOWER, vowels.includes(letterToCheck.toLowerCase()) ? 'an' : 'a');
        }
      }
    }
    // (A)
    var a_2 = new RegExp(Tokens.A_UPPER);
    if (source.match(a_2)) {
      while (source.match(a_2)) {
        let index = source.indexOf(Tokens.A_UPPER);
        // Reached the end of the string
        if (index + offset > source.length) {
          break;
        } else {
          let letterToCheck = source[index + offset];
          // @ts-ignore
          source = source.replace(Tokens.A_UPPER, vowels.includes(letterToCheck.toLowerCase()) ? 'An' : 'A');
        }
      }
    }
    return source;
  }

  parseLists (lists: string [], source: string): string {
    // Process each list
    lists.forEach((listGroup: string) => {
      let uniqueOptionReferenceIndex = {};
      let uniqueOptions = false;
      // Divide on each pipe
      const listReferences: string[] = listGroup.split('|');
      let results = [];
      let weighted = false;
      let joinDelimiter;
      listReferences.forEach((listReference, referenceIndex) => {
          let [accessor] = listReference.match(/[a-zA-ZÀ-ÿ\.]+/);
          let scalar;
          // Parse out the scalar for frequency
          if (listReference.indexOf('^') !== -1) {
              scalar = listReference.split('^')[1].match(/[0-9]+/).join('');
          }
          // Parse out unique
          let quantity;
          if (listReference.indexOf(`:${Tokens.UNIQUE}`) !== -1) {
              quantity = listReference.split(`:${Tokens.UNIQUE}`)[1].match(/[0-9]+/).join(''); // pretty sure this will fuck with join with numeric delimeters
              uniqueOptions = true;
          }
          // Parse joins
          joinDelimiter;
          if (listReference.indexOf(`:${Tokens.JOIN}`) !== -1) {
            joinDelimiter = listReference.split(`:${Tokens.JOIN}`)[1].match(/\'(.*?)\'/)[0].replace(/\'/g, '');
          }
          // Unique selections have to select from a list
          let result;
          if (uniqueOptions && quantity) {
              result = this.deepDive(accessor, true);
              uniqueOptionReferenceIndex[referenceIndex] = {
                  result,
                  quantity
              };
              // i.e. results [1^10, 'frog', 5]
              if (scalar) {
                  weighted = true;
                  results.push(`${referenceIndex}^${scalar}`);
                  // i.e. results [1, 'frog', 5]
              }
              else {
                  results.push(`${referenceIndex}`);
              }
              // Regular - thank god  
          }
          else {
              result = this.deepDive(accessor);
              if (scalar) {
                  weighted = true;
                  results.push(`${result}^${scalar}`);
              }
              else {
                  results.push(result);
              }
          }
      });
      // Unique lists mess with everything
      if (uniqueOptions) {
          let intermediarySelection;
          if (weighted) {
              intermediarySelection = weightedPluck(results, this.random);
          }
          else {
              intermediarySelection = pluck(results, this.random);
          }
          // The selected item was part of a unique list selection
          if (uniqueOptionReferenceIndex[intermediarySelection]) {
              // @TODO this might become an issue for selecting from a list of numeric values
              const uniqueSelection = uniqueOptionReferenceIndex[intermediarySelection];
              const { result, quantity } = uniqueSelection;
              if (quantity > result.length) {
                  source = source.replace(listGroup, result.join(joinDelimiter || Tokens.SPACE));
              }
              else {
                  source = source.replace(listGroup, this.reducePluck(result, quantity).join(joinDelimiter || Tokens.SPACE));
              }
          }
          else {
              source = source.replace(listGroup, intermediarySelection);
          }
          // Replace the list group for each section
      }
      else {
          source = source.replace(listGroup, weighted ? weightedPluck(results, this.random) : pluck(results, this.random));
      }
    });
    return source;
  }

  // This takes quantity values from arr, ensuring that either the entire
  // array or a selection of values are returned
  reducePluck(arr: string[], quantity: number): string[] {
    let values: string[] = [];
    let mut: string[] = [].concat(arr);
    if (quantity > arr.length) {
      return arr;
    }
    for (let i = 0; i < quantity; i++) {
        const value = pluck(mut, this.random);
        values.push(value);
        const index = mut.indexOf(value);
        mut.splice(index, 1);
    }
    return values;
}

  parseAdHocLists (adHocLists: string[], source: string): string {
    adHocLists.forEach((listGroup) => {
      if (listGroup !== Tokens.A_LOWER && listGroup !== Tokens.A_UPPER) {
        const choices = listGroup.replace(/\{/g, '').replace(/\}/g, '').split('|');
        let weighted = false
        choices.forEach((choice) => {
          if (choice.indexOf('^') !== -1) {
            weighted = true;
          }
        })
        source = source.replace(listGroup, weighted ? weightedPluck(choices, this.random) : pluck(choices, this.random));
      }
    });
    return source;
  }

  /**
   * Recursively unfurl an object
   * @param accessor {string}
   */
  deepDive (accessor: string, returnEntireArray?: boolean): string|string[] {
    let selections: string[] = [];
    let a: string|string[];
    let ref: any = this.lists;
    if (accessor.indexOf('.') !== -1) {
      a = accessor.split('.');
      a.forEach((k) => {
        ref = ref[k];
      });
    } else {
      ref = ref[accessor];
    }
    const diveIn = (swimmingPool: any) => {
      if (Array.isArray(swimmingPool)) {
        selections = selections.concat(swimmingPool);
      } else if (typeof swimmingPool === 'object') {
          const keys = Object.keys(swimmingPool);
          keys.forEach((key) => {
            diveIn(swimmingPool[key]);
          });
      } else {
      }
    }
    diveIn(ref);
    if (returnEntireArray) {
      return selections;
    }
    else {
      return pluck(selections, this.random);
    }
  }

  /**
   * Recursively unfurl and object
   * @param accessor {string}
   */
  deepDiveRetrieve (accessor: string, returnEntireArray?: boolean): ArbitraryData|ArbitraryData[] {
    let selections = [];
    let a: string|string[];
    let ref: any = this.lists;
    if (accessor.indexOf('.') !== -1) {
      a = accessor.split('.');
      a.forEach((k) => {
        ref = ref[k];
      });
    } else {
      ref = ref[accessor];
    }
    const diveIn = (swimmingPool: any) => {
      if (Array.isArray(swimmingPool)) {
        selections = selections.concat(swimmingPool);
      } else if (typeof swimmingPool === 'object') {
          // This is for fetching datastructures from legendary
          if (swimmingPool.val) {
            selections.push(swimmingPool);
          } else {
            const keys = Object.keys(swimmingPool);
            keys.forEach((key) => {
              diveIn(swimmingPool[key]);
            });
          }
      } else {
      }
    }
    diveIn(ref);
    if (returnEntireArray) {
      return selections;
    }
    else {
      return pluck(selections, this.random);
    }
  }

  recursiveslyParse = (str: string): string => {
    let parsed = this.parse(str);
    if (str === parsed) {
      return parsed;
    } else {
      return this.recursiveslyParse(parsed);
    }
  }

  /**
   * Returns the next seeded randomInt
   * @param min
   * @param max 
   */
  randomIntSeeded (min: number, max: number) {
    return randomInt(min, max, this.random);
  }

}

export default Parser;
export { ArbitraryData };