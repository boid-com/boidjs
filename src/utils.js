const BigNumber = require('bignumber.js')
BigNumber.config({ POW_PRECISION: 100 })

const random = (min, max) => Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min)
const randomSelect = (arr) => arr[random(0, arr.length - 1)]
const sleep = ms => new Promise(res => setTimeout(res, ms))
const parseBN = (bignum) => parseFloat(bignum.toFixed(4))

function chunk (arr, len) {
  var chunks = []
  var i = 0
  var n = arr.length
  while (i < n) { chunks.push(arr.slice(i, i += len)) }
  return chunks
}

const TIME_MULT = BigNumber(1)// BigNumber(86400)
const DAY_MICROSEC = BigNumber(86400e6)
const PRECISION_COEF = BigNumber(1e4)

function num2boid (n) {
  return n.toFixed(4) + ' BOID'
}

function boid2num (s) {
  return BigNumber(parseFloat(s.split(' ')))
}

function getCurrentBoidpower ({
  config,
  power,
  dt
}) {
  const bpPrev = BigNumber(parseFloat(power.quantity))
  const bpNew = BigNumber(0)
  const dtReal = BigNumber(dt).multipliedBy(TIME_MULT)
  let quantity =
    bpPrev.multipliedBy((BigNumber(1.0).minus(
      BigNumber(parseFloat(config.boidpower_decay_rate))))
      .exponentiatedBy(dtReal))
      .minus(
        dtReal
          .dividedBy(DAY_MICROSEC)
          .multipliedBy(TIME_MULT)
          .multipliedBy(
            BigNumber(parseFloat(config.boidpower_const_decay))
          )
      )
  console.log(quantity.toString())

  quantity = BigNumber.maximum(quantity, 0)
    .plus(
      bpNew.multipliedBy(
        BigNumber(config.boidpower_update_mult))
    )
  console.log(quantity.toString())

  return quantity
}

function getPoweredStake ({
  config,
  power
}) {
  return BigNumber.minimum(
    BigNumber(
      parseFloat(config.powered_stake_multiplier))
      .multipliedBy(BigNumber(power)),
    BigNumber(
      parseFloat(config.max_powered_stake_ratio))
      .multipliedBy(
        BigNumber(parseFloat(config.total_staked))
      )
  )
}

function parseStake (stake) {
  return {
    quantity: boid2num(stake.quantity),
    prev_claim_time: BigNumber(parseFloat(stake.prev_claim_time._count)),
    expiration: BigNumber(parseFloat(stake.expiration._count)),
    trans_quantity: boid2num(stake.trans_quantity),
    trans_prev_claim_time: BigNumber(parseFloat(stake.trans_prev_claim_time._count)),
    trans_expiration: BigNumber(parseFloat(stake.trans_expiration._count))
  }
}

function getStakeBonus ({
  startTime,
  claimTime,
  quantity,
  poweredStake,
  stakeDifficulty
}) {
  const amount = BigNumber.minimum(
    quantity, poweredStake
  )

  const wpfAmount = BigNumber.maximum(
    BigNumber(quantity).minus(poweredStake),
    0
  )

  const stakeCoef =
    BigNumber(claimTime).minus(startTime)
      .multipliedBy(
        TIME_MULT
          .dividedBy(stakeDifficulty)
          .dividedBy(PRECISION_COEF)
      )

  return {
    stake: amount.multipliedBy(stakeCoef),
    power: BigNumber(0),
    wpf: wpfAmount.multipliedBy(stakeCoef)
  }
}

function claimForStake ({
  quantity,
  poweredStake,
  prevClaimTime,
  currTime,
  expiration,
  stakeDifficulty
}) {
  let claimTime, startTime

  if (prevClaimTime.isEqualTo(0)) {
    startTime = currTime
  } else {
    startTime = prevClaimTime
  }

  if (expiration.isEqualTo(0)) {
    claimTime = currTime
  } else if (expiration.isLessThan(currTime)) {
    claimTime = expiration
  } else {
    claimTime = currTime
  }

  return getStakeBonus({
    startTime: startTime,
    claimTime: claimTime,
    quantity: quantity,
    poweredStake: poweredStake,
    stakeDifficulty: stakeDifficulty
  })
}

