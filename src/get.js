var rpc = global.boidjs.rpc
const utils = require('./utils')
const sleep = async () => utils.sleep(utils.random(50,500))
var contract = 'boidcomtoken'
var EventEmitter = require('events')
const parseBN = (bignum) => parseFloat(bignum.toFixed(4)) 

async function pendingClaim (wallet, config) {
  if (!wallet) throw('must include user wallet for pendingClaim')
  if (!config) config = await stakeConfig()
  var pending = {stake:0,power:0,wpf:{stake:0,power:0,total:0}}
  const ms = Date.now() - wallet.lastClaimTime
  const power = wallet.totalPower
  if (wallet.totalPower > 0) {
    pending.power = parseBN(utils.simPowerBonus({config,power,ms}).power)
    console.log('PENDING POWER PAYOUT:',pending.power)
  }
  if (wallet.allStaked > 0) {
    const result = (utils.simStakeBonus({config,power,quantity:wallet.allStaked,ms}))
    pending.stake = parseBN(result.stake)
    pending.wpf.stake = parseBN(result.wpf)
    console.log('PENDING STAKE PAYOUT',pending)
  }
  pending.wpf.total = pending.wpf.stake + pending.wpf.power

  return pending
}

async function wallet (account) {
  var wallet = {
    account,
    powerStats: {},
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
    liquidBalance: 0,
    totalPower:0,
    lastClaimTime:0
  }

  try {
    [wallet.balance, wallet.stakes, wallet.powerStats, wallet.delegations ] = await Promise.all(
      [balance(account), stakes(account), powerStats(account), delegations(account)] )
    wallet.delegations = wallet.delegations.filter(el => el.to !== account)

    const externalStakes = wallet.stakes.filter(el => el.from !== account)

    if (wallet.powerStats) {
      wallet.lastClaimTime = parseFloat(wallet.powerStats.prev_claim_time._count) / 1000
      wallet.totalPower = parseFloat(wallet.powerStats.quantity)
    }
    const selfStake = wallet.stakes.find(el => el.from === account)
    if (selfStake) {
      wallet.selfStake = parseFloat(selfStake.quantity)
      wallet.selfTransStake = parseFloat(selfStake.trans_quantity)
      wallet.allSelfStake = wallet.selfStake + wallet.selfTransStake
    }

    wallet.externalStake = externalStakes.reduce((acc, el) => acc + parseFloat(el.quantity), 0)
    wallet.externalTransStake = externalStakes.reduce((acc, el) => acc + parseFloat(el.trans_quantity), 0)
    wallet.totalStake = wallet.selfStake + wallet.externalStake
    wallet.totalTransStake = wallet.selfTransStake + wallet.externalTransStake
    wallet.allStaked = wallet.totalStake + wallet.totalTransStake

    wallet.delegations = (await delegations(account)).filter(el => el.to !== account)
    wallet.totalDelegating = wallet.delegations.reduce((acc, el) => acc + parseFloat(el.quantity), 0)
    wallet.totalTransDelegating = wallet.delegations.reduce((acc, el) => acc + parseFloat(el.trans_quantity), 0)
    wallet.allDelegating = wallet.totalDelegating + wallet.totalTransDelegating

    if (wallet.balance) wallet.liquidBalance = wallet.balance - wallet.allSelfStake - wallet.allDelegating
    else wallet.liquidBalance = 0

    return wallet
  } catch (error) {
    console.error(error.message)
    return wallet
  }
}

async function time () {
  try {
    return Date.now()
  } catch (error) {
    return undefined
  }
}

async function stats () {
  try {
    const res = await rpc.get_table_rows({
      json: true,
      code: contract,
      scope: 'BOID',
      table: 'stat',
      lower_bound: 'BOID',
      limit: 1,
      reverse: false,
      show_payer: false
    })
    return res.rows[0]
  } catch (error) {
    console.error(error)
    await sleep(1000)
    return stats()
  }
}

