var rpc = global.boidjs.rpc
const utils = require('./utils')
var contract = 'boidcomtoken'

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

    wallet.liquidBalance = wallet.balance - wallet.allSelfStake - wallet.allDelegating

    return wallet
  } catch (error) {
    console.error(error.message)
    return wallet
  }
}

async function allAccounts () {
  try {
    let accts = []
    let res = await rpc.get_table_by_scope({
      json: true,
      code: contract,
      table: 'accounts',
      limit: 10000000
    })
    accts = accts.concat(res.rows)
    while (res.more !== '' && res.more !== false) {
      res = await rpc.get_table_by_scope({
        json: true,
        code: contract,
        table: 'accounts',
        limit: 10000000,
        lower_bound: res.rows[res.rows.length - 1].scope + 1
      })
      accts = accts.concat(res.rows)
    }
    const acctInfo = []
    for (let i = 0; i < accts.length; i++) {
      const x = await balance({
        account: accts[i].scope
      })
      acctInfo.push(x)
    }
    return acctInfo
  } catch (error) {
    console.error(error)
    return undefined
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
    console.log(res)
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

async function allStakes () {
  try {
    let accts = []
    let res = await rpc.get_table_by_scope({
      json: true,
      code: contract,
      table: 'staked',
      limit: 10000000,
      // limit: 1,
      lower_bound: 0
    })
    accts = accts.concat(res.rows)
    while (res.more !== '' && res.more !== false) {
      res = await rpc.get_table_by_scope({
        json: true,
        code: contract,
        table: 'staked',
        limit: 10000000,
        // limit: 1,
        lower_bound: res.rows[res.rows.length - 1].scope + 1
      })
      accts = accts.concat(res.rows)
    }
    const acctInfo = []
    for (let i = 0; i < accts.length; i++) {
      const x = await stakes(accts[i].scope)
      for (let j = 0; j < x.length; j++) {
        acctInfo.push(x[j])
      }
    }
    return acctInfo
  } catch (error) {
    return undefined
  }
}

async function stakesByDelegate () {
  try {
    let accts = []
    let res = await rpc.get_table_by_scope({
      json: true,
      code: contract,
      table: 'staked',
      limit: 10000000,
      // limit: 1,
      lower_bound: 0
    })
    accts = accts.concat(res.rows)
    while (res.more !== '' && res.more !== false) {
      res = await rpc.get_table_by_scope({
        json: true,
        code: contract,
        table: 'staked',
        limit: 10000000,
        // limit: 1,
        lower_bound: res.rows[res.rows.length - 1].scope + 1
      })
      accts = accts.concat(res.rows)
    }
    const acctInfo = []
    for (let i = 0; i < accts.length; i++) {
      const x = await stakes(accts[i].scope)
      acctInfo.push(x)
    }
    return acctInfo
  } catch (error) {
    return undefined
  }
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

async function allDelegations () {
  try {
    let accts = []
    let res = await rpc.get_table_by_scope({
      json: true,
      code: contract,
      table: 'delegation',
      // limit: 10000000
      limit: 1,
      lower_bound: 0
    })
    accts = accts.concat(res.rows)
    while (res.more !== '' && res.more !== false) {
      res = await rpc.get_table_by_scope({
        json: true,
        code: contract,
        table: 'delegation',
        // limit: 10000000,
        limit: 1,
        lower_bound: res.rows[res.rows.length - 1].scope + 1
      })
      accts = accts.concat(res.rows)
    }
    const acctInfo = []
    for (let i = 0; i < accts.length; i++) {
      const x = await delegations(accts[i].scope)
      for (let j = 0; j < x.length; j++) {
        acctInfo.push(x[j])
      }
    }
    console.log(acctInfo)
    return acctInfo
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
  stakesByDelegate,
  currencyStats,
  wallet,
  pendingClaim
}
