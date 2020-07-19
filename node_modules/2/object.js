'use strict'

const toString = require('./string')

/**
 * Converts a Map or array into an object.
 * @param  {any} thingToConvert
 * @param  {object} options
 * @param  {object|null} [options.fallback={}]
 *   The object to return if `thingToConvert` cannot be turned into an object.
 *   Set to `null` to throw an error instead.
 * @param  {bool} [options.mirror=false]
 *   This option only applies if `thingToConvert` is an array.
 *   If set to `true`, array values are used as both keys and values
 *   (i.e. the keys and values mirror each other).
 *   If `false`, array indices (0 to n-1) are used as the object keys.
 *   If some array values have types which are among those supported as
 *   object keys (strings, numbers, and symbols), then mirroring will not happen.
 * @return {object}
 */
module.exports = function (thingToConvert, {fallback = {}, mirror = false} = {}) {
  if (thingToConvert instanceof Map) {
    const object = {}
    for (const [key, value] of thingToConvert.entries()) {
      try {
        object[typeof key === 'symbol' ? key : toString(key, {fallback: null})] = value
      } catch (x) {
        throw new TypeError('Cannot convert map to object because map has keys which objects do not support. Objects can only have string/number/symbol keys.')
      }
    }
    return object
  } else if (Array.isArray(thingToConvert)) {
    if (thingToConvert.every(entry => Array.isArray(entry) && entry.length === 2)) {
      const object = {}
      for (const [key, value] of thingToConvert) {
        object[key] = value
      }
      return object
    } else if (mirror && thingToConvert.every(value => ['string', 'number', 'symbol'].includes(typeof value))) {
      const object = {}
      for (const value of thingToConvert) {
        object[value] = value
      }
      return object
    } else {
      const object = {}
      for (let i = 0; i < thingToConvert.length; i++) {
        object[i] = thingToConvert[i]
      }
      return object
    }
  } else if (typeof thingToConvert === 'object' && thingToConvert !== null) {
    return thingToConvert
  }

  if (typeof fallback !== 'object' || fallback === null) {
    throw new TypeError('Failed to convert input of an unrecognized type into an object.')
  }

  return fallback
}
