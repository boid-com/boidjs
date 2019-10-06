function init ({rpc,api}) {
  const get = require('./get')
  // const execute = require('./execute')
  get.init(rpc)
  // execute.init(rpc,api,get)
  return { get }
}

module.exports = init
