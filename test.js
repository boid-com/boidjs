const { JsonRpc } = require('eosjs')
const fetch = require('node-fetch')
var rpc = new JsonRpc('https://api.eosnewyork.io', { fetch })
const boidjs = require('./src/index')({ rpc })
// boidjs.get.pendingClaim('animus.link').then(console.log).catch(console.log)
// boidjs.get.wallet('poweroracle').then(console.log).catch(console.log)

// console.log(boidjs.get.pendingClaim)

console.log(boidjs.tx.selfStake({accountName:"johnatboid"},0).actions[0].data)