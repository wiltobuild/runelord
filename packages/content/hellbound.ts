/** Each soldier banks its own earned ranks for its next summoning; bodies never travel between battles. */
export const legionSummons = {
  'iron-legionary': {name:'Iron Legionary', hp:18, power:4, upkeep:0, defender:false},
  'ash-pikeman': {name:'Ash Pikeman', hp:12, power:5, upkeep:0, defender:false},
  'ironhorn-bulwark': {name:'Ironhorn Bulwark', hp:28, power:2, upkeep:0, defender:true},
  maledictor: {name:'Maledictor', hp:14, power:3, upkeep:0, defender:false},
  'dread-vanguard': {name:'Dread Vanguard', hp:24, power:7, upkeep:0, defender:false},
} as const;
export type LegionKind = keyof typeof legionSummons;
export const isLegionKind = (kind:string):kind is LegionKind => Object.hasOwn(legionSummons,kind);
export const legionRoles:Record<LegionKind,string> = {
 'iron-legionary':'With 2+ Legionaries, split all hostile damage intended for the Warlock between them, before his Guard.',
 'ash-pikeman':'+2 attack damage for each other Ash Pikeman.',
 'ironhorn-bulwark':'Defender. At turn start, give all soldiers 3 Guard.',
 maledictor:'Attacks apply 2 Scorch. With 3 Maledictors, open a Hellgate at turn end: 6 damage and 2 Scorch to all enemies; promote all soldiers. Once per turn.',
 'dread-vanguard':'Cleave all enemies. Its first kill each turn promotes it.',
};
export const hellboundDefinitions = [
 ['summon-iron-legionary','Iron Legionary',2,'Summon','Common'],
 ['summon-ash-pikeman','Ash Pikeman',1,'Summon','Common'],
 ['summon-ironhorn-bulwark','Ironhorn Bulwark',2,'Summon','Uncommon'],
 ['summon-maledictor','Maledictor',2,'Summon','Uncommon'],
 ['summon-dread-vanguard','Dread Vanguard',3,'Summon','Rare'],
 ['muster-legion','Muster the Legion',3,'Summon','Common'],
 ['pike-detail','Pike Detail',2,'Summon','Common'],
 ['field-promotion','Field Promotion',1,'Skill','Common'],
 ['blood-ascension','Blood Ascension',2,'Skill','Uncommon'],
 ['battlefield-commission','Battlefield Commission',2,'Skill','Uncommon'],
 ['rally-legion','Rally the Legion',1,'Skill','Common'],
 ['infernal-logistics','Infernal Logistics',1,'Skill','Common'],
 ['hold-the-line','Hold the Line',1,'Skill','Uncommon'],
 ['hellgate-rite','Hellgate Rite',2,'Skill','Rare'],
 ['veteran-command',"Veteran's Command",2,'Skill','Uncommon'],
] as const;
export type HellboundCardId = typeof hellboundDefinitions[number][0];
export const hellboundImplemented = hellboundDefinitions.map(row=>row[0]);
export const legionTargetCards:readonly string[] = ['field-promotion','battlefield-commission','veteran-command','blood-ascension'];
export const hellboundStarter:HellboundCardId[] = ['summon-iron-legionary','summon-ash-pikeman','summon-maledictor','muster-legion','pike-detail','field-promotion','blood-ascension','rally-legion','hold-the-line','infernal-logistics'];
export function hellboundEffectText(id:string,level=0):string|undefined {
 const v=(n:number)=>level?Math.max(n+level,Math.round(n*1.2**level)):n;
 const stats=(kind:LegionKind)=>`${Math.round(legionSummons[kind].hp*1.2**level)} HP, ${Math.round(legionSummons[kind].power*1.2**level)} Power`;
 const kind=id.slice(7);
 if(id.startsWith('summon-')&&isLegionKind(kind))return `Summon ${/^[aeiou]/i.test(legionSummons[kind].name)?'an':'a'} ${legionSummons[kind].name} (${stats(kind)}). ${legionRoles[kind]} Earned ranks return when summoned again.`;
 const texts:Record<string,string>={
  'muster-legion':`Summon 2 Iron Legionaries (${stats('iron-legionary')} each). Requires 2 empty Warband slots. Earned ranks return when summoned again.`,
  'pike-detail':`Summon 2 Ash Pikemen (${stats('ash-pikeman')} each). Requires 2 empty Warband slots. Earned ranks return when summoned again.`,
  'field-promotion':'Promote a soldier: permanently gain +2 Power, +2 maximum HP, heal 2 HP, and +1 Armor. Earned ranks are saved for the next summon.',
  'blood-ascension':'Choose a soldier and sacrifice another summon. Promote the soldier 3 times.',
  'battlefield-commission':`Promote a soldier twice. Heal it ${v(6)} HP.`,
  'rally-legion':`Heal all soldiers ${v(5)} HP and give them ${v(5)} Guard.`,
  'infernal-logistics':`Draw ${v(2)} cards. If you control 2 or more soldiers, gain ${v(2)} Cinders.`,
  'hold-the-line':`Gain ${v(8)} Guard. All soldiers gain ${v(5)} Guard.`,
  'hellgate-rite':`Requires 3 Maledictors. Open the Hellgate now, then draw ${v(2)} cards. Only one Hellgate per turn.`,
  'veteran-command':'A soldier attacks. If it has been promoted, it attacks again.',
 };
 return texts[id];
}
