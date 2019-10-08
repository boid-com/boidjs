function init ({ rpc, api }) {
  const get = require('./get')
  const tx = require('./tx')
  // const execute = require('./execute')
  get.init(rpc)
  // execute.init(rpc,api,get)
  return { get, tx }
}

module.exports = init
