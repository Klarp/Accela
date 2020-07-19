'use strict'

/**
 * Converts an array or object into a Map.
 * @param  {any} thingToConvert
 * @param  {object} options
 * @param  {Map|null} [options.fallback=new Map()]
 *   The Map to return if `thingToConvert` cannot be turned into a Map.
 *   Set to null to throw an error instead.
 * @param  {bool} [options.detectPairs=true]
 *   This option only applies if `thingToConvert` is an array.
 *   If set to `true`, an array of two-element arrays (the kind that’s used
 *   to construct a Map) will be treated as an array of key-value entries.
 * @param  {bool} [options.mirror=false]
 *   This option only applies if `thingToConvert` is an array.
 *   If set to `true`, array values are used as both keys and values
 *   (i.e. the keys and values mirror each other).
 *   If `false`, array indices (0 to n-1) are used as the Map keys.
 * @return {Map}
 */
module.exports = function (thingToConvert, {fallback = new Map(), detectPairs = true, mirror = false} = {}) {
  if (thingToConvert instanceof Map) {
    return thingToConvert
  }

  if (Array.isArray(thingToConvert)) {
    if (detectPairs && thingToConvert.every(item => Array.isArray(item) && item.length === 2)) {
      return new Map(thingToConvert)
    } else if (mirror) {
      return new Map(thingToConvert.map(item => [item, item]))
    } else {
      return new Map(thingToConvert.map((item, index) => [index, item]))
    }
  }

  if (typeof thingToConvert === 'object' && thingToConvert !== null) {
    return new Map(Object.keys(thingToConvert).map(
      key => [key, thingToConvert[key]]
    ))
  }

  if (!(fallback instanceof Map)) {
    throw new TypeError('Failed to convert input of an unrecognized type into a Map.')
  }

  return fallback
}
