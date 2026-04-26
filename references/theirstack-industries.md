# TheirStack Industries — Ivan's Profile Fit

Industries from the TheirStack catalog relevant to Ivan's job search (Web3/DeFi first, AI/tech second).
Use `industry_id` values in the TheirStack jobs/search API payload as `company_industry_id_or`.

---

## Tier 1 — Web3 / Blockchain (Primary Target)

| ID   | Industry                              | Hierarchy                                                    | Companies | Jobs   |
| ---- | ------------------------------------- | ------------------------------------------------------------ | --------- | ------ |
| 3134 | **Blockchain Services**               | Technology > TII > Data Infrastructure > Blockchain Services | 638       | 5,964  |
| 2458 | **Data Infrastructure and Analytics** | Technology > TII > Data Infrastructure                       | 861       | 20,109 |

> Covers DeFi protocols, NFT platforms, RWA tokenization, crypto trading platforms, blockchain hosting, on-chain data providers.

---

## Tier 2 — FinTech / Capital Markets (DeFi-adjacent)

| ID  | Industry                               | Hierarchy                                                    | Companies | Jobs      |
| --- | -------------------------------------- | ------------------------------------------------------------ | --------- | --------- |
| 129 | **Capital Markets**                    | Financial Services > Capital Markets                         | 544       | 11,537    |
| 46  | **Investment Management**              | Financial Services > Capital Markets > Investment Management | 4,652     | 75,633    |
| 106 | **Venture Capital and Private Equity** | Financial Services > Capital Markets > VC & PE               | 2,920     | 64,626    |
| 43  | **Financial Services**                 | Financial Services (top-level)                               | 74,847    | 4,088,005 |

> Capital Markets and Investment Management overlap with DeFi trading, asset management protocols. VC firms often hire founding/staff engineers directly.

---

## Tier 3 — Tech / Product (Broad Catch-all)

| ID   | Industry                                 | Hierarchy                                         | Companies | Jobs      |
| ---- | ---------------------------------------- | ------------------------------------------------- | --------- | --------- |
| 4    | **Software Development**                 | Technology > TII > Software Development           | 72,962    | 4,947,013 |
| 6    | **Technology, Information and Internet** | Technology > TII                                  | 38,271    | 1,656,969 |
| 1285 | **Internet Marketplace Platforms**       | Technology > TII > Internet Marketplace Platforms | 1,016     | 73,545    |
| 1594 | **Technology, Information and Media**    | Technology, Information and Media (top-level)     | 8,702     | 155,004   |

> Use when scoping to TypeScript/React/Node.js product companies outside of pure Web3. Internet Marketplace Platforms covers NFT marketplaces and DeFi aggregators.

---

## Not Recommended

- **Computer Games** (109), **Mobile Gaming Apps** (3131) — not a target domain
- **Telecommunications** (8) — irrelevant to stack

---

## Recommended API Filter (tight Web3 focus)

```json
{
  "company_industry_id_or": [3134, 2458, 129, 1285]
}
```

## Recommended API Filter (broad tech + fintech)

```json
{
  "company_industry_id_or": [3134, 2458, 4, 6, 129, 46, 1285]
}
```
