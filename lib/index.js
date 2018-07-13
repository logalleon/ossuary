define("RRange", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var RRange = /** @class */ (function () {
        function RRange(low, high) {
            this.low = low;
            this.high = high;
        }
        RRange.prototype.diff = function () {
            return this.high - this.low;
        };
        return RRange;
    }());
    exports.RRange = RRange;
});
define("Random", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var pluck = function (arr) {
        return arr[randomInt(0, arr.length - 1)];
    };
    exports.pluck = pluck;
    var weightedPluck = function (arr) {
        var scalars = {};
        var items = [].concat(arr);
        var scaleMax = 0;
        var min = 1;
        var max = 1;
        items.forEach(function (el, i) {
            if (el.match(/\^/g)) {
                var _a = el.split('^'), str = _a[0], scalar_1 = _a[1];
                scalars[i] = Number(scalar_1);
                items[i] = str;
                // Default scale if at least one item is scaled is 1
            }
            else {
                scalars[i] = 1;
            }
            var scalar = scalars[i];
            min = scalar < min ? scalar : min;
            max = scalar > max ? scalar : max;
        });
        var scale = max / min;
        items.forEach(function (el, i) {
            scaleMax += scale * (scalars[i] ? scalars[i] : 1);
        });
        var weightedSelection;
        var currentIndex = 0;
        var atIndex = randomInt(0, scaleMax);
        for (var i = 0; i < items.length; i++) {
            currentIndex += scale * (scalars[i] ? scalars[i] : 1);
            if (atIndex <= currentIndex) {
                weightedSelection = items[i];
                break;
            }
        }
        return weightedSelection;
    };
    exports.weightedPluck = weightedPluck;
    var randomInt = function (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; };
    exports.randomInt = randomInt;
    var randomIntR = function (range) {
        return randomInt(range.low, range.high);
    };
    exports.randomIntR = randomIntR;
    var clamp = function (value, low, high) {
        if (value < low) {
            return low;
        }
        if (value > high) {
            return high;
        }
        return value;
    };
    exports.clamp = clamp;
});
define("Ossuary", ["require", "exports", "Random"], function (require, exports, Random_1) {
    "use strict";
    exports.__esModule = true;
    var Tokens;
    (function (Tokens) {
        Tokens["A_LOWER"] = "{a}";
        Tokens["A_UPPER"] = "{A}";
        Tokens["SPACE"] = " ";
    })(Tokens || (Tokens = {}));
    var vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
    var Ossuary = /** @class */ (function () {
        function Ossuary(dictionary) {
            // Load language libraries
            this.lists = dictionary;
        }
        /**
         * Does things similar to parse, but retrieves the arbitrary data object
         */
        Ossuary.prototype.retrieve = function (source) {
            var _this = this;
            var lists = source.match(/\[.+\]/g);
            var selection;
            lists.forEach(function (listGroup) {
                var listReferences = listGroup.split('|');
                var results = [];
                var weighted = false;
                listReferences.forEach(function (listReference) {
                    var accessor = listReference.match(/([a-zA-Z\^\.[0-9])+/)[0];
                    accessor = accessor.replace('[', '').replace(']', '');
                    var result = _this.deepDiveRetrieve(accessor);
                    results.push(result);
                    if (result.val && result.val.indexOf('^') !== -1) {
                    }
                    else if (result.indexOf('^') !== -1) {
                        weighted = true;
                    }
                });
                selection = weighted ? Random_1.weightedPluck(results) : Random_1.pluck(results);
            });
            return selection;
        };
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
        Ossuary.prototype.parse = function (source) {
            var bracketLists = source.match(/\[.+?\]/g);
            var curlyLists = source.match(/\{.+?\}/g);
            source = Array.isArray(bracketLists) ? this.parseLists(bracketLists.filter(this.filterEmpty), source) : source;
            if (curlyLists) {
                var adHocLists = this.filterATags(curlyLists.filter(this.filterEmpty));
                source = Array.isArray(adHocLists) ? this.parseAdHocLists(adHocLists, source) : source;
                if (source.indexOf(Tokens.A_LOWER) !== -1) {
                    source = this.replaceATags(source, Tokens.A_LOWER);
                }
                if (source.indexOf(Tokens.A_UPPER) !== -1) {
                    source = this.replaceATags(source, Tokens.A_UPPER);
                }
            }
            return source;
        };
        /**
         * Removes a/an tags from a curly brace list
         * @param arr {string[]}
         */
        Ossuary.prototype.filterATags = function (arr) {
            var filtered = [];
            arr.forEach(function (str, index) {
                if (str !== Tokens.A_LOWER && str !== Tokens.A_UPPER) {
                    filtered.push(arr[index]);
                }
            });
            return filtered;
        };
        /**
         * Removes empty items
         * @TODO this probably has to be smarter
         * @param arr
         */
        Ossuary.prototype.filterEmpty = function (str) {
            return str.trim().length !== 0;
        };
        /**
         * Replaces a/an tags with their appropriate token
         * @param source
         * @param tag
         */
        Ossuary.prototype.replaceATags = function (source, tag) {
            var raw = tag.match(/[a-zA-Z]/g).join('');
            while (source.indexOf(tag) !== -1) {
                var index = source.indexOf(tag);
                // 4 is the length of the tag plus the next space
                var nextLetter = source[index + 4];
                if (vowels.includes(nextLetter)) {
                    source = source.slice(0, index) + raw + 'n' + ' ' + source.slice(index + 4);
                }
                else {
                    source = source.slice(0, index) + raw + ' ' + source.slice(index + 4);
                }
            }
            return source;
        };
        /**
         *
         * @param lists
         * @param source
         */
        Ossuary.prototype.parseLists = function (lists, source) {
            var _this = this;
            // Process each list
            lists.forEach(function (listGroup) {
                var uniqueOptionReferenceIndex = {};
                var uniqueOptions = false;
                // Divide on each pipe
                var listReferences = listGroup.split('|');
                var results = [];
                var weighted = false;
                listReferences.forEach(function (listReference, referenceIndex) {
                    var accessor = listReference.match(/[a-zA-ZÀ-ÿ-\s]+/)[0];
                    var scalar;
                    // Parse out the scalar for frequency
                    if (listReference.indexOf('^') !== -1) {
                        scalar = listReference.split('^')[1].match(/[0-9]+/).join('');
                    }
                    // Parse out unique
                    var quantity;
                    if (listReference.indexOf(':') !== -1) {
                        quantity = listReference.split(':')[1].match(/[0-9]+/).join('');
                        uniqueOptions = true;
                    }
                    // Unique selections have to select from a list
                    var result;
                    if (uniqueOptions && quantity) {
                        result = _this.deepDive(accessor, true);
                        uniqueOptionReferenceIndex[referenceIndex] = {
                            result: result,
                            quantity: quantity
                        };
                        // i.e. results [1^10, 'frog', 5]
                        if (scalar) {
                            weighted = true;
                            results.push(referenceIndex + "^" + scalar);
                            // i.e. results [1, 'frog', 5]
                        }
                        else {
                            results.push("" + referenceIndex);
                        }
                        // Regular - thank god  
                    }
                    else {
                        result = _this.deepDive(accessor);
                        if (scalar) {
                            weighted = true;
                            results.push(result + "^" + scalar);
                        }
                        else {
                            results.push(result);
                        }
                    }
                });
                // Unique lists mess with everything
                if (uniqueOptions) {
                    var intermediarySelection = void 0;
                    if (weighted) {
                        intermediarySelection = Random_1.weightedPluck(results);
                    }
                    else {
                        intermediarySelection = Random_1.pluck(results);
                    }
                    // The selected item was part of a unique list selection
                    if (uniqueOptionReferenceIndex[intermediarySelection]) {
                        // @TODO this might become an issue for selecting from a list of numeric values
                        var uniqueSelection = uniqueOptionReferenceIndex[intermediarySelection];
                        var result = uniqueSelection.result, quantity = uniqueSelection.quantity;
                        if (quantity > result.length) {
                            source = source.replace(listGroup, result.join(Tokens.SPACE));
                        }
                        else {
                            source = source.replace(listGroup, _this.reducePluck(result, quantity).join(Tokens.SPACE));
                        }
                    }
                    else {
                        source = source.replace(listGroup, intermediarySelection);
                    }
                    // Replace the list group for each section
                }
                else {
                    source = source.replace(listGroup, weighted ? Random_1.weightedPluck(results) : Random_1.pluck(results));
                }
            });
            // Return the wholly modified source
            return source;
        };
        Ossuary.prototype.reducePluck = function (arr, quantity) {
            var values = [];
            var mut = [].concat(arr);
            for (var i = 0; i < quantity; i++) {
                var value = Random_1.pluck(mut);
                values.push(value);
                var index = mut.indexOf(value);
                mut.splice(index, 1);
            }
            return values;
        };
        Ossuary.prototype.parseAdHocLists = function (adHocLists, source) {
            adHocLists.forEach(function (listGroup) {
                var choices = listGroup.replace(/\{/g, '').replace(/\}/g, '').split('|');
                var results = [];
                var weighted = false;
                choices.forEach(function (choice) {
                    var result = choice.match(/([a-zA-ZÀ-ÿ-\s\^\.0-9])+/)[0];
                    results.push(result);
                    if (result.indexOf('^') !== -1) {
                        weighted = true;
                    }
                });
                source = source.replace(listGroup, weighted ? Random_1.weightedPluck(results) : Random_1.pluck(results));
            });
            return source;
        };
        /**
         * Recursively unfurl an object
         * @param accessor {string}
         */
        Ossuary.prototype.deepDive = function (accessor, array) {
            var selections = [];
            var a;
            var ref = this.lists;
            if (accessor.indexOf('.') !== -1) {
                a = accessor.split('.');
                a.forEach(function (k) {
                    ref = ref[k];
                });
            }
            else {
                ref = ref[accessor];
            }
            if (typeof ref === 'undefined') {
                return [];
            }
            var diveIn = function (swimmingPool) {
                if (Array.isArray(swimmingPool)) {
                    selections = selections.concat(swimmingPool);
                }
                else if (typeof swimmingPool === 'object') {
                    var keys = Object.keys(swimmingPool);
                    keys.forEach(function (key) {
                        diveIn(swimmingPool[key]);
                    });
                }
                else {
                }
            };
            diveIn(ref);
            if (array) {
                return selections;
            }
            else {
                return Random_1.pluck(selections);
            }
        };
        /**
         * Recursively unfurl and object
         * @param accessor {string}
         */
        Ossuary.prototype.deepDiveRetrieve = function (accessor) {
            var selections = [];
            var a;
            var ref = this.lists;
            if (accessor.indexOf('.') !== -1) {
                a = accessor.split('.');
                a.forEach(function (k) {
                    ref = ref[k];
                });
            }
            else {
                ref = ref[accessor];
            }
            var diveIn = function (swimmingPool) {
                if (Array.isArray(swimmingPool)) {
                    selections = selections.concat(swimmingPool);
                }
                else if (typeof swimmingPool === 'object') {
                    // This is for fetching datastructures from legendary
                    if (swimmingPool.val) {
                        selections.push(swimmingPool);
                    }
                    else {
                        var keys = Object.keys(swimmingPool);
                        keys.forEach(function (key) {
                            diveIn(swimmingPool[key]);
                        });
                    }
                }
                else {
                }
            };
            diveIn(ref);
            return Random_1.pluck(selections);
        };
        return Ossuary;
    }());
    exports.Ossuary = Ossuary;
});
