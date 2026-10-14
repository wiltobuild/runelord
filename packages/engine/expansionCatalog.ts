/** Data only: imported by both content and engine; never import either index here. */
export type TrainingEffect = {
  type: 'damage'|'coordinatedDamage'|'counter'|'heroGuard'|'unitGuard'|'healUnit'|'healHero'|'power'|'scorch'|'chill'|'draw'|'summon'|'sapped'|'exposed'|'bodyguard'|'hellgate';
  amount: number;
  scope: 'target'|'self'|'allAllies'|'allEnemies';
  kind?: string;
};
export type TrainingOrder = {id:string;name:string;description:string;target:'enemy'|'ally'|'self'|'none';effects:TrainingEffect[];charges?:number};
export type SummonTraining = {kind:string;name:string;baseName:string;tiers:[TrainingOrder,TrainingOrder]};
export const trainingCosts = [60,100] as const;
const fx=(type:TrainingEffect['type'],amount:number,scope:TrainingEffect['scope']='self'):TrainingEffect=>({type,amount,scope});
const order=(id:string,name:string,description:string,target:TrainingOrder['target'],...effects:TrainingEffect[]):TrainingOrder=>({id,name,description,target,effects});
const kit=(kind:string,name:string,baseName:string,utility:TrainingOrder,specialist:TrainingOrder):SummonTraining=>({kind,name,baseName,tiers:[utility,specialist]});

