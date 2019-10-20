var rpc = global.boidjs.rpc
const utils = require('./utils')
var contract = 'boidcomtoken'
var events = require('events')

async function pendingClaim (account, wallet) {
  var power
  var acctStakes
  if (wallet) {
    power = wallet.powerStats
    acctStakes = wallet.stakes
  } else {
    power = await powerStats(account)
    acctStakes = await stakes(account)
  }
  const config = await stakeConfig()
  const t = await time() * 1e6
  let bonus

  if (power) {
    bonus = utils.getBonus({
      config,
      stakes: acctStakes,
      power,
      t
    })
  } else {
    console.log('must first have a power row entry')
    return { stake: 0, power: 0, wpf: 0 }
  }
  bonus.stake = parseFloat(bonus.stake.toFixed(4))
  bonus.power = parseFloat(bonus.power.toFixed(4))
  bonus.wpf = parseFloat(bonus.wpf.toFixed(4))

  return bonus
}

async function wallet (account) {
  var wallet = {
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
    liquidBalance: 0
  }

  try {
    wallet.balance = (await balance(account))
    wallet.stakes = (await stakes(account))
    wallet.powerStats = await powerStats(account)
    if (wallet.powerStats) {
      wallet.powerStats.lastClaimTime = parseFloat(wallet.powerStats.prev_claim_time._count) / 10000
    }
    const selfStake = wallet.stakes.find(el => el.from === account)
    if (selfStake) {
      wallet.selfStake = parseFloat(selfStake.quantity)
      wallet.selfTransStake = parseFloat(selfStake.trans_quantity)
      wallet.allSelfStake = wallet.selfStake + wallet.selfTransStake
    }

    const externalStakes = wallet.stakes.filter(el => el.from !== account)
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
    const res = await rpc.get_info()
    return ((new Date(res.head_block_time)).getTime()) / 1000
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
    return undefined
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
    return undefined
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
    return undefined
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
    return undefined
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
    })
    return res.rows
  } catch (error) {
    console.error(error)
    throw (error)
  }
}

async function allAccounts () {
  
}

function setupTableParser(table,{group,async}) {
  if (async) var emitter = new events.EventEmitter()
  else var emitter = null
  const result = utils.getTable({ code:contract, table , group, rpc, emitter })
  if (async) return emitter
  else return result
}

function allAccounts({group,async}) {
  console.log('Retreiving all accounts...')
  return setupTableParser('accounts',{group,async})
}

function allStakes({group,async}) {
  console.log('Retreiving all stakes...')
  return setupTableParser('staked',{group,async})
}

function allStakes({group,async}) {
  console.log('Retreiving all stakes...')
  return setupTableParser('staked',{group,async})
}

function allDelegations({group,async}) {
  console.log('Retreiving all delegations...')
  return setupTableParser('delegation',{group,async})
}

function allPowerStats({group,async}) {
  console.log('Retreiving all powerStats...')
  return setupTableParser('powers',{group,async})
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
    return undefined
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
    return undefined
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
    return undefined
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
    return undefined
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
  allPowerStats,
}
