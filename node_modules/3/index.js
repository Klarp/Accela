'use strict'

const {pairs} = require('chunk-array')
const enforceRange = require('enforce-range')(-1, 1)
const isNumber = x => typeof x === 'number' && !Number.isNaN(x)
const isOdd = x => x % 2 === 1
const toString = require('2/string')

module.exports = function threeWayCompare (...values) {
  const options = isOdd(values.length) ? values.pop() : {}
  let c = 0
  for (const [a, b] of pairs(values)) {
    c = comparePair(a, b, options)
    if (c !== 0) break
  }
  return c
}

function comparePair (a, b, {emptyStringsLast = false} = {}) {
  if (isNumber(a) && isNumber(b)) {
    // Do comparison instead of subtraction so that ±Infinity is properly handled
    if (a < b) return -1
    if (a > b) return 1
    return 0
  } else {
    a = toString(a)
    b = toString(b)
    if (emptyStringsLast) {
      if (a === '' && b !== '') return 1
      if (b === '' && a !== '') return -1
    }

    // Make sure localeCompare returns -1, 0, or 1
    return enforceRange(a.localeCompare(b))
  }
}
