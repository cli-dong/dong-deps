'use strict';

var fs = require('fs')
var path = require('path')

var extend = require('extend')
var getPkg = require('package')

var Tree = require('./lib/tree')

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

  var tree = new Tree()

  function getDep(mod, dependencies, options) {
    var map = {}

    if (dependencies) {
      Object.keys(dependencies).forEach(function(key) {
        var value = dependencies[key];
        var dir = path.join(process.cwd(), options.spmRoot, key, value)

        if (fs.existsSync(dir)) {
          var pkg = getPkg(path.join(options.spmRoot, key, value))

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

  var pkg = getPkg('.')

  if (pkg) {
    getDep('', getElegantly(pkg, options.scope), options)
  }

  return tree
}
