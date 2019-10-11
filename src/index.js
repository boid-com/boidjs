function init ({ rpc, api }) {
  global.boidjs = {}
  global.boidjs.rpc = rpc
  global.boidjs.api = api
  global.boidjs.queries = require('./queries')
  const get = require('./get')
  const tx = require('./tx')
  return { get, tx }
}

module.exports = init
