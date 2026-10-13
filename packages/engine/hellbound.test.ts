import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newRun,dispatch,playable,save,restore,unitPower,cardEffectText,eligibleCardReward,isArchDemon,type State,type Unit} from './index';
import {starterDecks,modernWarlockDecks,hellboundImplemented,legionSummons,type CardId,type LegionKind} from '../content/index';
function combat(){const s=newRun(177,'hellbound',3,0);s.enemies=[{...s.enemies[0],hp:2000,maxHp:2000,guard:0,moves:[{name:'Strike',damage:0,targeting:'hero'}]}];s.mana=100;s.cinders=20;s.hand=[];s.draw=[];s.discard=[];return s;}
function play(s:State,id:CardId,unit?:number,level=0){s.hand.push({id,uid:s.nextId++,level});s.mana=100;return dispatch(s,{type:'play',uid:s.hand.at(-1)!.uid,unit});}
function recruit(s:State,kind:LegionKind,level=0){return play(s,`summon-${kind}` as CardId,undefined,level);}
test('Hellbound replaces selectable Covenant without removing historical deck reconstruction',()=>{
 assert.equal(starterDecks.filter(d=>d.id==='hellbound').length,1);assert.ok(!starterDecks.some(d=>d.id==='pact'));
 assert.equal(newRun(1,'hellbound').deck.length,10);assert.ok(newRun(1,'pact',3,0).deck.includes('summon-nightmaw'));
 assert.deepEqual(newRun(1,'pact',3,0).deck,modernWarlockDecks.find(d=>d.id==='pact')!.cards);
});
test('all five recruits have distinct exact stat blocks and scaled summon descriptions',()=>{
 for(const [kind,stats]of Object.entries(legionSummons))for(const level of [0,1,3]){
  const s=recruit(combat(),kind as LegionKind,level),u=s.units[0];assert.equal(u.hp,Math.round(stats.hp*1.2**level));assert.equal(u.power,Math.round(stats.power*1.2**level));assert.equal(isArchDemon(u.kind),false);assert.match(cardEffectText(`summon-${kind}` as CardId,level),new RegExp(`${u.hp} HP, ${u.power} Power`));
 }
});
test('pair recruitment requires two slots and rejects atomically at four or five soldiers',()=>{
 for(const id of ['muster-legion','pike-detail']as const){let s=play(combat(),id);assert.equal(s.units.length,2);s=play(s,id);assert.equal(s.units.length,4);s.hand=[{id,uid:999}];const before=structuredClone(s);assert.equal(playable(s,s.hand[0]),false);assert.throws(()=>dispatch(s,{type:'play',uid:999,dismiss:s.units[0].id}));assert.deepEqual(s,before);}
});
test('promotion is uncapped, heals its HP increment, and increases intrinsic offense and defense',()=>{
 let s=recruit(combat(),'iron-legionary');s.units[0].hp=5;for(let i=0;i<12;i++)s=play(s,'field-promotion',s.units[0].id);
 assert.deepEqual([s.units[0].promotionRank,s.units[0].power,s.units[0].maxHp,s.units[0].hp,s.units[0].armor],[12,28,42,29,12]);
 s=play(s,'battlefield-commission',s.units[0].id);assert.deepEqual([s.units[0].promotionRank,s.units[0].hp],[14,39]);
});
test('ordinary demons cannot receive soldier promotions and rejection spends nothing',()=>{
 let s=play(combat(),'summon-imp');s.hand=[{id:'field-promotion',uid:999}];const before=structuredClone(s);assert.equal(playable(s,s.hand[0]),false);assert.throws(()=>dispatch(s,{type:'play',uid:999,unit:s.units[0].id}));assert.deepEqual(s,before);
});
test('support utility upgrades match their live healing Guard draw and Cinder amounts',()=>{
 for(const level of [0,1,3]){const v=(n:number)=>level?Math.max(n+level,Math.round(n*1.2**level)):n;
  let s=play(combat(),'muster-legion');s.units.forEach(u=>u.hp=1);s=play(s,'rally-legion',undefined,level);assert.ok(s.units.every(u=>u.hp===Math.min(u.maxHp,1+v(5))&&u.guard===v(5)));assert.match(cardEffectText('rally-legion',level),new RegExp(`Heal all soldiers ${v(5)}`));
  s=play(s,'hold-the-line',undefined,level);assert.equal(s.guard,v(8));assert.ok(s.units.every(u=>u.guard===2*v(5)));
  s.draw=Array.from({length:20},(_,i)=>({id:'firebolt' as const,uid:5000+i}));s.discard=[];s.hand=[];s.cinders=0;s=play(s,'infernal-logistics',undefined,level);assert.equal(s.hand.length,v(2));assert.equal(s.cinders,v(2));
 }
});
test('three occupied slots permit a complete pair; five slots reject another without dismissal',()=>{
 let s=recruit(recruit(recruit(combat(),'maledictor'),'maledictor'),'maledictor');s=play(s,'muster-legion');assert.equal(s.units.length,5);assert.equal(s.units.filter(u=>u.kind==='maledictor').length,3);s.hand=[{id:'muster-legion',uid:999}];assert.equal(playable(s,s.hand[0]),false);assert.throws(()=>dispatch(s,{type:'play',uid:999}));
});
test('Gorthak does not convert soldiers and paired Legionaries take precedence over a Defender',()=>{
 let s=play(combat(),'summon-gorthak');s=play(s,'muster-legion');assert.equal(s.units.filter(u=>u.kind==='iron-legionary').length,2);s=recruit(s,'ironhorn-bulwark');s.enemies[0].moves=[{name:'Hero spell',damage:8,targeting:'hero'}];const n=dispatch(s,{type:'end'});assert.equal(n.hp,s.hp);assert.equal(n.units.find(u=>u.kind==='ironhorn-bulwark')!.hp,28);assert.deepEqual(n.units.filter(u=>u.kind==='iron-legionary').map(u=>u.hp),[14,14]);
});
test('paired bodyguards split hostile damage before hero Guard; armor and guard mitigate their shares',()=>{
 let s=play(combat(),'muster-legion');s=play(s,'field-promotion',s.units[0].id);s.guard=30;s.units[0].guard=2;s.enemies[0].moves=[{name:'Piercing spell',damage:11,targeting:'ignore_defender'}];const n=dispatch(s,{type:'end'}),impact=n.events.find(e=>e.type==='enemy-impact')!;
 assert.equal(n.hp,s.hp);assert.equal(impact.view!.guard,30);assert.deepEqual(impact.view!.units.map(u=>u.hp),[17,13]);assert.equal(n.events.filter(e=>e.type==='bodyguard').length,1);
});
test('bodyguards absorb lethal overflow and cannot intercept another attack once one has died',()=>{
 let s=play(combat(),'muster-legion');s.units[0].hp=1;s.units[1].hp=20;s.enemies[0].moves=[{name:'Crush',damage:40,targeting:'ignore_defender'}];const n=dispatch(s,{type:'end'});assert.equal(n.hp,s.hp);assert.equal(n.units.length,0);assert.equal(n.events.filter(e=>e.type==='unit-death').length,2);
});
test('bodyguard sweep allocation includes their own hits and does not redirect voluntary pact HP costs',()=>{
 let s=play(combat(),'muster-legion');s.enemies[0].moves=[{name:'Sweep',damage:4,targeting:'sweep'}];let n=dispatch(s,{type:'end'});assert.equal(n.hp,s.hp);assert.deepEqual(n.units.map(u=>u.hp),[12,12]);n=play(n,'blood-pact');assert.equal(n.hp,s.hp-3);
});
test('Pikemen reward duplicates and Bulwarks guard the entire Legion each turn',()=>{
 let s=play(combat(),'pike-detail');assert.equal(unitPower(s,s.units[0]),7);s=recruit(s,'ironhorn-bulwark');s=dispatch(s,{type:'end'});assert.ok(s.units.every(u=>u.guard===3));
});
test('three duplicate Maledictors trigger one Hellgate per turn and Rite cannot double-trigger',()=>{
 let s=combat();for(let i=0;i<3;i++)s=recruit(s,'maledictor');const hp=s.enemies[0].hp;s=play(s,'hellgate-rite');assert.equal(s.enemies[0].hp,hp-6);assert.equal(s.enemies[0].scorch,2);assert.ok(s.units.every(u=>u.promotionRank===1));s.hand=[{id:'hellgate-rite',uid:999}];assert.equal(playable(s,s.hand[0]),false);assert.throws(()=>dispatch(s,{type:'play',uid:999}));s=dispatch(s,{type:'end'});assert.equal(s.events.filter(e=>e.type==='hellgate').length,0);s=dispatch(s,{type:'end'});assert.equal(s.events.filter(e=>e.type==='hellgate').length,1);assert.ok(s.units.every(u=>u.promotionRank===2));
});
test('Hellgate requires three living ritualists and cannot be repeated by duplicate commands',()=>{
 let s=recruit(recruit(combat(),'maledictor'),'maledictor');s.hand=[{id:'hellgate-rite',uid:999}];assert.equal(playable(s,s.hand[0]),false);s=dispatch(s,{type:'end'});assert.ok(!s.events.some(e=>e.type==='hellgate'));
});
test('Vanguard cleaves and receives only one kill promotion per turn; veteran commands reward ranks',()=>{
 let s=recruit(combat(),'dread-vanguard');s.enemies=[{...s.enemies[0],hp:5},{...s.enemies[0],id:987,hp:5},{...s.enemies[0],id:988,hp:200}];s=play(s,'veteran-command',s.units[0].id);assert.equal(s.units[0].promotionRank,1);assert.equal(s.events.filter(e=>e.type==='muster').length,1);s=play(s,'veteran-command',s.units[0].id);assert.equal(s.events.filter(e=>e.type==='muster').length,2);assert.equal(s.units[0].promotionRank,1);
});
test('wounded veterans survive victory and retain only intrinsic ranks between battles',()=>{
 let s=recruit(combat(),'iron-legionary');s=play(s,'field-promotion',s.units[0].id);s.units[0].hp=7;s.units[0].power+=20;s.units[0].guard=30;const uid=s.units[0].id;s.enemies[0].hp=1;s=play(s,'firebolt');assert.equal(s.phase,'reward');s=dispatch(s,{type:'reward',card:null});s=dispatch(s,{type:'continue'});assert.equal(s.phase,'combat');assert.equal(s.units[0].id,uid);assert.deepEqual([s.units[0].hp,s.units[0].power,s.units[0].maxHp,s.units[0].armor,s.units[0].promotionRank],[7,6,20,1,1]);assert.equal(s.units[0].guard,0);
});
test('only Hellbound acquisition includes new cards, keeping older run reward pools intact',()=>{
 for(const id of hellboundImplemented){assert.ok(eligibleCardReward(newRun(1,'hellbound',3,0,2,2),id));assert.equal(eligibleCardReward(newRun(1,'pact',3,0),id),false);assert.equal(eligibleCardReward(newRun(1,'gravehost'),id),false);}
});
test('legal Hellbound action histories replay deterministically with ranked soldiers',()=>{
 let s=newRun(121,'hellbound');for(let turn=0;turn<4&&s.phase==='combat';turn++){for(let tries=0;tries<15;tries++){const c=s.hand.find(c=>playable(s,c)&&(!['field-promotion','battlefield-commission','veteran-command'].includes(c.id)||s.units.length));if(!c)break;try{s=dispatch(s,{type:'play',uid:c.uid,...(s.units.length?{unit:s.units[0].id}:{})});}catch{break;}}if(s.phase==='combat')s=dispatch(s,{type:'end'});}assert.deepEqual(restore(save(s)),s);
});
