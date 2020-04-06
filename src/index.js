function init ({ rpc, api, config }) {
  const defaultConfig = {
    tokenContract:'boidcomtoken',
    powerContract:'boidcompower'
  }
  if (!config) config = defaultConfig
  Object.assign(defaultConfig,config)

  const get = ((data) => require('./get.js')(data))({rpc,api,config})
  const tx = () => require('./tx.js')
  return { get, tx:tx() }
}

module.exports = init
