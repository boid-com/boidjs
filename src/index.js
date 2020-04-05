function init ({ rpc, api,config }) {
  global.boidjs = {}
  global.boidjs.rpc = rpc
  global.boidjs.api = api
  
  const defaultConfig = {
    tokenContract:'boidcomtoken',
    powerContract:'boidcompower'
  }
  
  if (config) {
    global.boidjs.config = config
  }else global.boidjs.config = {}

  Object.assign(global.boidjs.config,defaultConfig)

  const get = () => require('./get.js')
  const tx = () => require('./tx.js')
  return { get:get(), tx:tx() }
}

module.exports = init
