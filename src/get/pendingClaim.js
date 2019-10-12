const utils = require('../utils')
const queries = global.boidjs.queries

async function pendingClaim (account) {
  const config = await queries.getStakeConfig()
  const power = await queries.getPower({ account })
  const stakes = await queries.getStakes({ account })
  const t = await queries.getTime() * 1e6
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
    return { stake: 0, power: 0, wpf: 0 }
  }
  return bonus
}

module.exports = pendingClaim
