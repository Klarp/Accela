'use strict'

/**
 * Converts a number or `toString`able object into a primitive string.
 * @param  {any} thingToConvert
 * @param  {object} options
 * @param  {string|null} [options.fallback='']
 *   The string to return if `thingToConvert` cannot be turned into a string.
 *   Set to `null` to throw an error instead.
 * @return {string}
 */
module.exports = function (thingToConvert, {fallback = ''} = {}) {
  if (typeof thingToConvert === 'string') {
    return thingToConvert
  }

  if (thingToConvert instanceof String) {
    return thingToConvert + ''
  }

  if (typeof thingToConvert === 'number' && Number.isFinite(thingToConvert)) {
    return thingToConvert + ''
  }

  if (typeof thingToConvert === 'object' && thingToConvert !== null &&
      thingToConvert.toString !== Object.prototype.toString) {
    return String(thingToConvert)
  }

  if (fallback instanceof String) {
    return fallback + ''
  } else if (typeof fallback !== 'string') {
    throw new TypeError('Failed to convert input of an unrecognized type into a string.')
  }

  return fallback
}
