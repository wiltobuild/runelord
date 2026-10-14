// Preserve this pre-expansion regression suite; expansion behavior has dedicated coverage.
const newRoguelikeRun=(...args:Parameters<typeof currentRoguelikeRun>)=>{args[7]??=1;return currentRoguelikeRun(...args);};
import test from 'node:test';
import assert from 'node:assert/strict';
import {newRoguelikeRun as currentRoguelikeRun,dispatch,cardEffectText,upgradePreview} from './index';
test('Pit Brute card descriptions preserve current cleave and legacy replay stats at every tested level',()=>{for(const modern of [false,true])for(const level of [0,1,3]){const s=newRoguelikeRun(42,'warband',0,modern?0:undefined);s.summonRulesFrom=modern?0:undefined;s.hand=[{id:'summon-pit-brute',uid:999,level}];s.mana=30;s.cinders=30;s.enemies.forEach(e=>e.hp=e.maxHp=500);const a=dispatch(s,{type:'play',uid:999}),u=a.units[0],text=cardEffectText('summon-pit-brute',level,1,modern);assert.match(text,new RegExp(`${u.power} damage`));assert.match(text,new RegExp(`${u.maxHp} HP`));assert.equal(text.includes('Cleave'),modern);s.deck=['summon-pit-brute'];s.deckLevels=[level];assert.equal(upgradePreview(s,0).text,text);}});
