import test from "node:test";
import assert from "node:assert/strict";
import { cardArtwork } from "./cardPresentation";
import type { Assets } from "./assets";
const assets = { cards: {"summon-frost-thrall":"thrall-v2.webp",firebolt:"firebolt.webp"}, legacyRunebladeCards: {"summon-frost-thrall":"thrall-v1.webp"} } as unknown as Assets;
test("saved legacy runs use their printed rules; new runs default to revised faces", () => {
 assert.equal(cardArtwork(assets,"summon-frost-thrall",1),"thrall-v1.webp");
 assert.equal(cardArtwork(assets,"summon-frost-thrall",2),"thrall-v2.webp");
 assert.equal(cardArtwork(assets,"summon-frost-thrall"),"thrall-v2.webp");
 assert.equal(cardArtwork(assets,"firebolt",1),"firebolt.webp");
});


test("legacy demon runs retain their original Pit Brute printed face", () => {
 const demonAssets = {cards:{"summon-pit-brute":"brute-cleave.webp"},legacyWarlockCards:{"summon-pit-brute":"brute-single.webp"}} as unknown as Assets;
 assert.equal(cardArtwork(demonAssets,"summon-pit-brute",2,false),"brute-single.webp");
 assert.equal(cardArtwork(demonAssets,"summon-pit-brute",2,true),"brute-cleave.webp");
});


test("legacy and current summon details match their saved combat rules", async () => {
 const {newRun,usesSummonRules,cardEffectText}=await import("../../../packages/engine/index");
 const {summonDescription}=await import("./summonDetails");
 const legacy=newRun(42,"warband",3),current=newRun(42,"warband",3,0);
 const unit={id:1,kind:"pit-brute",name:"Pit Brute",power:10,hp:14,maxHp:14,guard:0,upkeep:1,defender:true} as import("../../../packages/engine/index").Unit;
 assert.match(cardEffectText("summon-pit-brute",0,1,usesSummonRules(legacy)),/10 damage/);
 assert.doesNotMatch(cardEffectText("summon-pit-brute",0,1,usesSummonRules(legacy)),/all enemies/i);
 assert.match(cardEffectText("summon-pit-brute",0,2,usesSummonRules(current)),/7 damage.*all enemies/i);
 assert.doesNotMatch(summonDescription(unit,legacy),/Cleave/);
 assert.match(summonDescription({...unit,power:7},current),/Cleave/);
});
