const { JsonRpc } = require('eosjs')
const fetch = require('node-fetch')
var rpc = new JsonRpc('http://localhost:3053', { fetch })
// var rpc = new JsonRpc('https://eos.greymass.com', { fetch })

const boidjs = require('./src/index')({ rpc })

// rpc.get_currency_balance('boidcomtoken','johnatboid11','BOID').then(console.log).catch(console.log)
// boidjs.get.wallet('rob.vr').then(console.log).catch(console.log)
boidjs.get.allStakes().then(el => {
  console.log(el.length)
  // const allUsers = []
  // el.forEach(el => allUsers.push(el.to))
  // const powerStats = boidjs.get.allPowerStats()
})
// boidjs.get.allStakesAsync(1).then(el => {
//   var totalList = []
//   el.on('list', (el) => {
//     el.forEach(el => totalList.push(el))
//     console.log(totalList.length)
//   })
// })
// boidjs.get.wallet('11mrmarian11').then(console.log).catch(console.log)
// boidjs.get.queries.powerStats('11mrmarian11').then(console.log).catch(console.log)
// boidjs.get.allStakes().then(console.log).catch(console.log)
// console.log(boidjs.get.pendingClaim)

// console.log(boidjs.tx.selfStake({accountName:"johnatboid"},0).actions[0].data)