
var assert = require('assert')
var chunks = require('./').chunks
var pairs = require('./').pairs

describe('Chunk Array', function () {

  describe('#chunks', function () {
    it('should turn array into thunks of n size', function () {
      var arr = [1,2,3,4,5,6]
      var len1chunks = [[1],[2],[3],[4],[5],[6]]
      var len2chunks = [[1,2],[3,4],[5,6]]
      var len3chunks = [[1,2,3], [4,5,6]]
      var len4chunks = [[1,2,3,4], [5,6]]
      var len5chunks = [[1,2,3,4,5],[6]]
      var len6chunks = [[1,2,3,4,5,6]]
      var len7chunks = [[1,2,3,4,5,6]]

      assert.deepEqual(chunks(arr, 0), arr)
      assert.deepEqual(chunks(arr, 1), len1chunks)
      assert.deepEqual(chunks(arr, 2), len2chunks)
      assert.deepEqual(chunks(arr, 3), len3chunks)
      assert.deepEqual(chunks(arr, 4), len4chunks)
      assert.deepEqual(chunks(arr, 5), len5chunks)
      assert.deepEqual(chunks(arr, 6), len6chunks)
      assert.deepEqual(chunks(arr, 7), len7chunks)
    })
  })

  describe('#pairs', function () {
    it('should turn array into pairs', function () {
      var arr = [1,2,3,4,5,6,7]
      var ps = [[1,2],[3,4],[5,6],[7]]

      assert.deepEqual(pairs(arr), ps)
    })
  })
})
