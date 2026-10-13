import type { EnemyDefinition } from '../content/index';

/** First playable balance pass. Summons are finite and independently targetable. */
export const forestSovereign: EnemyDefinition = {
  name: 'Root-Crown King, Forest Sovereign', art: 'forest-sovereign', boss: 'forest-sovereign', hp: 240,
  moves: [
    {name:'Rootwake — summon 2 living roots',damage:0,targeting:'front',kind:'summon',spell:'rootwake'},
    {name:'Verdant Cyclone',damage:7,targeting:'sweep',spell:'verdant_cyclone'},
    {name:'Crownfall',damage:14,targeting:'front',spell:'crownfall'},
    {name:'Ancient Fist',damage:11,targeting:'front'},
  ],
};
export const sovereignRoot: EnemyDefinition = {
  name:'Living Root',art:'sovereign-root',hp:28,
  moves:[{name:'Thorn strike',damage:5,targeting:'front'}],
};
