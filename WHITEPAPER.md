# TwentyOne
Spread the word. Spread sell pressure.

## Overview

> “If you aren’t willing to own a stock for 10 years, don’t even think about owning it for 10 minutes.”
- Warren Buffet

While this quote is inspiring, things in crypto move much faster than in the stock market.

So, TwentyOne is rewriting the rules slightly:

> If you aren’t willing to own a token for 21 days, don’t even think about owning it for 21 seconds.
- TwentyOne

TwentyOne is a token that is constructed to allow holders to benefit from the long-term growth and adoption, versus the traditional short-term holding that can be experienced on the market. This is achieved through the linear vesting mechanism built into the token, limiting the selling pressure helping the token price appreciate over time.

From time of purchase, holders will be vested linearly for 21 days with a 21 second cliff.

TwentyOne will be made available on the BNB Chain (formally Binance Smart Chain).

Note that TwentyOne is an experimental token, the outcome is not guarenteed.

## Community

TwentyOne is a community owned project.

Holders will be able to vote on initiatives, for example, adding a utility aspect, or on how to use the community funds. These votes will be completed through a purpose built DAO.

The management team will assume the role of trustees and will be responsible for implementing approved proposals and safeguarding the community funds.

There will be fees associated with pushing community initiatives. These fees will go to the community funds.

| Creating a proposal   | 0.021 BNB     |
| Vote on a proposal    | 0.0021 BNB    |

Voting weight will be proportional to the total token balance at time of vote.

Any holder can create a proposal.
Proposals with over 50% “for” votes will be passed and implemented.

The community will be available on Telegram and Twitter.

## Dashboard

The TwentyOne dapp will be available at launch.

The goal is to provide a intuitive ux + transparency around the project.

The dashboard will contain basic project metrics and account metrics. A swap will be built into the interface to enhance the user experience.

Additionally a DAO interface will be made available, allowing holders to view and create and engage with proposals.


| Version   | Features |
|-----------|----------|
| 1.0       | Connect your wallet in order to view holdings and vesting data |
| 1.1       | Built-in swap |
| 2.0       | DAO interface + contract |

Throught the contract api + DAO, further concepts can be proposed by the community.

## Tokenomics

### Supply

| Total Supply  | 21,000,000 |
| Initial MCap  | TBD |
| Launch price  | TBD |

### Tax

| Tax                   | Buy   | Sell  |
|-----------------------|-------|-------|
| Marketing             | 6.3%  | 8.4%  |
| Community Reserves    | 2.1%  | 4.2%  |
| Governance            | 2.1%  | 2.1%  |
| Development           | 2.1%  | 2.1%  |
|                       |       |       |
| Total                 | 12.6% | 16.8% |

### Initial Distribution

| Category  | % Supply  | Cliff | Vesting   |
|-----------|-----------|-------|-----------|
| Private   | 10.5%     | 21s   | 21d       |
| Presale   | 10.5%     | 21s   | 21d       |
| Team      | 10.5%     | 21d*  | 126d      |
| Public    | 68.5%     | 21s   | 21d       |
|           |           |       |           |
| Total     | 100%      |       |           |

*The contract owner has the ability to create special vesting schedules. Their minimum cliff + duration is equal to the preset cliff + duration.

## FAQ

### What is linear vesting?

Linear vesting is the process of releasing tokens to holders in a progressive manner. 

In the case of TwentyOne, holders are vested through linear vesting for 21 days with a 21 second cliff.

21 second cliff = holders will not be able to sell tokens for 21 seconds after buying.
21 day vesting = after 21 hours, ~0.0000551% tokens are released every second.

You will be able to sell the vested tokens directly through pancakeswap or via the dapp swap.

### Why did you name the project TwentyOne?

When Satoshi Nakamoto created Bitcoin, he limited its total supply to 21 million.

TwentyOne has taken the number 21 and applied it throughout the project. Every number you will find is somehow related to 21.

Up to you to figure out how. :)

### What is the utility behind this project?

No staking. No rewards. No NFTs.

This is an experimental token, exploring whether algorithmically spreading sell pressure overtime can support the long term viability of a project.

That being said, there is a commitment to supporting the long term growth of the project and is open to adding utility to the project in order to add underlying value. That is what the DAO and Community Reserves are for!

### Will the token be listed on centralized exchanges?

Doubt it. In order to integrate the linear vesting functionality into the token we had to customize the contract code. In general, it is difficult to list such tokens on CEX.

That being said, never say never. :)

### What are the marketing plans?

Yes! We plan to work with the biggest names on the BNB Chain.

We are also counting on word-of-mouth. Since the token has in-built vesting, all holders are incentivized to promote the token in their communities.

Once the DAO is up and running, marketing initiatives will be voted on through the there.

The token stewards will be responsible for implementing initiatives.

## Risks + Mitigations

below is a non-exhaustive list of potential risks + mitigations

| risks | mitigations |
|-------|-------------|
| project death | when the lp unlocks token holders will have the choice of voting to add the residual lp to the [B10K.IO] community governance token and receive the equivalent $ amount |
| rugpull + other | we aim to be transparent and to build a relationship with the community that is why we keep a history of projects on [our website](https://b10k.io). Additionally, we will be co-developing with a SAFU DEV who will be the contract owner. |