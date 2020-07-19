# Chunks Array

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

[npm-image]: https://img.shields.io/npm/v/chunk-array.svg?style=flat
[npm-url]: https://npmjs.org/package/chunk-array
[travis-image]: https://img.shields.io/travis/haio/chunk-array.svg?style=flat
[travis-url]: https://travis-ci.org/haio/chunk-array
[coveralls-image]: https://img.shields.io/coveralls/haio/chunk-array.svg?style=flat
[coveralls-url]: https://coveralls.io/r/haio/chunk-array?branch=master

A tiny module that turn your array into chunks of n-size.

## Usage

```sh
npm install chunk-array --save
```

### chunks(arr, n)

Turn array into chunks of size n, if n is a falsy value then return original array

```js
var chunks = require('chunk-array').chunks
var arr = [1,2,3,4,5,6]
var results = chunks(arr, 3) //[[1,2,3], [4,5,6]]
```

### pairs(arr)

A convenient method that turn array into pairs, which equals `chunks(arr, 2)`

```js
var pairs = require('chunk-array').pairs
var arr = [1,2,3,4,5,6]
var results = pairs(arr) //[[1,2], [3,4], [5,6]]
```

### LICENSE

MIT
