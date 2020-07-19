# 3

Performs a multi-level three-way comparison on numbers/strings and returns 1, 0, or -1.

Primarily useful in complex [`sort()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) callbacks.

## Installation

```bash
npm install 3 --save
```

## Usage

```javascript
const compare3Way = require('3')

const people = [
  {name: 'John', age: 27},
  {name: 'Stephen', age: 26},
  {name: 'John', age: 25},
]

// Sort by name
people.sort((a, b) => compare3Way(a.name, b.name)) // John, John, Stephen

// Sort by age
people.sort((a, b) => compare3Way(a.age, b.age)) // John, Stephen, John

// Multi-level sort: First by name, then by age
people.sort((a, b) => compare3Way(a.name, b.name, a.age, b.age)) // John (#2), John (#1), Stephen

// Normally empty strings are sorted so they come first,
// but you can use the `emptyStringsLast` option to change that.
compare3Way('', 'str') // -1
compare3Way('', 'str', {emptyStringsLast: true}) // 1
```