/** Training is owned by kind, not card copy. Base actions retain existing combat rules. */
export const summonTraining = {
 'iron-legionary':kit('iron-legionary','Iron Legionary','Slash',
  order('shield','Shield','Gain 5 Guard and become a Defender until next turn.','self',fx('unitGuard',5),fx('bodyguard',1)),
  order('drillmaster','Drillmaster','Give a selected ally +1 Power for this battle.','ally',fx('power',1,'target'))),
 'ash-pikeman':kit('ash-pikeman','Ash Pikeman','Impale',
  order('brace','Brace','Gain 3 Guard. Counter the next incoming attack before next turn for 4 damage.','self',fx('unitGuard',3),fx('counter',4)),
  order('coordinated-thrust','Coordinated Thrust','Deal 7 damage, plus 2 per other living Pikeman choosing Coordinated Thrust (maximum +6), and apply 1 Exposed.','enemy',fx('coordinatedDamage',7,'target'),fx('exposed',1,'target'))),
 maledictor:kit('maledictor','Maledictor','Scorch Hex',
  order('benediction','Benediction','Restore 3 HP to an ally and give it 3 Guard.','ally',fx('healUnit',3,'target'),fx('unitGuard',3,'target')),
  order('hellgate-channel','Hellgate Channel','With 3 living Maledictors choosing Channel, open the Hellgate and summon 1 Imp if space permits. Once per turn; the Imp waits until the next normal action phase.','none',fx('hellgate',1))),
 'bone-defender':kit('bone-defender','Bone Defender','Bone Strike',
  order('bone-wall','Bone Wall','Gain 7 Guard.','self',fx('unitGuard',7)),
  order('ossuary','Ossuary','Give all allies 3 Guard and the hero 3 Guard.','none',fx('unitGuard',3,'allAllies'),fx('heroGuard',3))),
 'frost-thrall':kit('frost-thrall','Frost Thrall','Frozen Blow',
  order('frost-shell','Frost Shell','Give an ally 5 Guard.','ally',fx('unitGuard',5,'target')),
  order('deep-freeze','Deep Freeze','Apply 4 Chill to one enemy.','enemy',fx('chill',4,'target'))),
 'rune-revenant':kit('rune-revenant','Rune Revenant','Twin Runes',
  order('rune-ward','Rune Ward','Give the hero 5 Guard.','none',fx('heroGuard',5)),
  order('rune-sunder','Rune Sunder','Deal 5 damage and expose the target by 2.','enemy',fx('damage',5,'target'),fx('exposed',2,'target'))),
 'shattered-queen':kit('shattered-queen','Shattered Queen','Shattered Crown',
  order('ice-court','Ice Court','Give all allies 2 Guard.','none',fx('unitGuard',2,'allAllies')),
  order('winter-edict','Winter Edict','Apply 2 Chill to every enemy.','none',fx('chill',2,'allEnemies'))),
 'rime-seer':kit('rime-seer','Rime Seer','Rime Sight',
  order('cold-reading','Cold Reading','Draw 1 card.','none',fx('draw',1)),
  order('whiteout','Whiteout','Apply 1 Chill and 1 Sapped to every enemy.','none',fx('chill',1,'allEnemies'),fx('sapped',1,'allEnemies'))),
 'ironhorn-bulwark':kit('ironhorn-bulwark','Ironhorn Bulwark','Horn Strike',
  order('iron-bastion','Iron Bastion','Gain 8 Guard.','self',fx('unitGuard',8)),
  order('rallying-wall','Rallying Wall','Give every ally 4 Guard.','none',fx('unitGuard',4,'allAllies'))),
 'dread-vanguard':kit('dread-vanguard','Dread Vanguard','Dread Cleave',
  order('dread-standard','Dread Standard','Give the hero 4 Guard and gain 4 Guard.','self',fx('heroGuard',4),fx('unitGuard',4)),
  order('break-ranks','Break Ranks','Deal 3 damage and apply 1 Exposed to all enemies.','none',fx('damage',3,'allEnemies'),fx('exposed',1,'allEnemies'))),
 imp:kit('imp','Imp','Ember Claw',
  order('cinder-screen','Cinder Screen','Give the hero 3 Guard.','none',fx('heroGuard',3)),
  order('ember-fan','Ember Fan','Apply 2 Scorch to all enemies.','none',fx('scorch',2,'allEnemies'))),
 hellhound:kit('hellhound','Hellhound','Pack Bite',
  order('pack-shelter','Pack Shelter','Give an ally 4 Guard.','ally',fx('unitGuard',4,'target')),
  order('hunting-howl','Hunting Howl','Give every ally +1 Power for this battle.','none',fx('power',1,'allAllies'))),
 'pit-brute':kit('pit-brute','Pit Brute','Brutal Sweep',
  order('pit-fortress','Pit Fortress','Gain 8 Guard.','self',fx('unitGuard',8)),
  order('crushing-roar','Crushing Roar','Deal 3 damage and apply 1 Sapped to every enemy.','none',fx('damage',3,'allEnemies'),fx('sapped',1,'allEnemies'))),
 gloomstalker:kit('gloomstalker','Gloomstalker','Alternating Curse',
  order('shadow-cover','Shadow Cover','Give an ally 5 Guard.','ally',fx('unitGuard',5,'target')),
  order('gloom-web','Gloom Web','Apply 1 Sapped and 1 Exposed to every enemy.','none',fx('sapped',1,'allEnemies'),fx('exposed',1,'allEnemies'))),
 'soul-leech':kit('soul-leech','Soul Leech','Soul Drain',
  order('soul-mend','Soul Mend','Restore 4 HP to an ally.','ally',fx('healUnit',4,'target')),
  order('soul-offering','Soul Offering','Restore 3 hero HP and draw 1 card.','none',fx('healHero',3),fx('draw',1))),
 'pyre-warden':kit('pyre-warden','Pyre Warden','Pyre Spark',
  order('ash-shelter','Ash Shelter','Give an ally 6 Guard.','ally',fx('unitGuard',6,'target')),
  order('warding-pyre','Warding Pyre','Give the hero 4 Guard and apply 1 Scorch to all enemies.','none',fx('heroGuard',4),fx('scorch',1,'allEnemies'))),
 ignivar:kit('ignivar','Ignivar','Sovereign Ember',
  order('flame-mantle','Flame Mantle','Give the hero 6 Guard.','none',fx('heroGuard',6)),
  order('inferno-edict','Inferno Edict','Apply 3 Scorch to every enemy.','none',fx('scorch',3,'allEnemies'))),
 cerberax:kit('cerberax','Cerberax','Threefold Bite',
  order('pack-aegis','Pack Aegis','Give all allies 3 Guard.','none',fx('unitGuard',3,'allAllies')),
  order('alpha-call','Alpha Call','Give every ally +1 Power and 2 Guard.','none',fx('power',1,'allAllies'),fx('unitGuard',2,'allAllies'))),
 nightmaw:kit('nightmaw','Nightmaw','Twin Curse',
  order('midnight-veil','Midnight Veil','Give the hero 5 Guard and draw 1 card.','none',fx('heroGuard',5),fx('draw',1)),
  order('endless-night','Endless Night','Apply 2 Sapped and 1 Exposed to all enemies.','none',fx('sapped',2,'allEnemies'),fx('exposed',1,'allEnemies'))),
 'hollow-saint':kit('hollow-saint','The Hollow Saint','Communion',
  order('hollow-prayer','Hollow Prayer','Restore 3 HP to all allies.','none',fx('healUnit',3,'allAllies')),
  order('last-sacrament','Last Sacrament','Restore 4 hero HP and give all allies 2 Guard.','none',fx('healHero',4),fx('unitGuard',2,'allAllies'))),
 'pyre-colossus':kit('pyre-colossus','Pyre Colossus','Colossal Pyre',
  order('colossal-ward','Colossal Ward','Give the hero 5 Guard.','none',fx('heroGuard',5)),
  order('cinder-vault','Cinder Vault','Give all allies 3 Guard and apply 2 Scorch to all enemies.','none',fx('unitGuard',3,'allAllies'),fx('scorch',2,'allEnemies'))),
 gorthak:kit('gorthak','Gorthak','Cataclysm',
  order('abyssal-wall','Abyssal Wall','Gain 12 Guard.','self',fx('unitGuard',12)),
  {...order('dominion','Dominion','Summon 1 Pit Brute if space permits. Once per battle across all Gorthaks; the reinforcement waits until the next normal action phase.','none',{type:'summon',amount:1,scope:'self',kind:'pit-brute'}),charges:1}),
} satisfies Record<string,SummonTraining>;

