import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root=process.cwd();
const archCards=['summon-ignivar','summon-cerberax','summon-nightmaw','summon-hollow-saint','summon-pyre-colossus','summon-gorthak'];
const forestAssets=['background-1','background-2','background-3','shop-frame','shopkeeper-1','shopkeeper-1-talk','shopkeeper-1-satisfied','shopkeeper-2','shopkeeper-2-talk','shopkeeper-2-satisfied','shopkeeper-3','shopkeeper-3-talk','shopkeeper-3-satisfied'];

test('release demo retains every archdemon card and runtime image',()=>{
  const manifest=JSON.parse(readFileSync(path.join(root,'apps/web/public/game-assets/manifest.json'),'utf8'));
  for(const card of archCards) {
    assert.ok(manifest.cards[card],`missing ${card} card entry`);
    assert.ok(manifest.images[card],`missing ${card} summon image entry`);
    assert.ok(existsSync(path.join(root,'apps/web/public',manifest.cards[card])),`missing ${card} card file`);
    assert.ok(existsSync(path.join(root,'apps/web/public',manifest.images[card])),`missing ${card} image file`);
  }
  assert.ok(manifest.cards['empower-demon'],'missing Empower Demon runtime card');
});

test('release demo ships all 13 forest shop presentation assets',()=>{
  for(const asset of forestAssets) assert.ok(existsSync(path.join(root,'apps/web/public/forest-shop-assets',`${asset}.webp`)),`missing forest shop asset ${asset}`);
  const shop=readFileSync(path.join(root,'apps/web/src/ForestShop.tsx'),'utf8');
  for(const asset of ['background-${shopNumber}','shop-frame','shopkeeper-${shopNumber}']) assert.match(shop,new RegExp(asset.replace(/[${}]/g,'\\$&')));
});
