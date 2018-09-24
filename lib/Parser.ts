import { randomInt, pluck, weightedPluck } from './Random';

// Data container for any arbitrary kind of data
interface ArbitraryData {
  val: string,
  [key: string]: any
}

enum Tokens {
  A_LOWER = '{a}',
  A_UPPER = '{A}',
  SPACE = ' '
}

const vowels: string[] = ['a', 'e', 'i', 'o', 'u', 'y'];

class Parser {

  public lists;

  constructor (dictionary: object) {
    // Load language libraries
    this.lists = dictionary;
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
        if (result.val && result.val.indexOf('^') !== -1) {

        } else if (result.indexOf('^') !== -1) {
          weighted = true;
        }
      });
      selection = weighted ? weightedPluck(results) : pluck(results);
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
   * {a} - uses a/an on the next word
   * {A} - uses A/An on the next word
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
      listReferences.forEach((listReference, referenceIndex) => {
          let [accessor] = listReference.match(/[a-zA-ZÀ-ÿ-\s]+/);
          let scalar;
          // Parse out the scalar for frequency
          if (listReference.indexOf('^') !== -1) {
              scalar = listReference.split('^')[1].match(/[0-9]+/).join('');
          }
          // Parse out unique
          let quantity;
          if (listReference.indexOf(':') !== -1) {
              quantity = listReference.split(':')[1].match(/[0-9]+/).join('');
              uniqueOptions = true;
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
              intermediarySelection = weightedPluck(results);
          }
          else {
              intermediarySelection = pluck(results);
          }
          // The selected item was part of a unique list selection
          if (uniqueOptionReferenceIndex[intermediarySelection]) {
              // @TODO this might become an issue for selecting from a list of numeric values
              const uniqueSelection = uniqueOptionReferenceIndex[intermediarySelection];
              const { result, quantity } = uniqueSelection;
              if (quantity > result.length) {
                  source = source.replace(listGroup, result.join(Tokens.SPACE));
              }
              else {
                  source = source.replace(listGroup, this.reducePluck(result, quantity).join(Tokens.SPACE));
              }
          }
          else {
              source = source.replace(listGroup, intermediarySelection);
          }
          // Replace the list group for each section
      }
      else {
          source = source.replace(listGroup, weighted ? weightedPluck(results) : pluck(results));
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
        const value = pluck(mut);
        values.push(value);
        const index = mut.indexOf(value);
        mut.splice(index, 1);
    }
    return values;
}

  parseAdHocLists (adHocLists: string[], source: string): string {
    adHocLists.forEach((listGroup) => {
      const choices = listGroup.replace(/\{/g, '').replace(/\}/g, '').split('|');
      let results = [];
      let weighted = false;
      choices.forEach((choice) => {
        const [result] = choice.match(/([a-zA-Z\s\^\.0-9])+/);
        results.push(result);
        if (result.indexOf('^') !== -1) {
          weighted = true;
        }
      });
      source = source.replace(listGroup, weighted ? weightedPluck(results) : pluck(results));
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
      return pluck(selections);
    }
  }

  /**
   * Recursively unfurl and object
   * @param accessor {string}
   */
  deepDiveRetrieve (accessor: string, returnEntireArray?: boolean): ArbitraryData {
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
      return pluck(selections);
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

}

export { Parser, ArbitraryData };