export type ExpansionRelic = {
 name:string;text:string;passive:true;
 hook:'battle-start'|'turn-start'|'summon'|'unit-action'|'unit-death'|'victory'|'shop';
 effect:'heroGuard'|'healHero'|'draw'|'cinders'|'corpses'|'unitPower'|'unitHp'|'gold'|'discount'|'chill'|'scorch';
 amount:number;cap:number;timing:'battle'|'turn'|'event'|'purchase';oncePerTurn:boolean;
 condition:'always'|'warband'|'empty-warband'|'wounded'|'trained'|'defender'|'scorched'|'chilled';
};
const relic=(name:string,text:string,hook:ExpansionRelic['hook'],effect:ExpansionRelic['effect'],amount:number,timing:ExpansionRelic['timing'],condition:ExpansionRelic['condition']='always',cap=1):ExpansionRelic=>({name,text,passive:true,hook,effect,amount,cap,timing,oncePerTurn:timing==='turn',condition});
/** Caps count activations. Relic effects never dispatch further relic hooks. */
export const expansionRelics = {
 'watchfire-token':relic('Watchfire Token','Battle start: gain 3 Guard.','battle-start','heroGuard',3,'battle'),
 'field-bandage':relic('Field Bandage','Battle start: restore 2 HP.','battle-start','healHero',2,'battle'),
 'scout-folio':relic('Scout Folio','Battle start: draw 1 card.','battle-start','draw',1,'battle'),
 'coal-capsule':relic('Coal Capsule','Battle start: gain 1 Cinder.','battle-start','cinders',1,'battle'),
 'burial-token':relic('Burial Token','Battle start: gain 1 Corpse.','battle-start','corpses',1,'battle'),
 'ember-hourglass':relic('Ember Hourglass','Battle start: apply 1 Scorch to the first living enemy.','battle-start','scorch',1,'battle'),
 'rime-hourglass':relic('Rime Hourglass','Battle start: apply 1 Chill to the first living enemy.','battle-start','chill',1,'battle'),
 'lonely-bastion':relic('Lonely Bastion','Turn start without allies: gain 2 Guard.','turn-start','heroGuard',2,'turn','empty-warband'),
 'warband-pennant':relic('Warband Pennant','Turn start with an ally: gain 1 Guard.','turn-start','heroGuard',1,'turn','warband'),
 'menders-thread':relic('Mender’s Thread','Turn start below half HP: restore 1 HP.','turn-start','healHero',1,'turn','wounded'),
 'first-muster-seal':relic('First Muster Seal','First summon each turn: gain 2 Guard.','summon','heroGuard',2,'turn'),
 'welcoming-cup':relic('Welcoming Cup','First summon each battle: restore 2 hero HP.','summon','healHero',2,'battle'),
 'veterans-knot':relic('Veteran’s Knot','First trained summon each turn gains +1 Power for this battle.','summon','unitPower',1,'turn','trained'),
 'iron-rivet':relic('Iron Rivet','First Defender summoned each turn gains +2 current and maximum HP for this battle.','summon','unitHp',2,'turn','defender'),
 'muster-ledger':relic('Muster Ledger','First summon each battle: draw 1 card.','summon','draw',1,'battle'),
 'cinder-cradle':relic('Cinder Cradle','First summon each battle: gain 1 Cinder.','summon','cinders',1,'battle'),
 'grave-cradle':relic('Grave Cradle','First summon each battle: gain 1 Corpse.','summon','corpses',1,'battle'),
 'command-buckle':relic('Command Buckle','First ally action each turn: gain 1 Guard.','unit-action','heroGuard',1,'turn'),
 'warm-embers':relic('Warm Embers','First ally action each turn while an enemy is Scorched: restore 1 hero HP.','unit-action','healHero',1,'turn','scorched'),
 'rime-needle':relic('Rime Needle','First ally action each turn while an enemy is Chilled: apply 1 Chill to the first living enemy.','unit-action','chill',1,'turn','chilled'),
 'spark-needle':relic('Spark Needle','First trained ally action each turn: apply 1 Scorch to the first living enemy.','unit-action','scorch',1,'turn','trained'),
 'parting-shield':relic('Parting Shield','First ally death each turn: gain 2 Guard.','unit-death','heroGuard',2,'turn'),
 'mourning-cup':relic('Mourning Cup','First ally death each turn: restore 1 hero HP.','unit-death','healHero',1,'turn'),
 'funeral-coal':relic('Funeral Coal','First ally death each turn: gain 1 Cinder.','unit-death','cinders',1,'turn'),
 'grave-tally':relic('Grave Tally','First ally death each turn: gain 1 Corpse.','unit-death','corpses',1,'turn'),
 'victors-purse':relic('Victor’s Purse','After each victory: gain 4 gold.','victory','gold',4,'battle'),
 'homeward-salve':relic('Homeward Salve','After each victory: restore 2 HP.','victory','healHero',2,'battle'),
 'company-paybook':relic('Company Paybook','After a victory with a surviving ally: gain 3 gold.','victory','gold',3,'battle','warband'),
 'merchants-mark':relic('Merchant’s Mark','Shop purchases and services cost 3 less gold, minimum 1.','shop','discount',3,'purchase'),
 'hardship-voucher':relic('Hardship Voucher','Below half HP, shop purchases and services cost 2 less gold, minimum 1.','shop','discount',2,'purchase','wounded'),
} satisfies Record<string,ExpansionRelic>;
export type ExpansionRelicId = keyof typeof expansionRelics;
