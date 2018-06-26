# Ossuary

![ossuary](https://farm1.staticflickr.com/889/40606048085_9b7eb9083c_o.jpg)

# About

Ossuary is a random word parser. It is _not_ a generator. In order for Ossuary to work properly, you have to supply it with either ad hoc lists or a JSON / JavaScript Object library.

# Usage

Import Ossuary and instantiate it by passing an object or `require` if using Node.

```
const Ossuary = require('Ossuary');
const ossuary = new Ossuary(require('./myDictionary'));
ossuary.parse(...);
```

# Syntax

## Ad Hoc Lists

Ad hoc lists are easier to explain, so we'll start with those. When presented with a string to parse `I have a pet {dog|cat}`, parse will select either the string `dog` or `cat` with equal weight. Ad hoc lists can be extended indefinitely and can include numbers and letters.

## Weight

You can also weight ad hoc lists (and regular lists) with `^n` syntax where `n` is an integer when above 0 or a decimal below zero. An example of this would be the string `I'd like to eat {pie^10|salad}` where pie would occur 10 times more frequently than salad (it's not 10 times as _likely_ as any given item because the number of items is arbitrary). In fact, this is the same as writing `I'd like to eat {pie|salad^.1}`.

## Dictionary Lists

The data that is provided to Ossuary must be structured. Consider the following string `I like [pets].` Parsing this string, Ossuary selects one unique item (this is implied as the selection set is 1) from the top-level accessor `pets`. The structure of the dictionary must have a top-level key with the signature `pets: string[]`.

When parsing Something like `I could really go for some [muffins|cereal].` Would then select one options from either `muffins` or `cereal`.

## List Accessors

Data in dictionaries should be structure as a tree where each branch becomes more specific in nature. For example, a dicitonary could contain top-level `animals` which itself has `mammals`, `birds`, `insects`, etc. This allows for the use of nested list accessors i.e. `The zoo has a [animals.mammals|animals.reptiles|plants].`. This would return a mammal, a reptile, or any plant. Ossuary _unwinds_ deeply-nested arrays into a single array, so each of these keys could have more categories before arriving at the required final signature of `key: string[]`.

## Unique Selection