function getPowerBonus ({
  power,
  powerDifficulty,
  powerBonusMaxRate,
  startTime,
  claimTime
}) {
  const powerCoef = BigNumber.minimum(
    BigNumber(power).dividedBy(powerDifficulty),
    powerBonusMaxRate
  )

  const quantity = BigNumber(powerCoef)
    .multipliedBy(
      BigNumber(claimTime).minus(startTime))
    .multipliedBy(TIME_MULT)
    .dividedBy(PRECISION_COEF)

  return {
    stake: BigNumber(0),
    power: quantity,
    wpf: BigNumber(0)
  }
}

function getBonus ({
  config,
  power,
  stakes,
  t
}) {
  const dtPow = BigNumber(t)
    .minus(BigNumber(parseFloat(power.prev_bp_update_time._count)))
  var currPower = getCurrentBoidpower({
    config: config,
    power: power,
    dt: dtPow
  })
  console.log('power: ',
    currPower.toFixed(5).toString()
  )

  var poweredStake = getPoweredStake({
    config: config,
    power: currPower
  })

  const totalPayout = {
    stake: BigNumber(0),
    power: BigNumber(0),
    wpf: BigNumber(0)
  }

  let currPayout = {
    stake: BigNumber(0),
    power: BigNumber(0),
    wpf: BigNumber(0)
  }
  for (let i = 0; i < stakes.length; i++) {
    var currStake = parseStake(stakes[i])
    if (currStake.quantity > 0) {
      currPayout = claimForStake({
        quantity: currStake.quantity,
        poweredStake: poweredStake,
        prevClaimTime: currStake.prev_claim_time,
        currTime: t,
        expiration: currStake.expiration,
        stakeDifficulty: BigNumber(parseFloat(config.stake_difficulty))
      })
      console.log('stake payout: ',
        currPayout.stake.toFixed(4).toString()
      )

      totalPayout.stake = totalPayout.stake.plus(currPayout.stake)
      totalPayout.wpf = totalPayout.wpf.plus(currPayout.wpf)
      poweredStake = BigNumber.maximum(
        BigNumber(poweredStake).minus(currStake.quantity),
        0
      )
    }

    if (currStake.trans_quantity > 0) {
      currPayout = claimForStake({
        quantity: currStake.trans_quantity,
        poweredStake: poweredStake,
        prevClaimTime: currStake.trans_prev_claim_time,
        currTime: t,
        expiration: currStake.trans_expiration
      })
      console.log('trans stake payout: ',
        currPayout.stake.toFixed(4).toString()
      )
      console.log('trans stake wpf payout: ',
        currPayout.wpf.toFixed(4).toString()
      )

      totalPayout.stake = totalPayout.stake.plus(currPayout.stake)
      totalPayout.wpf = totalPayout.wpf.plus(currPayout.wpf)
      poweredStake = BigNumber.maximum(
        BigNumber(poweredStake)
          .minus(currStake.trans_quantity),
        0
      )
    }

    totalPayout.wpf = BigNumber.minimum(
      totalPayout.wpf,
      boid2num(config.max_wpf_payout)
    )
  }

  currPayout = getPowerBonus({
    power: currPower,
    powerDifficulty: BigNumber(parseFloat(config.power_difficulty)),
    powerBonusMaxRate: BigNumber(parseFloat(config.power_bonus_max_rate)),
    startTime: BigNumber(parseFloat(power.prev_claim_time._count)),
    claimTime: t
  })
  console.log('power payout: ',
    currPayout.power.toFixed(4).toString()
  )

  totalPayout.power = totalPayout.power.plus(currPayout.power)
  return totalPayout
}

