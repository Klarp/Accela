'use strict'

const toNumber = require('2/number')

module.exports = function enforceRange (min, max, value) {
  if (arguments.length === 2) return v => enforceRange(min, max, v)

  if (min === null) min = -Infinity
  if (max === null) max = Infinity
  ;[min, max, value] = [min, max, value].map(n => toNumber(n, {fallback: null, finite: false}))
  if (min > max) throw new RangeError('min cannot be more than max')
  value = Math.max(min, value)
  value = Math.min(max, value)
  return value
}
