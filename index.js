function init (endpoints, keys, externalEOSJs) {
  const { api, rpc } = require('./eosjs')(endpoints, keys, externalEOSJs)
  const get = require('./get')
  // const execute = require('./execute')
  get.init(rpc)
  // execute.init(rpc,api,get)
  return { get }
}

module.exports = init
