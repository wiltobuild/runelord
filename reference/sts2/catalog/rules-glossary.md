# Rules glossary: keywords, afflictions, enchantments, orbs, intents

> Source: game-file extract from [spire-codex](https://github.com/ptrlrd/spire-codex) (PolyForm Noncommercial 1.0.0). Raw JSON in `../data/`. Markup stripped; `(1E)` = energy, `(1★)` = Regent stars.

## Card keywords

| Name | Description |
|---|---|
| Eternal | Cannot be removed or transformed from your Deck. |
| Ethereal | If this card is in your Hand at the end of this turn, it is Exhausted. |
| Exhaust | Removed until the end of combat. |
| Innate | Start each combat with this card in your Hand. |
| Retain | Retained cards are not discarded at the end of turn. |
| Sly | If this card is discarded from your Hand before the end of your turn, play it for free. |
| Unplayable | Unplayable cards cannot be played. |

## Afflictions (temporary negative card mods applied by enemies)

| Name | Description | is_stackable |
|---|---|---|
| Bound | Only 1 Bound card can be played each turn. Cards are un-Bound at end of turn. | False |
| Entangled | Costs an additional (1E). | False |
| Galvanized | Take X damage when this card is played. | True |
| Hexed | Add Ethereal to this card. | False |
| Ringing | You can only play 1 card this turn. | False |
| Smog | You cannot play additional Skills this turn. Clears at the end of the turn. | False |
| Tainted | Gain X Tainted when played. | True |

## Enchantments (permanent positive card mods)

| Name | Description | card_type |
|---|---|---|
| Adroit | Gain X Block. |  |
| Clone | This card can be duplicated at Rest Sites. |  |
| Corrupted | Deal 50% more damage, but lose 2 HP. | Attack |
| Glam | This card has Replay once per combat. |  |
| Goopy | This card gains Exhaust. When played, permanently increase this card's Block by 1. |  |
| Imbued | This card is played automatically at the start of each combat. | Skill |
| Inky | This card deals 1 additional damage and applies 1 Weak. |  |
| Instinct | This card's attack damage is doubled. | Attack |
| Momentum | Increase this card's attack damage by X this combat when played. | Attack |
| Nimble | Increases Block gained from this card by X. |  |
| Perfect Fit | Whenever this would be shuffled into your Draw Pile, place it on the top instead. |  |
| Royally Approved | This card has Innate and Retain. | Attack, Skill |
| Sharp | Increases damage on this card by X. | Attack |
| Slither | When you draw this card, randomize its cost from 0 to 3. |  |
| Slumbering Essence | If this card is in your hand at the end of turn, reduce its cost by 1 until it is played. |  |
| Soul's Power | This card loses Exhaust. |  |
| Sown | The first time you play this card each combat, gain [energy:X]. |  |
| Spiral | This card gains Replay 1. |  |
| Steady | This card gains Retain. |  |
| Swift | The first time you play this card, draw X cards. |  |
| Tezcatara's Ember | Costs 0, deals 3 additional damage, and gains Eternal. |  |
| Vigorous | The first time this card is played, it deals X additional damage. | Attack |

## Orbs (Defect)

| Name | Description |
|---|---|
| Dark | Passive: At the end of turn, increase this Orb's damage by 6. Evoke: Deal 6 damage to the enemy with the lowest HP. |
| Frost | Passive: At the end of turn, gain 2 Block. Evoke: Gain 5 Block. |
| Glass | Passive: At the end of turn, deal 4 damage to ALL enemies and reduce this orb's value by 1. Evoke: Deal 8 damage to ALL enemies. |
| Lightning | Passive: At the end of turn, deal 3 damage to a random enemy. Evoke: Deal 8 damage to a random enemy. |
| Plasma | Passive: At the start of turn, gain (1E). Evoke: Gain (2E). Plasma is unaffected by Focus. |

## Enemy intents

| Name | Description |
|---|---|
| Aggressive | This enemy intends to Attack {IsMultiplayer:everyone /}for {Damage} damage{Repeat:plural:/ {} times}. |
| Empower | This enemy intends to use a Buff. |
| Malicious | This enemy intends to apply Afflictions on your cards. |
| Death Blow | This creature is trying to take you down with it. It will attack you for {Damage} damage before being destroyed. |
| Strategic | This enemy intends to apply a Debuff to you. |
| Strategic | This enemy intends to apply a powerful Debuff to you. |
| Defensive | This enemy intends to Block on its turn. |
| Cowardly | This enemy intends to Escape. |
| Heal | This enemy intends to Heal. |
| Sleeping | This enemy is doing nothing this turn. |
| Strategic | This enemy intends to give you {CardCount} Status {CardCount:plural:card/cards}. |
| Stunned | This enemy can't act on its next turn. |
| Summon | This enemy intends to summon Monsters. |
| Unknown | This enemy's intentions are Unknown. |

## Glossary

| Name | Description | category |
|---|---|---|
| Block | Until next turn, prevents damage. | combat |
| Card Reward | A pack of 3 random cards. You may choose 1 to add to your Deck. | progression |
| Channel | Channeling an Orb puts it into your first empty slot. If you have no empty slots, your first Orb is automatically Evoked to make room. | combat |
| Cook | Remove 2 cards from your Deck and gain 9 Max HP at a Rest Site. | mechanics |
| Deck | View all of the cards in your deck. | zones |
| Discard Pile | If your draw pile is empty, the discard pile is shuffled into the draw pile. Click to view the cards in your discard pile. | zones |
| Draw Pile | At the start of each turn, 5 cards are drawn from here. Click to view the cards in your draw pile (shuffled). | zones |
| Energy | Energy is used to play cards from your Hand. | combat |
| Evoke | Consume your rightmost Orb and use its Evoke effect. | combat |
| Exhausted Cards | Click to view cards Exhausted this combat. | zones |
| Fatal | Triggers whenever this card kills a non-minion enemy. | combat |
| Forge | The first time you Forge each combat, add Sovereign Blade into your Hand. Adds additional damage to Sovereign Blade. | mechanics |
| Hit Points | If you run out of HP, you die. | progression |
| Linked Rewards | You can only select 1 reward from this set. | progression |
| Gold | How much Gold you have. Gold is the currency within the Spire. | progression |
| Potion Slot | Use potions during combat to gain bonuses or hinder enemies. | progression |
| Replay | Plays this card an additional time. | mechanics |
| Ancient | Ancients reside in these rooms. They grant incredible bonuses, treasures, and knowledge. | rooms |
| Boss | The deadliest foe in the area. Defeating them will let you proceed to the next Act. | rooms |
| Elite | Powerful foes are in these rooms. Defeating them will reward you a Relic. | rooms |
| Enemy | Hostile enemies reside in these rooms. | rooms |
| Event | Something unusual occurs in these rooms... | rooms |
| Shop | The mysterious Merchant sells his wares in these rooms. Spend your well-earned Gold here! | rooms |
| Rest Site | Stop by these rooms to Heal some HP or Upgrade a card. | rooms |
| Treasure Room | Relics and Gold can be found in these coveted rooms. | rooms |
| Stun | Prevent the enemy from acting on its next turn. | combat |
| Summon | Summon Osty. If already summoned, raise his Max HP for this combat. | mechanics |
| Transform | Transformed cards become a random card of any rarity. | mechanics |

