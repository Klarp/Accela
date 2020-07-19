'use strict'

const assert = require('assert')
const {toArray, toIterator, toMap, toNumber, toObject, toString} = require('.')

describe('2', function () {
  describe('#toArray()', function () {
    it('should convert array to array', function () {
      const array = []
      assert.strictEqual(toArray(array), array)
    })

    it('should convert arguments object to array', function () {
      const array = ['first', 'second']

      function argumentsTest () {
        const args = toArray(arguments)
        assert(Array.isArray(args))
        assert.strictEqual(JSON.stringify(args), JSON.stringify(array))
      }

      argumentsTest.apply(null, array)
    })

    it('should convert Map to array', function () {
      const array = [['a', 'b']]
      const map = new Map(array)
      assert.strictEqual(JSON.stringify(toArray(map)), JSON.stringify(array))
    })

    it('should `detectIndexKeys` of array-like Map', function () {
      const map = new Map([[0, 'a'], ['1', 'b']])
      assert.strictEqual(JSON.stringify(toArray(map, {detectIndexKeys: true})), JSON.stringify(['a', 'b']))
    })

    it('should convert Set to array', function () {
      const array = [1, 2, 3]
      const set = new Set(array)
      assert.strictEqual(JSON.stringify(toArray(set)), JSON.stringify(array))
    })

    it('should convert object to array of key/value pairs', function () {
      const object = {a: 1, b: 2, c: 3}
      const array = [['a', 1], ['b', 2], ['c', 3]]
      assert.strictEqual(JSON.stringify(toArray(object)), JSON.stringify(array))
    })

    it('should `detectIndexKeys` of array-like object', function () {
      const object = {0: 'a', 1: 'b'}
      assert.strictEqual(JSON.stringify(toArray(object, {detectIndexKeys: true})), JSON.stringify(['a', 'b']))
    })

    it('should `detectIndexKeys` of array-like object with nonsequential keys', function () {
      const object = {1: 'b', 0: 'a'}
      assert.strictEqual(JSON.stringify(toArray(object, {detectIndexKeys: true})), JSON.stringify(['a', 'b']))
    })

    it('should convert primitive value to single-element array', function () {
      assert.strictEqual(JSON.stringify(toArray('test')), JSON.stringify(['test']))
    })

    for (const value of [undefined, null, NaN]) { // eslint-disable-line no-undefined
      it(`should convert ${value} to empty array`, function () {
        assert.strictEqual(JSON.stringify(toArray(value)), JSON.stringify([]))
      })
    }
  })

  describe('#toIterator()', function () {
    it('should convert primitive value to single-run iterator', function () {
      const iterator = toIterator('test')
      assert.strictEqual(typeof iterator, 'object')
      assert.strictEqual(typeof iterator.next, 'function')
      let r = iterator.next()
      assert.notEqual(r.done, true)
      assert.strictEqual(r.value, 'test')
      r = iterator.next()
      assert.strictEqual(r.done, true)
    })

    const valueTests = [
      ['should convert array to iterator', [1, 2]],
      ['should convert Set to iterator', new Set([1, 2])],
    ]

    for (const [description, object] of valueTests) {
      it(description, function () {
        const iterator = toIterator(object)
        assert.strictEqual(typeof iterator, 'object')
        assert.strictEqual(typeof iterator.next, 'function')
        let r = iterator.next()
        assert.notEqual(r.done, true)
        assert.strictEqual(r.value, 1)
        r = iterator.next()
        assert.notEqual(r.done, true)
        assert.strictEqual(r.value, 2)
        r = iterator.next()
        assert.strictEqual(r.done, true)
      })
    }

    const keyValueTests = [
      ['should convert Map to iterator', new Map([['a', 1], ['b', 2]])],
      ['should convert object to iterator', {a: 1, b: 2}],
    ]

    for (const [description, object] of keyValueTests) {
      it(description, function () {
        const iterator = toIterator(object)
        assert.strictEqual(typeof iterator, 'object')
        assert.strictEqual(typeof iterator.next, 'function')
        let r = iterator.next()
        assert.notEqual(r.done, true)
        assert(Array.isArray(r.value))
        assert.strictEqual(r.value.length, 2)
        assert.strictEqual(r.value[0], 'a')
        assert.strictEqual(r.value[1], 1)
        r = iterator.next()
        assert.notEqual(r.done, true)
        assert(Array.isArray(r.value))
        assert.strictEqual(r.value.length, 2)
        assert.strictEqual(r.value[0], 'b')
        assert.strictEqual(r.value[1], 2)
        r = iterator.next()
        assert.strictEqual(r.done, true)
      })
    }

    for (const value of [undefined, null, NaN]) { // eslint-disable-line no-undefined
      it(`should convert ${value} to empty iterator`, function () {
        const iterator = toIterator(value)
        assert.strictEqual(typeof iterator, 'object')
        const r = iterator.next()
        assert.strictEqual(r.done, true)
      })
    }
  })

  describe('#toMap()', function () {
    it('should convert Map to Map', function () {
      assert(toMap(new Map()) instanceof Map)
    })

    it('should convert array of key/value pairs to Map', function () {
      const map = toMap([['a', 1], ['b', 2]])
      assert.strictEqual(map.get('a'), 1)
      assert.strictEqual(map.get('b'), 2)
    })

    it('should convert values-only array to Map', function () {
      const a = {}
      const b = []
      const map = toMap([a, b])
      assert.strictEqual(map.get(0), a)
      assert.strictEqual(map.get(1), b)
    })

    it('should `mirror` array across keys and values', function () {
      const map = toMap(['100', 200], {mirror: true})
      assert.strictEqual(map.get('100'), '100')
      assert.strictEqual(map.get(200), 200)
    })

    it('should convert object to Map', function () {
      const map = toMap({a: 1, b: 2})
      assert.strictEqual(map.get('a'), 1)
      assert.strictEqual(map.get('b'), 2)
    })

    it('should convert primitive value to empty Map', function () {
      const map = toMap('not a map')
      assert(map instanceof Map)
      assert.strictEqual(map.size, 0)
    })

    it('should return the provided fallback if input is unconvertible', function () {
      const map = toMap('not a map', {fallback: new Map([['a', 1], ['b', 2]])})
      assert.strictEqual(map.get('a'), 1)
      assert.strictEqual(map.get('b'), 2)
    })

    it('should throw error if input is unconvertible and fallback is not a Map', function () {
      assert.throws(() => { toMap('not a map', {fallback: null}) }, TypeError)
    })
  })

  describe('#toNumber()', function () {
    it('should convert number to number', function () {
      assert.strictEqual(toNumber(1), 1)
    })

    it('should convert Number object to number', function () {
      assert.strictEqual(toNumber(new Number(1)), 1) // eslint-disable-line no-new-wrappers
    })

    it('should convert integer string to number', function () {
      assert.strictEqual(toNumber('100'), 100)
    })

    it('should convert integer String object to number', function () {
      assert.strictEqual(toNumber(new String('100')), 100) // eslint-disable-line no-new-wrappers
    })

    it('should convert float string to number', function () {
      assert.strictEqual(toNumber('1.2'), 1.2)
    })

    it('should round float to integer if `round` is true', function () {
      assert.strictEqual(toNumber(4.7, {round: true}), 5)
    })

    it('should return fallback (default 0) for Infinity', function () {
      assert.strictEqual(toNumber(Infinity), 0)
    })

    it('should allow +Infinity if `finite` is false', function () {
      assert.strictEqual(toNumber(Infinity, {finite: false}), Infinity)
    })

    it('should allow -Infinity if `finite` is false', function () {
      assert.strictEqual(toNumber(-Infinity, {finite: false}), -Infinity)
    })

    it('should return fallback (default 0) for NaN', function () {
      assert.strictEqual(toNumber(NaN), 0)
    })

    it('should return 0 if number is invalid and no fallback provided', function () {
      assert.strictEqual(toNumber('not a number'), 0)
    })

    it('should return the provided fallback if number is invalid', function () {
      assert.strictEqual(toNumber('not a number', {fallback: 2}), 2)
    })

    it('should round fallback if `round` is true', function () {
      assert.strictEqual(toNumber({}, {fallback: 3.3, round: true}), 3)
    })

    it('should convert Number object fallback to primitive number', function () {
      assert.strictEqual(typeof toNumber({}, {fallback: new Number(1)}), 'number') // eslint-disable-line no-new-wrappers
    })

    it('should throw error if number is invalid and fallback is not a number', function () {
      assert.throws(() => { toNumber('not a number', {fallback: null}) }, TypeError)
    })
  })

  describe('#toObject()', function () {
    it('should convert object to object', function () {
      const object = {a: 1, b: 2}
      assert.strictEqual(JSON.stringify(toObject(object)), JSON.stringify(object))
    })

    it('should convert array of key/value pairs to object', function () {
      const object = toObject([['a', 1], ['b', 2]])
      assert.strictEqual(object.a, 1)
      assert.strictEqual(object.b, 2)
    })

    it('should convert array of strings to object with numerical keys', function () {
      const object = toObject(['a', 'b'])
      assert.strictEqual(object[0], 'a')
      assert.strictEqual(object[1], 'b')
    })

    it('should `mirror` string array across keys and values', function () {
      const object = toObject(['100', '200'], {mirror: true})
      assert.strictEqual(object[100], '100')
      assert.strictEqual(object[200], '200')
    })

    it('should only `mirror` values to keys if all values can be object keys', function () {
      const nonKeyable = {}
      const object = toObject(['100', nonKeyable], {mirror: true})
      assert.strictEqual(object[0], '100')
      assert.strictEqual(object[1], nonKeyable)
    })

    it('should convert Map to object', function () {
      const object = toObject(new Map([['a', 1], ['b', 2]]))
      assert.strictEqual(object.a, 1)
      assert.strictEqual(object.b, 2)
    })

    it('should convert primitive value to empty object', function () {
      assert.strictEqual(JSON.stringify(toObject('not an object')), JSON.stringify({}))
    })

    it('should return the provided fallback if input is unconvertible', function () {
      assert.strictEqual(JSON.stringify(toObject('not an object', {fallback: {a: 1}})), JSON.stringify({a: 1}))
    })

    it('should throw error if input is unconvertible and fallback is not object', function () {
      assert.throws(() => { toObject('not an object', {fallback: null}) }, TypeError)
    })

    it('should throw error if Map has keys that are not strings/numbers', function () {
      assert.throws(() => { toObject(new Map([{}, 'test'])) }, TypeError)
    })
  })

  describe('#toString()', function () {
    it('should convert string to string', function () {
      assert.strictEqual(toString('test'), 'test')
    })

    it('should convert String object to string', function () {
      assert.strictEqual(typeof toString(new String('test')), typeof 'test') // eslint-disable-line no-new-wrappers
    })

    it('should convert number to string', function () {
      assert.strictEqual(toString(-123), '-123')
    })

    it('should convert 0 to "0"', function () {
      assert.strictEqual(toString(0), '0')
    })

    it('should convert -0 to "0"', function () {
      assert.strictEqual(toString(-0), '0')
    })

    it('should convert NaN to empty string', function () {
      assert.strictEqual(toString(NaN), '')
    })

    it('should convert Infinity to empty string', function () {
      assert.strictEqual(toString(Infinity), '')
    })

    it('should convert true to empty string', function () {
      assert.strictEqual(toString(true), '')
    })

    it('should convert false to empty string', function () {
      assert.strictEqual(toString(true), '')
    })

    it('should convert null to empty string', function () {
      assert.strictEqual(toString(null), '')
    })

    it('should convert undefined to empty string', function () {
      assert.strictEqual(toString(undefined), '') // eslint-disable-line no-undefined
    })

    it('should convert function to empty string', function () {
      assert.strictEqual(toString(function () {}), '')
    })

    it('should convert array to empty string', function () {
      assert.strictEqual(toString([]), '')
    })

    it('should convert plain object to empty string', function () {
      assert.strictEqual(toString({}), '')
    })

    it('should convert symbol to empty string', function () {
      assert.strictEqual(toString(Symbol('test')), '')
    })

    it('should convert object to string using object’s custom toString() method', function () {
      class TestClass {
        toString () {
          return 'string value'
        }
      }
      const object = new TestClass()
      assert.strictEqual(toString(object), 'string value')
    })

    it('should return the provided fallback if input is unconvertible', function () {
      assert.strictEqual(toString({}, {fallback: 'test'}), 'test')
    })

    it('should convert String object fallback to primitive string', function () {
      assert.strictEqual(typeof toString({}, {fallback: new String('test')}), 'string') // eslint-disable-line no-new-wrappers
    })

    it('should throw error if input is unconvertible and fallback is not string', function () {
      assert.throws(() => { toString({}, {fallback: null}) }, TypeError)
    })
  })

  it('should result in object surviving multiple chained conversions', function () {
    let data = {a: 1, b: 2}
    data = toMap(data)
    data = toArray(data)
    data = toObject(data)
    data = toIterator(data)
    data = toArray(data)
    data = toMap(data)
    data = toObject(data)
    assert.strictEqual(Object.keys(data).length, 2)
    assert.strictEqual(data.a, 1)
    assert.strictEqual(data.b, 2)
  })

  it('should result in array surviving multiple chained conversions', function () {
    let data = ['first', 'second']
    data = toMap(data)
    data = toArray(data, {detectIndexKeys: true})
    data = toObject(data)
    data = toIterator(data)
    data = toArray(data, {detectIndexKeys: true})
    data = toMap(data)
    data = toObject(data)
    data = toArray(data, {detectIndexKeys: true})
    assert.strictEqual(JSON.stringify(data), JSON.stringify(['first', 'second']))
  })
})
