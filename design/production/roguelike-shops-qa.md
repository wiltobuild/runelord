# Independent roguelike shop QA

Date: 2026-10-03. Reviewer: map_bridge_art (independent of rules and UI builders).
Checkout: C:/Users/wilsh/Projects/runelord-tintfix, branch roguelike-shops, base 9863523 plus current uncommitted shop slice.

## Verdict

No blocking findings in the reviewed engine slice. Independently ran `npm test`: 122 passed, 0 failed. No production files edited by reviewer.

## Reviewed behavior

- Shops follow encounter 3 and encounter 6 only, after the existing card/reward and loot acknowledgement. Leaving shop advances once; encounter 6 still proceeds through its rest site. Final boss loot resolves to victory rather than opening a third shop.
- Bought cards start at level zero. Purchased upgrades remain attached to individual deck copies and become combat card instances at the next battle. Scalar effects, summon HP/damage, powers, and eligible mana reductions consume those levels. Test coverage exercises upgraded summons and attacks, passive relic bonuses, and preview numbers.
- Services match source Soulforge rules in C:/Users/wilsh/Projects/runelord/packages/engine/infernal.ts: two card offers, two owned-copy upgrade/removal offers, five relics; card prices 45/90, relics 120; upgrades 50 then double per level; removal 10 with a ten-card floor; independent rerolls start at 10 and double. Rerolls prefer distinct alternatives without removing owned deck cards.
- Purchase and reward copy caps are three normal/two rare. Owned relics cannot be purchased again. Removal remaps surviving offer indices and invalidates the deleted copy. Service offers cannot be purchased or upgraded twice without a new eligible offer.
- Shop stock and appearance randomness do not consume combat RNG. Stock is persisted by deterministic action replay. Schema 6 starts the new roguelike run and replays shop actions; historical schemas 1–3 retain the original path. Earned-gold replay test checks arrival, upgrade, rerolls, purchase and departure round trips.
- Invalid selections, insufficient funds, invalid reroll types, unsafe exponential prices, and removal at deck floor throw against a cloned state, preserving the caller's state.

## Evidence boundaries

Engine tests and source review are independent here. Parent reports production build success and browser verification of purchases, upgrades, removal floor, relics, rerolls, departure to encounter 4, merchant/background variants and zero console errors. Those UI checks were performed by parent, not this reviewer. No new full browser playthrough performed by reviewer. No commit or deployment performed.

## Reviewed file hashes (SHA-256)

- packages/engine/shop.ts: bfe0c519ced1efc0fd8b2b1ffed3452b6db52d83bc6f763d3d6dfaFFFdf89e90
- packages/engine/index.ts: 5896943fa95f08f8b3b50c7ba49b15d51dc9e9d3c0b5aeaf926f01f80f5dd8c6
- packages/engine/soulforge.test.ts: f59c30a9da865bc666fb277455b530ee696a927fb9d643075103dd5361f2a4d0
