import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {FOREST_ENEMY_IDS} from '../../../../../packages/engine/forest';
import {natureWardTarget,natureWardTargetForImage,NATURE_WARD_ACTORS} from '../../../../../apps/web/src/natureWardGeometry';
const near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<.00001,`${a} != ${b}`);
const mushroom=natureWardTarget('pleatcap-matriarch',{x:791,y:250,width:217,height:224});
for(const [k,v] of Object.entries({x:903,y:365,width:78.375,height:147.8125}))near(mushroom[k as keyof typeof mushroom],v);
const crab=natureWardTarget('cairnback-hermit',{x:400,y:253,width:224,height:224});assert.ok(crab.width<80&&crab.height<125);assert.ok(crab.x>510&&crab.x<520&&crab.y>395&&crab.y<406);
for(const id of FOREST_ENEMY_IDS){assert.ok(NATURE_WARD_ACTORS[id]);const a=natureWardTargetForImage(id,{left:130,top:240,width:220,height:260},{left:30,top:40,width:1280,height:600},1);const b=natureWardTargetForImage(id,{left:97.5,top:180,width:165,height:195},{left:22.5,top:30,width:960,height:450},.75);for(const k of ['x','y','width','height'] as const)near(a[k],b[k]);assert.ok(a.width>0&&a.height>0);}
writeFileSync('work/production/nature-shield-fit/qa/geometry.json',JSON.stringify({status:'pass',allForestActors:FOREST_ENEMY_IDS.length,zoomInvariant:true,crab,mushroom,mushroomMatchesOriginal:true},null,2));console.log('Independent geometry passed');
