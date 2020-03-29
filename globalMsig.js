async function setGlobalsMsig(config){
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

  // console.log(JSON.stringify(actions,null,2))
  const serialized = await api.serializeActions(actions)
  // console.log(serialized)
  const msigData = {
    proposer:'johnatboid11',
    proposal_name:'infparamup11',
    requested:[
      {
        actor:'johnatboid11',
        permission:'boiddac'
      },
      {
        actor:'animusvalid3',
        permission:'boiddac'
      },
      {
        actor:'boid1metrics',
        permission:'boiddac'
      },
      {
        actor:'onlyforgames',
        permission:'boiddac'
      },
      {
        actor:'perchitsboid',
        permission:'boiddac'
      },
      {
        actor:'stakingwhale',
        permission:'boiddac'
      },
      {
        actor:'usavalidator',
        permission:'boiddac'
      }
    ],
    trx:{
      expiration: '2020-01-21T00:00:00',
      ref_block_num: 0,
      ref_block_prefix: 0,
      max_net_usage_words: 0,
      max_cpu_usage_ms: 0,
      delay_sec: 0,
      context_free_actions: [],
      actions: serialized,
      transaction_extensions: []
    }
  }

  const proposeAction = {
    actions: [{
      account: 'eosio.msig',
      name: 'propose',
      authorization: [{
        actor: 'johnatboid11',
        permission: 'boiddac',
      }],
      data: msigData,
    }]
  }
  const result = await api.transact(proposeAction,tx.tapos).catch(el => console.error(el.toString()))
  
  if (result) console.log(result.transaction_id)
}

setGlobalsMsig().catch(console.log)