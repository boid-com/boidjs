
const util = require('./utils')
function initEOSJs (eosjs, keys, endpoint) {
  const { Api, JsonRpc } = eosjs || require('eosjs')
  const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig')
  const signatureProvider = new JsSignatureProvider(keys)
  const fetch = require('node-fetch')
  const { TextEncoder, TextDecoder } = require('util')
  var api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() })
  var rpc = new JsonRpc(endpoint, { fetch })
  return { api, rpc }
}

var defaultEndpoints = [
  'https://api.eosnewyork.io',
  'https://eos.greymass.com:443',
  'https://api.eossweden.org',
  'https://api.eosn.io',
  'https://api.cypherglass.com'
]

async function transferTokens (to, amount, from, memo, tokenacct, tokenName) {
  // if (process.env.USER === 'boid') return console.log({to,from,amount,memo,tokenacct,tokenName})
  try {
    const result = await api.transact({
      actions: [{
        account: tokenacct,
        name: 'transfer',
        authorization: [{
          actor: from,
          permission: 'active'
        }],
        data: {
          from,
          to,
          quantity: amount + ' ' + tokenName,
          memo
        }
      }]
    }, {
      blocksBehind: 6,
      expireSeconds: 10
    })
    // console.log(result)
    return result.transaction_id
  } catch (e) {
    console.error('Caught exception: ' + e.message)
    // if (e.json) console.log(JSON.stringify(e.json, null, 2))
  }
}
async function getSelfStake (to) {
  try {
    let res = await rpc.get_table_rows({
      json: true,
      code: 'boidcomtoken',
      scope: to,
      lower_bound: to,
      table: 'staked',
      limit: 1
    })
    return res.rows[0]
  } catch (error) {
    console.error(error)
    return undefined
  }
}

function init (endpoints, keys, externalEOSJs) {
  if (!keys) keys = []
  var endpoint = util.randomSelect(endpoints || defaultEndpoints)
  const { api, rpc } = initEOSJs(externalEOSJs, keys, endpoint)
  console.log('BoidJs Endpoint:', endpoint)
  return { rpc, api }
}

module.exports = init

// init().getStake('johnatboid11')