function simStakeBonus ({
  config,
  power,
  quantity,
  ms
}) {
  var currPower = BigNumber(power)
  var ms = BigNumber(ms)

  var poweredStake = getPoweredStake({
    config: config,
    power: currPower
  })
  console.log('max powered stake: ',
    parseFloat(poweredStake.toFixed(4)).toLocaleString()
  )

  let totalPayout = {
    stake: BigNumber(0),
    power: BigNumber(0),
    wpf: BigNumber(0)
  }

  if (quantity > 0) {
    totalPayout = claimForStake({
      quantity: quantity,
      poweredStake: poweredStake,
      prevClaimTime: BigNumber(1),
      currTime: ms.times(1e3),
      expiration: ms.times(1e9),
      stakeDifficulty: BigNumber(parseFloat(config.stake_difficulty))
    })
  }
  totalPayout.poweredStake = poweredStake
  return totalPayout
}

function simPowerBonus ({
  config,
  power,
  ms
}) {
  var currPower = BigNumber(power)
  ms = BigNumber(ms)
  const totalPayout = getPowerBonus({
    power: currPower,
    powerDifficulty: BigNumber(parseFloat(config.power_difficulty)),
    powerBonusMaxRate: BigNumber(parseFloat(config.power_bonus_max_rate)),
    startTime: 0,
    claimTime: ms * 1e3
  })
  return totalPayout
}

function simPendingClaim ({ wallet, config, ms }) {
  const stake = simStakeBonus()
}

async function getRows ({ code, scope, table, rpc, keyName, lower_bound, prevResults }) {
  var res
  if (!lower_bound) lower_bound = null
  try {
    res = await rpc.get_table_rows({
      json: true,
      code,
      scope,
      table,
      lower_bound,
      limit: 99999999
    })
    // return res.rows
    // console.log(res.rows.length)
    // console.log(res.rows[res.rows.length - 1][keyName])
    if (!res.more || res.more === '') {
      if (prevResults) {
        prevResults.push(...res.rows)
        return prevResults
      } else return res.rows
    }
    else {
      if (!prevResults) prevResults = []
      res.rows.shift()
      prevResults.push(...res.rows)
      return getRows({code,scope,table,rpc,lower_bound:res.rows[res.rows.length - 1][keyName],prevResults,keyName})
    }
  } catch (error) {
    console.error(error.message)
    await sleep(1000)
    console.error('Running query again...')
    var data = { code, scope, table, rpc}
    if (keyName) data.keyname = keyName
    if (lower_bound) data.lower_bound = lower_bound
    if (prevResults) data.prevResults = prevResults
    return getRows(data)
    // throw (error)
  }
}

async function getTable ({ code, table, group, rpc, chunkSize, emitter }) {
  if (!chunkSize) chunkSize = 3
  let res = { more: true, rows: [{ scope: 0 }] }
  try {
    const fullList = []
    while (res.more !== '' && res.more !== false) {
      if (res.rows[0]) {
        var lowerBound = res.rows[res.rows.length - 1].scope
        console.log(lowerBound)
      } else {
        console.log(res)
        console.log(lowerBound)
      }
      res = await rpc.get_table_by_scope({ json: true, code, table, limit: 999999999, lower_bound: lowerBound })
      console.log(res.more, res.rows.length)
      res.rows.shift()
      const chunks = chunk(res.rows, chunkSize)
      const handleRows = async function (account, i) {
        try {
          await sleep(i * 2)
          var results = []
          const rows = await getRows({ code, scope: account.scope, table, rpc })
          if (!rows) return handleRows(account)
          if (!group) {
            for (const row of rows) {
              results.push(row)
              if (emitter) emitter.emit('data', row)
            }
          } else {
            results.push(rows)
            if (emitter) emitter.emit('data', rows)
          }
          return results
        } catch (error) {
          console.error(error)
          return results
        }
      }
      for (const iChunk of chunks) {
        const results = (await Promise.all(iChunk.map((account, i) => handleRows(account, i)))).flat()
        if (emitter) emitter.emit('chunk', results)
        results.forEach(el => fullList.push(el))
      }
    }
    if (emitter) emitter.emit('finished', true)
    return fullList
  } catch (error) {
    // console.error(res)
    console.error(error)
    return undefined
  }
}

module.exports = {
  num2boid,
  boid2num,
  getCurrentBoidpower,
  getPoweredStake,
  getBonus,
  simStakeBonus,
  random,
  randomSelect,
  getTable,
  getRows,
  sleep,
  simPowerBonus,
  parseBN
}
