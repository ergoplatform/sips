// sigmabankv2.es
{
      // diff from V1:
      //  * no cooling off period


      // this box
      // R4: Long : Number of stable-coins in circulation
      // R5: Long : Number of reserve-coins in circulation
      // R6: Int  : Last oracle update height (to have limits per cycle)
      // R7: (Long, Long) : Remaining limit for SigUsd and SigRSV minting per oracle update

      val feePercent = 2 // in percent, so 2% fee

      // Base-64 version of ERG/USD oracle pool NFT 011d3364de07e5a26f0c4eef0852cddb387039a921b7154ef3cab22c6eda887f
      // UI at https://explorer.ergoplatform.com/en/oracle-pool-state/ergusd
      // Got via http://tomeko.net/online_tools/hex_to_base64.php
      val oraclePoolNFT = fromBase64("AR0zZN4H5aJvDE7vCFLN2zhwOakhtxVO88qyLG7aiH8=")

      // Base-64 version of bank update NFT 239c170b7e82f94e6b05416f14b8a2a57e0bfff0e3c93f4abbcd160b6a5b271a
      // Got via http://tomeko.net/online_tools/hex_to_base64.php
      val updateNFT = fromBase64("I5wXC36C+U5rBUFvFLiipX4L//DjyT9Ku80WC2pbJxo=")

      val minStorageRent = 10000000L
      val minReserveRatioPercent = 400L // percent
      val maxReserveRatioPercent = 800L // percentdataInput
      val LongMax = 9223372036854775807L
      val rcDefaultPrice = 1000000L

      val isExchange = if (CONTEXT.dataInputs.size > 0) {  // oracle input exists

        val dataInput = CONTEXT.dataInputs(0)
        val validDataInput = dataInput.tokens(0)._1 == oraclePoolNFT

        val bankBoxIn = SELF
        val bankBoxOut = OUTPUTS(0)

        val rateBox = dataInput
        val receiptBox = OUTPUTS(1)

        val rate = rateBox.R4[Long].get / 100 // calculate nanoERG per US cent
        val oracleUpdateHeight = rateBox.R5[Int].get

        val scCircIn = bankBoxIn.R4[Long].get
        val rcCircIn = bankBoxIn.R5[Long].get
        val bcReserveIn = bankBoxIn.value

        val scTokensIn = bankBoxIn.tokens(0)._2
        val rcTokensIn = bankBoxIn.tokens(1)._2

        val scCircOut = bankBoxOut.R4[Long].get
        val rcCircOut = bankBoxOut.R5[Long].get
        val bcReserveOut = bankBoxOut.value

        val scTokensOut = bankBoxOut.tokens(0)._2
        val rcTokensOut = bankBoxOut.tokens(1)._2

        val totalScIn = scTokensIn + scCircIn
        val totalScOut = scTokensOut + scCircOut

        val totalRcIn = rcTokensIn + rcCircIn
        val totalRcOut = rcTokensOut + rcCircOut

        val rcExchange = rcTokensIn != rcTokensOut
        val scExchange = scTokensIn != scTokensOut

        // allowed to exchange stablecoins or reservecoins but not both
        val rcExchangeXorScExchange = (rcExchange || scExchange) && !(rcExchange && scExchange)

        val circDelta = receiptBox.R4[Long].get
        val bcReserveDelta = receiptBox.R5[Long].get

        val rcCircDelta = if (rcExchange) circDelta else 0L
        val scCircDelta = if (rcExchange) 0L else circDelta

        // v2 code below
        val limitFactor = 200 // 1 / 200, so 0.5% per oracle update
        val limitsReg = bankBoxIn.R7[(Long, Long)].get
        val limits = if (bankBoxIn.R6[Int].get != oracleUpdateHeight) {
          val limit = bankBoxIn.value / limitFactor
          (limit, limit)
        } else {
          limitsReg
        }

        val updLimits = if (scExchange && scCircDelta > 0) { // SC mint
          (limits._1 - bcReserveDelta, limits._2)
        } else if (rcExchange && rcCircDelta > 0) { // RC mint
          (limits._1, limits._2 - bcReserveDelta)
        } else {
          (limits._1, limits._2)
        }

        val properLimit = (updLimits._1 >= 0 && updLimits._2 >= 0) && (bankBoxOut.R7[(Long, Long)].get == updLimits)

        val validDeltas = (scCircIn + scCircDelta == scCircOut) &&
                           (rcCircIn + rcCircDelta == rcCircOut) &&
                           (bcReserveIn + bcReserveDelta == bcReserveOut) &&
                           scCircOut >= 0 && rcCircOut >= 0 &&
                           properLimit

        val coinsConserved = totalRcIn == totalRcOut && totalScIn == totalScOut

        val tokenIdsConserved = bankBoxOut.tokens(0)._1 == bankBoxIn.tokens(0)._1 && // also ensures that at least one token exists
                                bankBoxOut.tokens(1)._1 == bankBoxIn.tokens(1)._1 && // also ensures that at least one token exists
                                bankBoxOut.tokens(2)._1 == bankBoxIn.tokens(2)._1    // also ensures that at least one token exists

        val mandatoryRateConditions = rateBox.tokens(0)._1 == oraclePoolNFT
        val mandatoryBankConditions = bankBoxOut.value >= minStorageRent &&
                                      bankBoxOut.R6[Int].get == oracleUpdateHeight &&
                                      bankBoxOut.propositionBytes == bankBoxIn.propositionBytes &&
                                      rcExchangeXorScExchange &&
                                      coinsConserved &&
                                      validDeltas &&
                                      tokenIdsConserved

        // exchange equations
        val bcReserveNeededOut = scCircOut * rate
        val bcReserveNeededIn = scCircIn * rate
        val liabilitiesIn = max(min(bcReserveIn, bcReserveNeededIn), 0)

        val reserveRatioPercentOut = if (bcReserveNeededOut == 0) maxReserveRatioPercent else bcReserveOut * 100 / bcReserveNeededOut

        val validReserveRatio = if (scExchange) {
          if (scCircDelta > 0) {
            reserveRatioPercentOut >= minReserveRatioPercent
          } else true
        } else {
          if (rcCircDelta > 0) {
            reserveRatioPercentOut <= maxReserveRatioPercent
          } else {
            reserveRatioPercentOut >= minReserveRatioPercent
          }
        }

        val brDeltaExpected = if (scExchange) { // sc
          val liableRate = if (scCircIn == 0) LongMax else liabilitiesIn / scCircIn
          val scNominalPrice = min(rate, liableRate)
          scNominalPrice * scCircDelta
        } else { // rc
          val equityIn = bcReserveIn - liabilitiesIn
          val equityRate = if (rcCircIn == 0) rcDefaultPrice else equityIn / rcCircIn
          val rcNominalPrice = if (equityIn == 0) rcDefaultPrice else equityRate
          rcNominalPrice * rcCircDelta
        }

        val fee = brDeltaExpected * feePercent / 100
        val actualFee = if (fee < 0) {-fee} else fee

        // actualFee is always positive, irrespective of brDeltaExpected
        val brDeltaExpectedWithFee = brDeltaExpected + actualFee

        mandatoryRateConditions &&
         mandatoryBankConditions &&
         bcReserveDelta == brDeltaExpectedWithFee &&
         validReserveRatio &&
         validDataInput
      } else false

      val isUpdate = INPUTS(0).tokens(0)._1 == updateNFT

      sigmaProp(isExchange || isUpdate)
}