
const queries = global.boidjs.queries
module.exports = async function wallet (account) {
  var wallet = {
    balance: 0,
    stakes: [],
    selfStake: 0,
    selfTransStake: 0,
    allSelfStake: 0,
    externalStake: 0,
    externalTransStake: 0,
    totalStake: 0,
    totalTransStake: 0,
    allStaked: 0,
    delegations: [],
    totalDelegating: 0,
    totalTransDelegating: 0,
    allDelegating: 0,
    liquidBalance: 0
  }

  try {
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
    console.error(error.message)
    return wallet
  }
}