async function stakeConfig () {
  try {
    const res = await rpc.get_table_rows({
      json: true,
      code: contract,
      scope: contract,
      table: 'stakeconfigs',
      lower_bound: 0,
      limit: 1,
      reverse: false,
      show_payer: false
    })
    return res.rows[0]
  } catch (error) {
    console.error(error)
    await sleep(1000)
    return stakeConfig()
  }
}

async function balance (account) {
  try {
    const res = await rpc.get_table_rows({
      json: true,
      code: contract,
      scope: account,
      table: 'accounts',
      lower_bound: 'BOID',
      limit: 1,
      reverse: false,
      show_payer: false
    })
    if (!res.rows[0]) return null
    return parseFloat(res.rows[0].balance)
  } catch (error) {
    console.log(error)
    await sleep(1000)
    return balance(account)
  }
}

async function stake (to, from) {
  try {
    const res = await rpc.get_table_rows({
      json: true,
      code: contract,
      scope: to,
      lower_bound: from,
      table: 'staked',
      limit: 1
    })
    return res.rows[0]
  } catch (error) {
    console.log(error)
    await sleep(1000)
    return stake(to, from)
  }
}

async function stakes (account) {
  try {
    const res = await rpc.get_table_rows({
      json: true,
      code: contract,
      scope: account,
      table: 'staked',
      limit: 10000
    }).catch(err => {throw(err)})
    return res.rows
  } catch (error) {
    console.log('THROWN STAKES')
    console.error(error)
    await sleep(1000)
    return stakes(account)
  }
}

function setupTableParser (table, { group, async, chunkSize }) {
  var emitter
  if (async) emitter = new EventEmitter()
  const result = utils.getTable({ code: contract, table, group, rpc, chunkSize, emitter })
  if (async) return emitter
  else return result
}

function allAccounts (data) {
  console.log('Retreiving all accounts...')
  return setupTableParser('accounts', data)
}

function allStakes (data) {
  console.log('Retreiving all stakes...')
  return setupTableParser('staked', data)
}

function allDelegations (data) {
  console.log('Retreiving all delegations...')
  return setupTableParser('delegation', data)
}

function allPowerStats (data) {
  console.log('Retreiving all powerStats...')
  return setupTableParser('powers', data)
}

async function powerStats (account) {
  try {
    const res = await rpc.get_table_rows({
      json: true,
      code: contract,
      scope: account,
      table: 'powers',
      limit: 1
    })
    return res.rows[0]
  } catch (error) {
    console.error(error)
    await sleep(1000)
    return powerStats(account)
  }
}

async function delegation (from, to) {
  try {
    const res = await rpc.get_table_rows({
      json: true,
      code: contract,
      scope: from,
      lower_bound: to,
      table: 'delegation',
      limit: 1
    })
    return res.rows[0]
  } catch (error) {
    console.error(error)
    await sleep(1000)
    return delegation(account)
  }
}

async function delegations (account) {
  try {
    const res = await rpc.get_table_rows({
      json: true,
      code: contract,
      scope: account,
      table: 'delegation',
      limit: 10000
    })
    return res.rows
  } catch (error) {
    console.error(error)
    await sleep(1000)
    return delegations(account)
  }
}

async function currencyStats () {
  try {
    const res = await rpc.get_table_rows({
      json: true,
      code: contract,
      scope: 'BOID',
      table: 'stat',
      lower_bound: 'BOID',
      limit: 1,
      reverse: false,
      show_payer: false
    })
    return res.rows[0]
  } catch (error) {
    console.error(error)
    await sleep(1000)
    return currencyStats(account)
  }
}

module.exports = {
  time,
  stats,
  stakeConfig,
  balance,
  stake,
  powerStats,
  delegation,
  delegations,
  allDelegations,
  allAccounts,
  stakes,
  allStakes,
  currencyStats,
  wallet,
  pendingClaim,
  allPowerStats
}
