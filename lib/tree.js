'use strict';

var ROOT_KEY = '//'

var Tree = function() {
  this.data = {}
}

Tree.prototype.set = function(mod, dependencies) {
  if (!mod) {
    mod = ROOT_KEY
  }

  this.data[mod] = dependencies
}

Tree.prototype.get = function(mod, dependency) {
  if (!mod) {
    mod = ROOT_KEY
  }

  if (dependency) {
    var cur = this.data[mod]
    return cur ? cur[dependency] : undefined
  }

  return this.data[mod]
}

Tree.prototype.all = function() {
  return this.data
}

module.exports = Tree
