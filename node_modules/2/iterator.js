'use strict'

/**
 * Converts an iterable, an object, or a primitive into an iterator.
 * @param  {any} thingToConvert
 * @return {object}
 */
module.exports = function (thingToConvert) {
  // Turn undefined/null/NaN into an empty iterator
  if (typeof thingToConvert === 'undefined' || thingToConvert === null || Number.isNaN(thingToConvert)) {
    return [][Symbol.iterator]()
  }

  // Turn a primitive into an iterator
  if (typeof thingToConvert !== 'object') {
    return [thingToConvert][Symbol.iterator]()
  }

  // Turn an Array, Set, Map, etc. into an iterator
  if (Symbol.iterator in thingToConvert) {
    return thingToConvert[Symbol.iterator]()
  }

  // Turn an object into an iterator
  return Object.entries(thingToConvert)[Symbol.iterator]()
}
