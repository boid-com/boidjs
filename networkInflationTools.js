const { JsonRpc,Api } = require('eosjs')
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig')
const { TextDecoder, TextEncoder } = require('util')
const keys = []
const signatureProvider = new JsSignatureProvider(keys)
const fetch = require('node-fetch')
var rpc = new JsonRpc('https://eos.api.boid.com', { fetch }) //var rpc = new JsonRpc('http://localhost:3051', { fetch })
const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() })
var time = new require('human-interval')

//var rpc = new JsonRpc('https://eos.greymass.com', { fetch })

// var rpc = new JsonRpc('https://api-kylin.eosasia.one', { fetch })
const boidjs = require('./src/index')({ rpc })
// const utils = require('utils')
// boidjs.get.pendingClaim('aimanouladal').then(console.log).catch(console.log)


async function init() {

  const result = await rpc.get_currency_stats('boidcomtoken','BOID')
  console.log(result)
  return

  conf = await boidjs.get.stakeConfig()
  console.log(conf)
  // return
  const config = { 
    config_id: 0,
    stakebreak: 1,
    bonus: '0.0000 BOID',
    season_start: { _count: '1569185628000000' },
    total_season_bonus: '0.0000 BOID',
    active_accounts: 501,
    total_staked: '918397476.9939 BOID',
    last_total_powered_stake: '0 ',
    total_boidpower: '0.00000000000000000',
    stake_difficulty: '4499999744.00000000000000000',
    powered_stake_multiplier: '450.00000000000000000',
    power_difficulty: '199000000.00000000000000000',
    power_bonus_max_rate: '0.00100000004749745',
    min_stake: '100000.0000 BOID',
    max_powered_stake_ratio: '0.01499999966472387',
    max_wpf_payout: '10000000.0000 BOID',
    worker_proposal_fund: '0.0000 BOID',
    worker_proposal_fund_proxy: 'boidworkfund',
    boidpower_decay_rate: '0.00000000000060000',
    boidpower_update_mult: '1.00000000000000000',
    boidpower_const_decay: '10.00000000000000000' 
  }
  const powerStats = await boidjs.get.wallet('johnatboid11')
  console.log(powerStats)




  // { 
  // stake_difficulty: '10000000000.00000000000000000',
  // powered_stake_multiplier: '200.00000000000000000',
  // power_difficulty: '999990528.00000000000000000',
  // power_bonus_max_rate: '0.00150000001303852',
  // max_powered_stake_ratio: '0.01999999955296516',

  // const powerStats = await boidjs.get.wallet('johnatboid11')
  // console.log(powerStats)

  // const pendingClaim = await boidjs.get.pendingClaim('johnatboid11')
  // console.log(pendingClaim)

  // const wallet = await boidjs.get.wallet('johnatboid11')

  // const pendingClaim = await boidjs.get.pendingClaim(wallet)
  // console.log(pendingClaim)
  // return
  

  const power = 200000
  const stake = 11000000
  const ms = time('1 year')
  const tierPercent = 0.02
  const teamPercent = 0.03
  
  const pending = await boidjs.get.pendingClaim(
    { lastClaimTime: Date.now() - ms,
      totalPower:power,
      allStaked:stake
    },config)

  const stakePower = pending.power + pending.stake

  const stakeBonus = parseInt(((pending.stake / pending.power)*100).toFixed(0))
  const tierBonus = tierPercent * stakePower 
  const teamBonus = teamPercent * stakePower

  console.log('')
  console.log('stake profits vs power:',stakeBonus + '%')
  console.log(pending)
  console.log('Stake ROI',(((pending.stake)/stake*100).toFixed(2) + "%").toLocaleString())
  console.log('Team/Tier Bonus:', parseInt(tierBonus + teamBonus).toLocaleString())
  console.log('Total payout:', parseInt((pending.stake + pending.power + tierBonus + teamBonus).toFixed(0)).toLocaleString())
  console.log('')

}
 init()
// Date.now() - 1571664699000
// console.log(boidjs.tx.selfStake({accountName:"johnatboid"},0).actions[0].data)
// setGlobals({boidpower_decay_rate: '0.0000000000006', boidpower_const_decay:10}).then(console.log).catch(console.log)

// registerValidator('tjkgaming123')

// fixStaked('kingparallax')

async function fixStaked(accountName) {
  const authorization = [{actor:"boidcomtoken", permission:"active"}]
  const account = 'boidcomtoken'
  const actions = [
    {authorization,account, name:'syncselfdel',data: {account:accountName}},
  ]
  const result = await api.transact({actions},boidjs.tx.tapos).catch(el => console.error(el))
  if (result) console.log(result)
}


async function registerValidator(validator) {
  const authorization = [{actor:"boidcompower", permission:"active"}]
  const account = 'boidcompower'
  const actions = [
    {authorization,account:"boidcomtoken", name:'transfer',data: {from:"boidcompower", to:validator,quantity:"1.0000 BOID",memo:"Welcome to Boid Validators."}},
    {authorization,account, name:'regvalidator',data: {validator}},
    {authorization,account, name:'addvalprot',data: {validator, protocol_type:0,weight:100}},
    {authorization,account, name:'addvalprot',data: {validator, protocol_type:1,weight:100}}
  ]
  const result = await api.transact({actions},boidjs.tx.tapos).catch(el => console.error(el))
  if (result) console.log(result)
}

async function setGlobals(config){
  const tx = boidjs.tx
  var actions = []
  const auth = {accountName:"boidcomtoken", permission:"active"}
  const account = 'boidcomtoken'

  if (config.stake_difficulty) {
    const data = {stake_difficulty:config.stake_difficulty}
    const name = "setstakediff"
    actions.push(tx.maketx({account,name,auth,data}).actions[0])
  }

  if (config.powered_stake_multiplier) {
    const data = {powered_stake_multiplier:config.powered_stake_multiplier}
    const name = "setpwrstkmul"
    actions.push(tx.maketx({account,name,auth,data}).actions[0])
  }

  if (config.power_difficulty) {
    const data = {power_difficulty:config.power_difficulty}
    const name = "setpowerdiff"
    actions.push(tx.maketx({account,name,auth,data}).actions[0])
  }

  if (config.power_bonus_max_rate) {
    const data = {power_bonus_max_rate:config.power_bonus_max_rate}
    const name = "setpowerrate"
    actions.push(tx.maketx({account,name,auth,data}).actions[0])
  }

  if (config.max_powered_stake_ratio) {
    const data = {percentage:config.max_powered_stake_ratio * 100}
    const name = "setmaxpwrstk"
    actions.push(tx.maketx({account,name,auth,data}).actions[0])
  }

  if (config.boidpower_update_mult) {
    const data = {update_exp:config.boidpower_update_mult}
    const name = "setbpmult"
    actions.push(tx.maketx({account,name,auth,data}).actions[0])
  }

  if (config.boidpower_decay_rate) {
    const data = {decay:config.boidpower_decay_rate}
    const name = "setbpdecay"
    actions.push(tx.maketx({account,name,auth,data}).actions[0])
  }

  if (config.boidpower_const_decay) {
    const data = {const_decay:config.boidpower_const_decay}
    const name = "setbpconst"
    actions.push(tx.maketx({account,name,auth,data}).actions[0])
  }

  console.log(JSON.stringify(actions,null,2))
  const result = await api.transact({actions},tx.tapos).catch(el => console.error(el.toString()))
  
  if (result) console.log(result)

}