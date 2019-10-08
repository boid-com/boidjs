var rpc
var queries
const utils = require('./utils')

function init (extRPC) {
  rpc = extRPC
  queries = require('./queries')
  queries.init(rpc)
}

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
  }
  return bonus
}

async function wallet (account) {
  try {
    var wallet = {}
    wallet.balance = (await queries.getAccount({ account })).balance
    wallet.stakes = (await queries.getStakes({ account }))

    const selfStake = wallet.stakes.find(el => el.from === account)
    wallet.selfStake = parseFloat(selfStake.quantity)
    wallet.selfTransStake = parseFloat(selfStake.trans_quantity)
    wallet.allSelfStake = wallet.selfStake + wallet.selfTransStake

    const externalStakes = wallet.stakes.filter(el => el.from !== account)
    wallet.externalStake = externalStakes.reduce((acc, el) => acc + parseFloat(el.quantity), 0)
    wallet.externalTransStake = externalStakes.reduce((acc, el) => acc + parseFloat(el.trans_quantity), 0)
    wallet.totalStake = wallet.selfStake + wallet.externalStake
    wallet.totalTransStake = wallet.selfTransStake + wallet.externalTransStake
    wallet.allStaked = wallet.totalStake + wallet.totalTransStake

    wallet.delegations = (await queries.getDelegations({ account })).filter(el => el.to !== account)
    wallet.totalDelegating = wallet.delegations.reduce((acc, el) => acc + parseFloat(el.quantity), 0)
    wallet.totalTransDelegating = wallet.delegations.reduce((acc, el) => acc + parseFloat(el.trans_quantity), 0)
    wallet.allDelegating = wallet.totalDelegating + wallet.totalTransDelegating

    wallet.liquidBalance = wallet.balance - wallet.allSelfStake - wallet.allDelegating

    return wallet
  } catch (error) {
    console.error(error)
  }
}

module.exports = { init, pendingClaim, wallet, queries }
