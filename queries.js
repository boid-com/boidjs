var api
var rpc
var contract
function init (extRPC, extAPI, extTokenContract) {
  api = extAPI
  rpc = extRPC
  contract = extTokenContract || 'boidcomtoken'
}
async function get_accounts () {
  try {
    let accts = []
    let res = await rpc.get_table_by_scope({
      json: true,
      code: contract,
      table: 'accounts',
      limit: 10000000
    })
    accts = accts.concat(res.rows)
    while (res.more != '' && res.more != false) {
      res = await rpc.get_table_by_scope({
        json: true,
        code: contract,
        table: 'accounts',
        limit: 10000000,
        lower_bound: res.rows[res.rows.length - 1].scope + 1
      })
      accts = accts.concat(res.rows)
    }
    let acctInfo = []
    for (let i = 0; i < accts.length; i++) {
      let x = await get_account({
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

async function get_time () {
  try {
    let res = await rpc.get_info()
    return ((new Date(res.head_block_time)).getTime()) / 1000
  } catch (error) {
    return undefined
  }
}

async function get_stats ({ contract }) {
  try {
    let res = await rpc.get_table_rows({
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

async function get_stake_config () {
  try {
    let res = await rpc.get_table_rows({
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

async function get_account ({ account }) {
  try {
    let res = await rpc.get_table_rows({
      json: true,
      code: contract,
      scope: account,
      table: 'accounts',
      lower_bound: 'BOID',
      limit: 1,
      reverse: false,
      show_payer: false
    })
    let balance = parseFloat(res.rows[0].balance.split(' ')).toFixed(4)
    let balanceStr = balance.toString() + ' BOID'
    return {
      account: account,
      balance: parseFloat(balance),
      balanceStr: balanceStr
    }
  } catch (error) {
    return undefined
  }
}



async function get_stake ({ contract, from, to }) {
  try {
    let res = await rpc.get_table_rows({
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

async function get_stakes ({ account }) {
  try {
    let res = await rpc.get_table_rows({
      json: true,
      code: contract,
      scope: account,
      table: 'staked',
      limit: 10000
    })
    return res.rows
  } catch (error) {
    return undefined
  }
}

async function get_stakes_all ({ contract }) {
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
    while (res.more != '' && res.more != false) {
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
    let acctInfo = []
    for (let i = 0; i < accts.length; i++) {
      let x = await get_stakes({
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

async function get_stakes_by_delegate ({ contract }) {
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
    while (res.more != '' && res.more != false) {
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
    let acctInfo = []
    for (let i = 0; i < accts.length; i++) {
      let x = await get_stakes({
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

async function get_power ({ account }) {
  try {
    let res = await rpc.get_table_rows({
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

async function get_delegation ({ contract, from, to }) {
  try {
    let res = await rpc.get_table_rows({
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

async function get_delegations ({ contract, account }) {
  try {
    let res = await rpc.get_table_rows({
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

async function get_delegations_all ({ contract }) {
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
    while (res.more != '' && res.more != false) {
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
    let acctInfo = []
    for (let i = 0; i < accts.length; i++) {
      let x = await get_delegations({
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

async function get_currency_stats ({ contract }) {
  try {
    let res = await rpc.get_table_rows({
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

async function do_action (
  account,
  name,
  authorization,
  data
) {
  const result = await api.transact({
    actions: [{
      account: account,
      name: name,
      authorization: authorization,
      data: data
    }]
  }, {
    blocksBehind: 3,
    expireSeconds: 30
  })
  return result
}

async function get_abi ({ contract }) {
  const res = await rpc.get_abi(contract)
  return res
}

module.exports = {
  init,
  do_action,
  get_time,
  get_stats,
  get_stake_config,
  get_account,
  get_stake,
  get_power,
  get_delegation,
  get_delegations,
  get_delegations_all,
  get_accounts,
  get_stakes,
  get_stakes_all,
  get_stakes_by_delegate,
  get_currency_stats,
  get_abi
}
