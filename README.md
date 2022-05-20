# SigmaUSD Improvement Proposals (SIPs)

SigmaUSD Improvement Proposals (SIPs) specify and/or describe standards for SigmaUSD. 

Please check out existing EIPs, such as [EIP-0015: SigmaUSD Contracts Standard](https://github.com/ergoplatform/eips/blob/master/eip-0015.md), to understand the general expectation of how EIPs are supposed to be formatted.


| Number | Title |
| ---  | ---  |
| [EIP-0015](https://github.com/ergoplatform/eips/blob/master/eip-0015.md) | SigmaUSD Contracts Standard |


## Discussion

### Shortcomings

- **Reserve Draining Attack:** See the [Bearwhale Saga](https://ergoplatform.org/en/blog/2021-05-13-bearwhale-saga/)
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

The smart contract takes a token as input to change the script. 

- cymatic
- Armeanio
- ergo101
- anon2020s

**Oracle Providers**

- greenhat - ergo-lib (aka sigma-rust) developer
- scalahub - core R&D fellow
- andyceo - small miner, worked as sysadmin for testnet and other servers in 2017-19
- spirestaking - Cardano stake pool operators
- psychomb - Cardano stake pool operators (https://stakhanovite.io/ 3)
- Moein Zargarzadeh - reference miners developer
- Kst20 - guy made video tutorials on running the node and the ErgoMixer on Windows
- ollsanek - notable Russian community member
- Marek Mahut from Five Binaries



- [Governance for oracle pools and the SigmaUSD bank](https://www.ergoforum.org/t/governance-for-oracle-pools-and-the-sigmausd-bank/786)



