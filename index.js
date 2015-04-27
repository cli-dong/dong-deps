'use strict';

var fs = require('fs')
var path = require('path')

var extend = require('extend')
var getPkg = require('package')

var Tree = require('./lib/tree')

// http://www.zhihu.com/question/27100221/answer/35264735
function elegantlyGet(obj, props) {
  if (typeof props === 'string') {
    props = props.split('/')
  }

  if (props.length === 0) {
    return obj
  }

  var prop = props.shift()

  if (prop && obj.hasOwnProperty(prop)) {
    return elegantlyGet(obj[prop], props)
  }

  return undefined
}

module.exports = function getTree(options) {

  var tree = new Tree()

  function getDep(mod, dependencies, options) {
    var map = {}

    if (dependencies) {
      Object.keys(dependencies).forEach(function(key) {
        var value = dependencies[key].replace(/[^\.\d]/g, '');
        var dir = path.join(process.cwd(), options.spmRoot, key, value)

        if (fs.existsSync(dir)) {
          var pkg = getPkg(path.join(options.spmRoot, key, value))

          if (pkg) {
            var main = elegantlyGet(pkg, options.scope.replace(/(\/|^)[^\/]+?$/, '/main')) || 'index.js'

            map[key] = [options.prefix, options.spmRoot, key, value, main.replace(/^\.\//, '')].join('/')

            // sub tree
            getDep(key, elegantlyGet(pkg, options.scope), options)
          }
        }
      })
    }

    tree.set(mod, map)
  }

  options = extend({
    prefix: '',
    spmRoot: 'spm_modules',
    scope: 'spm/dependencies'
  }, options)

  var pkg = getPkg('.')

  if (pkg) {
    getDep('', elegantlyGet(pkg, options.scope), options)
  }

  return tree
}
