interface ArbitraryData {
    val: string;
    [key: string]: any;
}
declare class Parser {
    lists: any;
    constructor(dictionary: object);
    /**
     * Does things similar to parse, but retrieves the arbitrary data object
     */
    retrieve(source: string): ArbitraryData;
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
    parse(source: string): string;
    parseLists(lists: string[], source: string): string;
    reducePluck(arr: string[], quantity: number): string[];
    parseAdHocLists(adHocLists: string[], source: string): string;
    /**
     * Recursively unfurl an object
     * @param accessor {string}
     */
    deepDive(accessor: string, returnEntireArray?: boolean): string | string[];
    /**
     * Recursively unfurl and object
     * @param accessor {string}
     */
    deepDiveRetrieve(accessor: string, returnEntireArray?: boolean): ArbitraryData | ArbitraryData[];
    recursiveslyParse: (str: string) => string;
}
export default Parser;
export { ArbitraryData };
