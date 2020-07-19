
exports.chunks = function (arr, n) {

  if (!arr || !n) return arr

  var length = arr.length
  var slicePoint = 0
  var ret = []

  while (slicePoint < length) {
    ret.push(arr.slice(slicePoint, slicePoint+n))
    slicePoint += n
  }
  return ret
}

exports.pairs = function (arr) {
  return exports.chunks(arr, 2)
}
