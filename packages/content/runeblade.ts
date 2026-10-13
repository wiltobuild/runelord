export type HeroId = 'warlock' | 'runeblade';
export const legacyRunebladeSummons = {
 'frost-thrall': {name:'Frost Thrall',hp:16,power:6,upkeep:0,defender:false},
 'shattered-queen': {name:'Shattered Queen',hp:12,power:3,upkeep:0,defender:false},
 'rime-seer': {name:'Rime Seer',hp:10,power:4,upkeep:0,defender:false},
 'rune-revenant': {name:'Rune Revenant',hp:14,power:3,upkeep:0,defender:false},
 'bone-defender': {name:'Bone Defender',hp:18,power:3,upkeep:0,defender:true},
} as const;
export const runebladeSummons = {
 ...legacyRunebladeSummons,
 'frost-thrall':{...legacyRunebladeSummons['frost-thrall'],hp:20,power:7},
 'shattered-queen':{...legacyRunebladeSummons['shattered-queen'],hp:15,power:4},
 'rime-seer':{...legacyRunebladeSummons['rime-seer'],hp:13,power:5},
 'rune-revenant':{...legacyRunebladeSummons['rune-revenant'],hp:18,power:4},
 'bone-defender':{...legacyRunebladeSummons['bone-defender'],hp:23,power:4},
} as const;
export type ThrallKind = keyof typeof runebladeSummons;
export const runebladeDefinitions = [
 ['summon-frost-thrall','Frost Thrall',2,'Summon','Common','Summon a 20 HP / 7 Power Thrall. Attacks apply 1 Chill.'],
 ['summon-shattered-queen','Shattered Queen',3,'Summon','Rare','Summon a 15 HP / 4 Power Thrall. Attacks hit ALL enemies and apply 1 Chill.'],
 ['summon-rime-seer','Rime Seer',2,'Summon','Common','Summon a 13 HP / 5 Power Thrall. Attacks apply 3 Chill.'],
 ['summon-rune-revenant','Rune Revenant',2,'Summon','Uncommon','Summon a 18 HP / 4 Power Thrall. Attacks strike twice.'],
 ['summon-bone-defender','Bone Defender',2,'Summon','Common','Summon an 23 HP / 4 Power Thrall with Defender.'],
 ['exhume','Exhume',1,'Skill','Common','Gain 2 Corpses.'],
 ['mass-exhumation','Mass Exhumation',2,'Skill','Uncommon','Gain 4 Corpses.'],
 ['hew','Hew',1,'Attack','Basic','Deal 8 damage.'],
 ['brace','Brace',1,'Skill','Basic','Gain 6 Guard.'],
 ['frostbite','Frostbite',2,'Attack','Basic','Heavy. Deal 10 damage. Apply 3 Chill.'],
 ['rimecleave','Rimecleave',1,'Attack','Common','Deal 6 damage and apply 1 Chill to ALL enemies.'],
 ['glacial-ward','Glacial Ward',1,'Skill','Common','Gain 8 Guard. Draw 1 card.'],
 ['frozen-grasp','Frozen Grasp',0,'Skill','Common','Apply 3 Chill.'],
 ['command-the-dead','Command the Dead',0,'Skill','Common','All Thralls attack now. Their Rot also triggers.'],
 ['bone-ward','Bone Ward',1,'Skill','Common','Gain 5 Guard for each Thrall you control (minimum 5).'],
 ['hoarfrost-edge','Hoarfrost Edge',1,'Attack','Common','Deal 4 damage twice. Each hit applies 1 Chill.'],
 ['unholy-vigor','Unholy Vigor',1,'Power','Uncommon','Your Thralls gain +2 Power, including future summons.'],
 ['frost-nova','Frost Nova',2,'Skill','Uncommon','Apply 4 Chill to ALL enemies. Gain 6 Guard.'],
 ['soulfrost-blade','Soulfrost Blade',1,'Attack','Uncommon','Deal 6 damage plus 2 for each Chill on the enemy.'],
 ['dark-tithe','Dark Tithe',0,'Skill','Uncommon','Sacrifice a Thrall. Gain 2 Mana. Draw 1 card.'],
 ['rally-the-fallen','Rally the Fallen',1,'Skill','Uncommon','All Thralls heal 8 HP and reset Rot to 0.'],
 ['sweeping-hew','Sweeping Hew',2,'Attack','Uncommon','Heavy. Deal 12 damage to ALL enemies.'],
 ['permafrost-aura','Permafrost Aura',1,'Power','Uncommon','At the start of your turn, apply 2 Chill to ALL enemies.'],
 ['glacier-wall','Glacier Wall',2,'Skill','Rare','Gain 30 Guard. Consume.'],
] as const;
export const runebladeImplemented = runebladeDefinitions.map(c=>c[0]);
export type RunebladeCardId = typeof runebladeDefinitions[number][0];
export const runebladeRelicPool = ['gravebound-sigil','hoarfrost-whetstone','suture-standard','icebound-phylactery','gravewardens-bell','crown-of-rime'] as const;
export const legacyRunebladeDecks = [
 {id:'gravehost',hero:'runeblade',name:'Gravehost',description:'Raise a relentless host. Sacrifice and recycle fallen allies into your next summons.',cards:['summon-frost-thrall','summon-rune-revenant','summon-bone-defender','hew','hew','brace','glacial-ward','bone-ward','command-the-dead','dark-tithe']},
 {id:'rimebound',hero:'runeblade',name:'Rimebound',description:'Stack Chill, freeze your foes, and shatter them with Heavy strikes.',cards:['summon-rime-seer','summon-shattered-queen','frostbite','hew','hoarfrost-edge','frozen-grasp','rimecleave','brace','brace','glacial-ward']},
 {id:'runewarden',hero:'runeblade',name:'Runewarden',description:'Hold the line behind a Bone Defender. Mend and empower your undead guard.',cards:['summon-bone-defender','summon-frost-thrall','summon-rime-seer','hew','hew','brace','glacial-ward','bone-ward','rally-the-fallen','unholy-vigor']},
] as const;
export const runebladeDecks = legacyRunebladeDecks.map(deck=>{
 const replaced=deck.id==='rimebound'?'brace':'hew';
 const at=deck.cards.lastIndexOf(replaced as never);
 return {...deck,cards:deck.cards.map((id,index)=>index===at?'exhume' as const:id)};
});
export function runebladeEffectText(id:string,level=0,rules:1|2=2):string|undefined {
 const v=(n:number)=>level?Math.max(n+level,Math.round(n*1.2**level)):n;
 if(id.startsWith('summon-') && id.slice(7) in runebladeSummons) {
  const kind=id.slice(7) as ThrallKind,u=(rules===1?legacyRunebladeSummons:runebladeSummons)[kind];
  const effect=kind==='frost-thrall'?'Attacks apply 1 Chill.':kind==='rime-seer'?'Attacks apply 3 Chill.':kind==='shattered-queen'?'Attacks hit ALL enemies and apply 1 Chill.':kind==='rune-revenant'?'Attacks strike twice.':'Defender.';
  return `Summon ${u.name}: ${Math.round(u.hp*1.2**level)} HP / ${Math.round(u.power*1.2**level)} Power. ${effect} Rot starts at 1. Automatically spend Corpses equal to its Mana cost instead if available.`;
 }
 const rb=(old:number,current:number)=>rules===1?old:current;
 const texts:Record<string,string>={'exhume':`Gain ${v(2)} Corpses.`,'mass-exhumation':`Gain ${v(4)} Corpses.`,hew:`Deal ${v(rb(6,8))} damage.`,brace:`Gain ${v(rb(5,6))} Guard.`,frostbite:`Heavy. Deal ${v(rb(8,10))} damage. Apply ${v(3)} Chill.`,'rimecleave':`Deal ${v(rb(5,6))} damage and apply 1 Chill to ALL enemies.`,'glacial-ward':`Gain ${v(8)} Guard. Draw 1 card.`,'frozen-grasp':`Apply ${v(3)} Chill.`,'command-the-dead':level?`All Thralls gain ${v(2)} Power this turn and attack now. Rot triggers.`:'All Thralls attack now. Rot triggers.','bone-ward':`Gain ${v(rb(4,5))} Guard for each Thrall (minimum ${v(rb(4,5))}).`,'hoarfrost-edge':`Deal ${v(4)} damage twice. Each hit applies 1 Chill.`,'unholy-vigor':`Your Thralls gain +${v(2)} Power, including future summons.`,'frost-nova':`Apply ${v(4)} Chill to ALL enemies. Gain ${v(6)} Guard.`,'soulfrost-blade':`Deal ${v(6)} damage plus ${v(2)} for each Chill on the enemy.`,'dark-tithe':`Sacrifice a Thrall. Gain 2 Mana. Draw ${v(1)} card(s).`,'rally-the-fallen':`All Thralls heal ${v(rb(6,8))} HP and reset Rot to 0.`,'sweeping-hew':`Heavy. Deal ${v(rb(10,12))} damage to ALL enemies.`,'permafrost-aura':`At the start of your turn, apply ${v(2)} Chill to ALL enemies.`,'glacier-wall':`Gain ${v(30)} Guard. Consume.`};
 return texts[id];
}
