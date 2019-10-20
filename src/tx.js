var account = 'boidcomtoken'
function maketx (
  {
    account,
    name,
    auth,
    data
  }
) {
  return {
    actions: [{
      account,
      name,
      authorization: [{ actor: auth.accountName, permission: auth.permission }],
      data
    }]
  }
}
const tapos =
{
  blocksBehind: 6,
  expireSeconds: 60
}

function claim (auth, data) {
  const defaultData = { stake_account: auth.accountName, percentage_to_stake: 0, issuer_claim: false }
  if (data) data = Object.assign(defaultData, data)
  else data = defaultData
  return maketx({ account, name: 'claim', auth, data })
}

function selfStake (auth, data) {
  return maketx({
    account,
    name: 'stake',
    auth,
    data: {
      from: auth.accountName,
      to: auth.accountName,
      quantity: data.toFixed(4) + ' BOID',
      time_limit: 0,
      use_staked_balance: false
    }
  })
}

function selfUnstake (auth, data) {
  return maketx({
    account,
    name: 'unstake',
    auth,
    data: {
      from: auth.accountName,
      to: auth.accountName,
      time_limit: 0,
      to_staked_balance: false,
      issuer_unstake: false,
      transfer: false,
      quantity: data.toFixed(4) + ' BOID',
      use_staked_balance: false
    }
  })
}

module.exports = { maketx, claim, tapos, selfStake, selfUnstake }
