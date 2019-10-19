var rpc = global.boidjs.rpc
var contract = 'boidcomtoken'
// var contract = '1155testtest' // kylin
async function getAccounts () {
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
      const x = await getAccount({
        contract: contract,
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

async function getTime () {
  try {
    const res = await rpc.get_info()
    return ((new Date(res.head_block_time)).getTime()) / 1000
  } catch (error) {
    return undefined
  }
}

async function getStats () {
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

async function getStakeConfig () {
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

async function getAccount ({ account }) {
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
    const balance = parseFloat(res.rows[0].balance.split(' ')).toFixed(4)
    const balanceStr = balance.toString() + ' BOID'
    return {
      account: account,
      balance: parseFloat(balance),
      balanceStr: balanceStr
    }
  } catch (error) {
    return undefined
  }
}

async function getStake ({ from, to }) {
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

async function getStakes ({ account }) {
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

async function getStakesAll () {
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
      const x = await getStakes({
        contract: contract,
        account: accts[i].scope
      })
      for (let j = 0; j < x.length; j++) {
        acctInfo.push(x[j])
      }
    }
    return acctInfo
  } catch (error) {
    return undefined
  }
}

async function getStakesByDelegate () {
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
      const x = await getStakes({
        contract: contract,
        account: accts[i].scope
      })
      acctInfo.push(x)
    }
    return acctInfo
  } catch (error) {
    return undefined
  }
}

async function getPower ({ account }) {
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

async function getDelegation ({ from, to }) {
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

async function getDelegations ({ account }) {
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

async function getDelegationsAll () {
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
      const x = await getDelegations({
        contract: contract,
        account: accts[i].scope
      })
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

async function getCurrencyStats () {
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
  getTime,
  getStats,
  getStakeConfig,
  getAccount,
  getStake,
  getPower,
  getDelegation,
  getDelegations,
  getDelegationsAll,
  getAccounts,
  getStakes,
  getStakesAll,
  getStakesByDelegate,
  getCurrencyStats
}
