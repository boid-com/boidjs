function maketx (
  {
    account,
    name,
    authorization,
    data
  }
) {
  return {
    actions: [{
      account: account,
      name: name,
      authorization: authorization,
      data: data
    }]
  }
}
const tapos =
{
  blocksBehind: 3,
  expireSeconds: 30
}

function claim (auth, data) {
  if (!data) data = 0
  return maketx({
    account: 'boidcomtoken',
    name: 'claim',
    authorization: [{ actor: auth.accountName, permission: auth.permission }],
    data: { stake_account: auth.accountName, percentage_to_stake: data, issuer_claim: false }
  })
}

module.exports = { maketx, claim, tapos }
