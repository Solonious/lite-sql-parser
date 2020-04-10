const Parser = require('./lib/parser').default
const util = require('./lib/util')

module.exports = {
  Parser,
  util,
}

if (globalThis && globalThis.window) {
  globalThis.window.NodeSQLParser = {
    Parser,
    util,
  }
}
