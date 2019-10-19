function init ({ rpc, api }) {
  global.boidjs = {}
  global.boidjs.rpc = rpc
  global.boidjs.api = api
  const get = require('./get')
  const tx = require('./tx')
  return { get, tx }
}

module.exports = init
