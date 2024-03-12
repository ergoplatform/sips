# SigmaUSD Improvement Proposals (SIPs)

SigmaUSD Improvement Proposals (SIPs) specify and/or describe standards for SigmaUSD. 

Please check out [EIP-0015: SigmaUSD Contracts Standard](https://github.com/ergoplatform/eips/blob/master/eip-0015.md), to understand the general expectation of how EIPs are supposed to be formatted.


| Number | Title |
| ---  | ---  |
| [EIP-0015](https://github.com/ergoplatform/eips/blob/master/eip-0015.md) | SigmaUSD Contracts Standard |


## Discussion

### Shortcomings

- **Reserve Draining Attack:** See the [Bearwhale Saga](https://ergoplatform.org/en/blog/2021-05-13-bearwhale-saga/) & [Ideas for improvement of the Djed Protocol - Dr. Bruno W Paleo | Ergo Summit 2022](https://www.youtube.com/watch?v=yTgapwydOW0)
- **Wholesale Discount**: Buying in one transaction is cheaper than the same amount with multiple tx, because the price changes in between
- **Zero Equity**: At 100% reserve ratio, SigRSV is worthless.
- **Capital Inefficiency:** The incentives for SigRSV holders are too small - at least in persistant downtrend. 

**Potential SIPs**

- [**Dynamic fees**](https://github.com/ergoplatform/sips/issues/2) (many versions).
- [**Simultaneous Minting**](https://github.com/ergoplatform/sips/issues/1)
- **Non-matching lock** %. E.g. mint usd until 500%, cant sell rsv at 400%.
- **Circuit Breakers** (max amount of mint per block)

**Contributing**

- Please contribute directly to this repository in the Issues tab, or join the [SigmaUSD Telegram](https://t.me/SigmaUSD), [#sigmausd on Discord](https://discord.gg/GkpppkfHAV), or respond on the [forum](https://www.ergoforum.org/t/lessons-for-sigmausd-from-the-djed-paper/2345)



### Lessons from Djed 

- [Djed: A Formally Verified Crypto-Backed Pegged Algorithmic Stablecoin](https://iohk.io/en/research/library/papers/djeda-formally-verified-crypto-backed-pegged-algorithmic-stablecoin/)
- [Lessons for sigmausd from the DJED paper](https://www.ergoforum.org/t/lessons-for-sigmausd-from-the-djed-paper/2345)

**Improvements based on extended-Djed**

- When stablecoin is close to losing peg, e.g. 150%, then ERG is moved from liabilities (stablecoin holders) to equity (reservecoin holders). Effectively losing the peg starts at 150% in this case. This solves the zero equity problem.
- When stablecoin starts to lose its peg, then the stablecoin holders are compensated by printing them reservecoin (debt for equity swap). This solves the stablecoin loss of peg at <100% problem.
- Dynamic fees for buying and selling reservecoin and stablecoin. E.g. when reserve ratio is below 600%, then minting fee of stablecoin and redeeming fee of reservecoin go linearly up to 100%. This solves the rigid fees and bank runs problems.

### Governance 

> While SigmaUSD v1 was originally immutable, after the Bearwhale attacks a governance token was added to allow modifications for any vulnerabilities that could appear.

**Stablecoin Bank Quorum**

The smart contract takes a token as input to change the script. This can be seen on [EIP-0015: SigmaUSD Contracts Standard](https://github.com/ergoplatform/eips/blob/master/eip-0015.md) and the [ergoforum](https://www.ergoforum.org/t/sigusd-v-2-0-launch/912)

- cymatic
- Armeanio
- ponte
- Spire Staking
- anon2020s


## Oracle

- 0.5% change every 12 minutes

[Governance for oracle pools and the SigmaUSD bank](https://www.ergoforum.org/t/governance-for-oracle-pools-and-the-sigmausd-bank/786)

### Providers




- greenhat - ergo-lib (aka sigma-rust) developer
- scalahub - core R&D fellow
- andyceo - small miner, worked as sysadmin for testnet and other servers in 2017-19
- spirestaking - Cardano stake pool operators
- psychomb - Cardano stake pool operators (https://stakhanovite.io/ 3)
- Moein Zargarzadeh - reference miners developer
- Kst20 - guy made video tutorials on running the node and the ErgoMixer on Windows
- ollsanek - notable Russian community member
- Marek Mahut from Five Binaries

## Resources

- [EIP-0015: SigmaUSD Contracts #28](https://github.com/ergoplatform/eips/pull/28)



## Updates

Here is a table summarizing the key updates in each version of the SigmaBank smart contracts which can be seen in [contracts](/contracts/).

| Feature | SigmaBankV0 | [SigmaBankV1](SIP-0000.md) | [SigmaBankV2](SIP-0001.md) |
|---------|-------------|-------------|-------------|
| Cooling-off period | Uses variable `$coolingOffHeight` | Uses `coolingOffHeight` constant (460000) | **No cooling-off period** |
| Reserve ratio limits | Uses `defaultMaxReserveRatioPercent` and `INF` variables | Uses `defaultMaxReserveRatioPercent` (800%) and **`INF` (1000000000L) constants** | Uses `maxReserveRatioPercent` (800%) constant, **removes `INF`** |
| Minting limits per oracle update | Not present | Not present | **Introduced `R6` (last oracle update height) and `R7` (remaining limit for SigUSD and SigRSV minting) registers, and related limit checks** |
| Fee percentage | Uses `$feePercent` variable | **Uses `feePercent` constant (2%)** | Same as V1 |
| Update box validation | Not present | **Introduced `isUpdate` validation using `updateNFT` constant** | Same as V1 |

- The **cooling off period** mechanism was specifically designed for the initial launch phase of the SigmaUSD system. It provided a grace period during which the maximum reserve ratio constraint was relaxed, allowing for more flexibility in minting reserve coins (SigRSV) relative to the circulating supply of stablecoins (SigUSD). However, after the launch phase, this mechanism becomes redundant and can be removed to simplify the contract and eliminate potential confusion or unintended behavior.
- The purpose of the **INF value** is to effectively disable the maximum reserve ratio check during the cooling-off period. When the contract height is less than or equal to the cooling-off height, the maxReserveRatioPercent is set to INF, which is a very large number (1000000000 in V1). This ensures that the reserve ratio check passes during the cooling-off period.
- After the bearwhale attacks, an **UpdateNFT** was introduced so that the contract could be modified if required in future. 