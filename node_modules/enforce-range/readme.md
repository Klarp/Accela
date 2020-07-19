# enforce-range

Enforce a minimum and/or maximum value for a number.

## Installation

```bash
npm install enforce-range --save
```

## Usage

```javascript
const enforceRange = require('enforce-range')

// Number should be between 0 and 100
enforceRange(0, 100, 51) // 51
enforceRange(0, 100, -123) // 0
enforceRange(0, 100, 456) // 100
```

### Partial Application

If you provide only the first two arguments (a minimum and a maximum value), the module will create a partially-applied function which enforces that range. Here's the above example repeated with this usage mode:

```javascript
const enforce0to100 = require('enforce-range')(0, 100)

// Number should be between 0 and 100
enforce0to100(51) // 51
enforce0to100(-123) // 0
enforce0to100(456) // 100
```

### Open-Ended Ranges

If, for some reason, you want this module to enforce a range that is only bound on one end, you can do so by passing `null` or ±`Infinity` as the minimum/maximum value. (However, in such a case you’re probably better off cutting the overhead of using a module and just using `Math.min()` or `Math.max()`.)

```javascript
const enforceRange = require('enforce-range')

// Maximum only
enforceRange(null, 100, 200) // 100
enforceRange(-Infinity, 100, 200) // 100

// Minimum only
enforceRange(0, null, 51) // 51
enforceRange(0, Infinity, 51) // 51

// No range enforcement at all (module does nothing)
enforceRange(null, null, 12345) // 12345
enforceRange(-Infinity, Infinity, 12345) // 12345
```
