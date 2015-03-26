'use strict';

var fs = require('fs')
var path = require('path')

var extend = require('extend')

var relativeToCwd = path.relative(__dirname, process.cwd()).replace(/\\/g, '/') || './'

function _require(arr) {
  if (typeof arr === 'string') {
    arr = [arr]
  }

  arr.unshift(relativeToCwd)

  return require(arr.join('/'))
}

// http://www.zhihu.com/question/27100221/answer/35264735
function getElegantly(obj, props) {
  if (typeof props === 'string') {
    props = props.split('/')
  }

  if (props.length === 0) {
    return obj
  }

  var prop = props.shift()

  if (prop && obj.hasOwnProperty(prop)) {
    return getElegantly(obj[prop], props)
  }

  return undefined
}

module.exports = function getTree(options) {

  var tree = new require('./lib/tree')()

  function getDep(mod, dependencies, options) {
    var map = {}

    if (dependencies) {
      Object.keys(dependencies).forEach(function(key) {
        var value = dependencies[key];
        var dir = path.join(process.cwd(), options.spmRoot, key, value)

        if (fs.existsSync(dir)) {
          var pkg = _require([options.spmRoot, key, value, 'package.json'])

          if (pkg) {
            var main = getElegantly(pkg, options.scope.replace(/(\/|^)[^\/]+?$/, '/main')) || 'index.js'

            map[key] = [options.idleading, options.spmRoot, key, value, main.replace(/^\.\//, '')].join('/')

            // sub tree
            getDep(key, getElegantly(pkg, options.scope), options)
          }
        }
      })
    }

    tree.set(mod, map)
  }

  options = extend({
    idleading: '',
    spmRoot: 'spm_modules',
    scope: 'spm/dependencies'
  }, options)

  if (options.idleading) {
    options.idleading = '/' + options.idleading
  }

  var pkg = _require('package.json')

  if (pkg) {
    getDep('', getElegantly(pkg, options.scope), options)
  }

  return tree
}
