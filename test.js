const { JsonRpc } = require('eosjs')
const fetch = require('node-fetch')
var rpc = new JsonRpc('https://api.eosnewyork.io', { fetch })
//var rpc = new JsonRpc('https://api-kylin.eosasia.one', { fetch })
const boidjs = require('./src/index')({ rpc })
const queries = require('./src/queries');
const utils = require('./src/utils');
// boidjs.get.pendingClaim('animus.link').then(console.log).catch(console.log)
//boidjs.get.wallet('11mrmarian11').then(console.log).catch(console.log);

(async function() {
  await boidjs.get.pendingClaim('animus.link');
  //await boidjs.get.pendingClaim('1133testtest'); // kylin

  const config = await queries.getStakeConfig()
  const t = await queries.getTime() * 1e6
  let simStakeBonus =  utils.simulateStakeBonus({
    config : config,
    power : 5000,
    quantity : 1000000,
    t : t,
    dt : 18505000000
  });

  let simPowerBonus = utils.simulatePowerBonus({
    config : config,
    power : 5000,
    t : t,
    dt : 18505000000
  })
})();

// console.log(boidjs.tx.selfStake({accountName:"johnatboid"},0).actions[0].data)
