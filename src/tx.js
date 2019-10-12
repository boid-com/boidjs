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
      authorization:[{ actor: auth.accountName, permission: auth.permission }],
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
  if (!data) data = 0
  return maketx({
    account, name: 'claim', auth,
    data: { stake_account: auth.accountName, percentage_to_stake: data, issuer_claim: false }
  })
}

function selfStake (auth, data) {
  return maketx({
        account, name: 'stake', auth, 
      data:{
        from: auth.accountName,
        to: auth.accountName,
        quantity: data.toFixed(4) + " BOID",
        time_limit:0,
        use_staked_balance:false
      }
  })
}

module.exports = { maketx, claim, tapos, selfStake }
