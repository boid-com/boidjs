
const random = (min, max) => Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min)
const randomSelect = (arr) => arr[random(0, arr.length - 1)]

const TIME_MULT = 1// 86400;
const DAY_MICROSEC = 86400e6
const PRECISION_COEF = 1e4

function num2boid (n) {
  return n.toFixed(4) + ' BOID'
}

function boid2num (s) {
  return parseFloat(s.split(' '))
}

function getCurrentBoidpower ({
  config,
  power,
  dt
}) {
  // return parseFloat(power.quantity);
  const dtReal = dt * TIME_MULT
  const quantity =
    parseFloat(power.quantity) *
    Math.pow(1.0 - parseFloat(config.boidpower_decay_rate),
      dtReal) -
    dtReal / DAY_MICROSEC * TIME_MULT *
    parseFloat(config.boidpower_const_decay)

  return Math.max(quantity, 0) +
    Math.pow(0,
      parseFloat(1 - config.boidpower_update_exp))
}

function getPoweredStake ({
  config,
  power
}) {
  return Math.min(
    parseFloat(config.powered_stake_multiplier) *
    power,
    parseFloat(config.max_powered_stake_ratio) *
    parseFloat(config.total_staked)
  )
}

function parseStake (stake) {
  return {
    quantity: boid2num(stake.quantity),
    prev_claim_time: parseFloat(stake.prev_claim_time._count),
    expiration: parseFloat(stake.expiration._count),
    trans_quantity: boid2num(stake.trans_quantity),
    trans_prev_claim_time: parseFloat(stake.trans_prev_claim_time._count),
    trans_expiration: parseFloat(stake.trans_expiration._count)
  }
}

function getStakeBonus ({
  startTime,
  claimTime,
  quantity,
  poweredStake,
  stakeDifficulty
}) {
  const amount = Math.min(
    quantity, poweredStake
  )

  const wpfAmount = Math.max(
    quantity - poweredStake, 0
  )

  const stakeCoef = (claimTime - startTime) *
    TIME_MULT / stakeDifficulty / PRECISION_COEF

  return {
    stake: amount * stakeCoef,
    power: 0,
    wpf: wpfAmount * stakeCoef
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

  if (prevClaimTime === 0) {
    startTime = currTime
  } else {
    startTime = prevClaimTime
  }

  if (expiration === 0) {
    claimTime = currTime
  } else if (expiration < currTime) {
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
  const powerCoef = Math.min(
    power / powerDifficulty,
    powerBonusMaxRate
  )

  return {
    stake: 0,
    power: powerCoef * (claimTime - startTime) * TIME_MULT / PRECISION_COEF,
    wpf: 0
  }
}

function getBonus ({
  config,
  power,
  stakes,
  t
}) {
  const dtPow = t - parseFloat(power.prev_bp_update_time._count)
  var currPower = getCurrentBoidpower({
    config: config,
    power: power,
    dt: dtPow
  })
  console.log('power: ', currPower)

  var poweredStake = getPoweredStake({
    config: config,
    power: currPower
  })
  console.log('powered stake: ', poweredStake)

  const totalPayout = { stake: 0, power: 0, wpf: 0 }

  let currPayout = { stake: 0, power: 0, wpf: 0 }
  for (let i = 0; i < stakes.length; i++) {
    var currStake = parseStake(stakes[i])
    if (currStake.quantity > 0) {
      currPayout = claimForStake({
        quantity: currStake.quantity,
        poweredStake: poweredStake,
        prevClaimTime: currStake.prev_claim_time,
        currTime: t,
        expiration: currStake.expiration,
        stakeDifficulty: parseFloat(config.stake_difficulty)
      })
      console.log('stake payout: ', currPayout)

      totalPayout.stake += currPayout.stake
      totalPayout.wpf += currPayout.wpf
      poweredStake = Math.max(
        poweredStake - currStake.quantity,
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
      console.log('trans stake payout: ', currPayout)

      totalPayout.stake += currPayout.stake
      totalPayout.wpf += currPayout.wpf
      poweredStake = Math.max(
        poweredStake - currStake.trans_quantity,
        0
      )
    }

    totalPayout.wpf = Math.min(
      totalPayout.wpf,
      boid2num(config.max_wpf_payout)
    )
  }

  currPayout = getPowerBonus({
    power: currPower,
    powerDifficulty: parseFloat(config.power_difficulty),
    powerBonusMaxRate: parseFloat(config.power_bonus_max_rate),
    startTime: parseFloat(power.prev_claim_time._count),
    claimTime: t
  })
  console.log('power payout: ', currPayout)

  totalPayout.power += currPayout.power
  return totalPayout
}

module.exports = {
  num2boid,
  boid2num,
  getCurrentBoidpower,
  getPoweredStake,
  getBonus,
  random,
  randomSelect
}
