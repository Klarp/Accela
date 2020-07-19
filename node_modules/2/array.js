'use strict'

/**
 * Converts a map, iterable, object, or primitive into an array.
 * @param  {any} thingToConvert
 * @param  {object} options
 * @param  {bool} [options.detectIndexKeys=false] Whether or not map/object keys
 *   should be assumed to represent array indices if the keys go from 0...n-1
 * @return {array}
 */
module.exports = function (thingToConvert, {detectIndexKeys = false} = {}) {
  if (typeof thingToConvert === 'undefined' || thingToConvert === null || Number.isNaN(thingToConvert)) {
    return []
  }

  if (Array.isArray(thingToConvert)) {
    return thingToConvert
  }

  if (thingToConvert instanceof Map) {
    if (detectIndexKeys && JSON.stringify([...thingToConvert.keys()].map(String)) === JSON.stringify([...Array(thingToConvert.size).keys()].map(String))) {
      return Array.from(thingToConvert.values())
    } else {
      return Array.from(thingToConvert)
    }
  }

  if (typeof thingToConvert[Symbol.iterator] !== 'undefined' && typeof thingToConvert !== 'string') {
    return Array.from(thingToConvert)
  }

  if (typeof thingToConvert === 'object' && thingToConvert !== null) {
    const objectKeysArray = [...Object.keys(thingToConvert)]
    objectKeysArray.sort() // JS does not guarantee object key order, so sort the keys.
    if (detectIndexKeys && JSON.stringify(objectKeysArray) === JSON.stringify([...Array(Object.keys(thingToConvert).length).keys()].map(String))) {
      return objectKeysArray.map(key => thingToConvert[key])
    } else {
      return Object.entries(thingToConvert)
    }
  }

  return [thingToConvert]
}
