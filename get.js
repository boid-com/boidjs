var rpc
var queries
var boidtoken_c = 'boidcomtoken'
const utils = require('./utils')

function init (extRPC) {
  rpc = extRPC
  queries = require('./queries')
  queries.init(rpc)
}

async function pendingClaim (account) {
  let config = await queries.get_stake_config()
  let power = await queries.get_power({ account })
  let stakes = await queries.get_stakes({ account })

  let t = await queries.get_time() * 1e6

  let bonus

  if (power) {
    bonus = utils.getBonus({
      config: config,
      stakes: stakes,
      power: power,
      t
    })
  } else {
    console.log('must first have a power row entry')
  }
}

module.exports = { init, pendingClaim }
