'use strict'

/**
 * Converts a string or Number object into a primitive number.
 * @param  {any} thingToConvert
 * @param  {object} options
 * @param  {number|null} [options.fallback=0]
 *   The number to return if `thingToConvert` cannot be turned into a number.
 *   Set to `null` to throw an error instead.
 * @param  {bool} [options.finite=true]
 *   If true, only finite numbers are considered valid numbers.
 *   Therefore, if `thingToConvert` is `+Infinity` or `-Infinity`,
 *   the `fallback` will be returned.
 * @param  {bool} [options.round=false]
 *   If `true`, floats will be rounded to integers.
 * @return {number}
 */
module.exports = function (thingToConvert, {fallback = 0, finite = true, round = false} = {}) {
  let number = thingToConvert === null ? NaN : Number(thingToConvert)
  if (Number.isFinite(number) || (!finite && !Number.isNaN(number))) {
    if (round) number = Math.round(number)
    return number
  }

  if (fallback instanceof Number) {
    return Number(fallback)
  } else if (typeof fallback !== 'number') {
    throw new TypeError('Failed to convert input of an unrecognized type into a number.')
  }

  if (round) fallback = Math.round(fallback)
  return fallback
}
