# Economy & RNG constants (raw)

> Source: game-file extract from [spire-codex](https://github.com/ptrlrd/spire-codex) (PolyForm Noncommercial 1.0.0). Raw JSON in `../data/`. Markup stripped; `(1E)` = energy, `(1★)` = Regent stars.

```json
{
  "mechanics_constants": {
    "ascension_helper": {
      "PovertyAscensionGoldMultiplier": 0.75
    },
    "ascension_levels": [
      "SwarmingElites",
      "WearyTraveler",
      "Poverty",
      "TightBelt",
      "AscendersBane",
      "Inflation",
      "Scarcity",
      "ToughEnemies",
      "DeadlyEnemies",
      "DoubleBoss"
    ],
    "card_rarity_odds": {
      "EliteCommonOdds": {
        "ascended": 0.549,
        "ascension_level": "Scarcity",
        "base": 0.5
      },
      "EliteRareOdds": {
        "ascended": 0.05,
        "ascension_level": "Scarcity",
        "base": 0.1
      },
      "RarityGrowth": {
        "ascended": 0.005,
        "ascension_level": "Scarcity",
        "base": 0.01
      },
      "RegularRareOdds": {
        "ascended": 0.0149,
        "ascension_level": "Scarcity",
        "base": 0.03
      },
      "ShopCommonOdds": {
        "ascended": 0.585,
        "ascension_level": "Scarcity",
        "base": 0.54
      },
      "ShopRareOdds": {
        "ascended": 0.045,
        "ascension_level": "Scarcity",
        "base": 0.09
      },
      "_baseRarityOffset": -0.05,
      "_maxRarityOffset": 0.4,
      "bossCommonOdds": 0.0,
      "bossRareOdds": 1.0,
      "bossUncommonOdds": 0.0,
      "eliteUncommonOdds": 0.4,
      "regularCommonOdds": {
        "ascended": 0.615,
        "ascension_level": "Scarcity",
        "base": 0.6
      },
      "regularUncommonOdds": 0.37,
      "shopUncommonOdds": 0.37
    },
    "combat_modifiers": {
      "Frail": {
        "decays": false,
        "key": "BlockDecrease",
        "value": 0.75
      },
      "Vulnerable": {
        "decays": false,
        "key": "DamageIncrease",
        "value": 1.5
      },
      "Weak": {
        "decays": false,
        "key": "DamageDecrease",
        "value": 0.75
      }
    },
    "encounter_gold_rewards": {
      "Boss": {
        "max": 100,
        "min": 100
      },
      "Elite": {
        "max": 45,
        "min": 35
      },
      "Monster": {
        "max": 20,
        "min": 10
      }
    },
    "potion_reward_odds": {
      "_basePotionRewardOdds": 0.4,
      "eliteBonus": 0.25,
      "targetOdds": 0.5
    },
    "unknown_map_point_odds": {
      "baseEliteOdds": -1.0,
      "baseMonsterOdds": 0.1,
      "baseShopOdds": 0.03,
      "baseTreasureOdds": 0.02
    }
  },
  "merchant_config": {
    "card_removal": {
      "base_cost": 75,
      "inflation_ascension": {
        "base_cost": 100,
        "level": "Inflation",
        "price_increase": 50
      },
      "price_increase": 25
    },
    "cards": {
      "by_rarity": {
        "Common": {
          "base": 50,
          "max": 52,
          "min": 48
        },
        "Rare": {
          "base": 150,
          "max": 158,
          "min": 142
        },
        "Uncommon": {
          "base": 75,
          "max": 79,
          "min": 71
        }
      },
      "colorless_markup": 1.15,
      "on_sale_divisor": 2,
      "variance": {
        "max": 1.05,
        "min": 0.95
      }
    },
    "fake_merchant": {
      "relic_cost": 50
    },
    "potions": {
      "by_rarity": {
        "Common": {
          "base": 50,
          "max": 52,
          "min": 48
        },
        "Rare": {
          "base": 100,
          "max": 105,
          "min": 95
        },
        "Uncommon": {
          "base": 75,
          "max": 79,
          "min": 71
        }
      },
      "variance": {
        "max": 1.05,
        "min": 0.95
      }
    },
    "relics": {
      "by_rarity": {
        "Common": {
          "base": 175,
          "max": 201,
          "min": 149
        },
        "Rare": {
          "base": 275,
          "max": 316,
          "min": 234
        },
        "Shop": {
          "base": 200,
          "max": 230,
          "min": 170
        },
        "Uncommon": {
          "base": 225,
          "max": 259,
          "min": 191
        }
      },
      "variance": {
        "max": 1.15,
        "min": 0.85
      }
    }
  }
}
```
