function init ({ rpc, api }) {
  global.boidjs = {}
  global.boidjs.rpc = rpc
  global.boidjs.api = api
  const get = require('./get.js')
  const tx = require('./tx.js')
  return { get, tx }
}

module.exports = init
