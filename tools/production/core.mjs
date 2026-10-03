import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const stages = ['design', 'art', 'approval', 'animation', 'gameplay', 'integration', 'qa'];
export const hashFile = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
export const readJson = p => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
export const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const text = s => typeof s === 'string' && s.trim().length > 0;
const positive = n => Number.isFinite(n) && n > 0;
export function inside(root, relative) {
  if (!text(relative) || path.isAbsolute(relative) || /^[A-Za-z]:/.test(relative)) throw Error('Expected repository-relative path');
  const p = path.resolve(root, relative), rel = path.relative(path.resolve(root), p);
  if (rel === '..' || rel.startsWith('..' + path.sep)) throw Error(`Path escapes repository: ${relative}`);
  return p;
}
export function checkRefs(refs, root, label = 'inputs') {
  const errors = [];
  if (!Array.isArray(refs)) return [`${label} must be an array`];
  for (const [i, r] of refs.entries()) {
    try {
      if (!r || !/^[a-f0-9]{64}$/.test(r.sha256)) throw Error('SHA-256 required');
      const p = inside(root, r.path);
      if (hashFile(p) !== r.sha256) throw Error(`stale hash: ${r.path}`);
    } catch (e) { errors.push(`${label}[${i}]: ${e.message}`); }
  }
  return errors;
}

export function validatePacket(p, root) {
  const errors = [];
  if (p.schema !== 1) errors.push('schema must be 1');
  for (const k of ['id', 'outcome', 'authorization', 'owner', 'integrationOwner', 'reviewer']) if (!text(p[k])) errors.push(`${k} required`);
  if (!['draft', 'ready', 'active', 'review', 'complete', 'blocked'].includes(p.status)) errors.push('invalid packet status');
  for (const k of ['contentIds', 'ownedPaths', 'dependencies', 'exclusions']) if (!Array.isArray(p[k])) errors.push(`${k} must be an array`);
  for (const q of p.ownedPaths || []) { try { inside(root, q); } catch(e) { errors.push(e.message); } }
  errors.push(...checkRefs(p.inputs, root));
  if (!Array.isArray(p.acceptance)) errors.push('acceptance must be an array');
  for (const [i, a] of (p.acceptance || []).entries()) {
    if (!text(a.check) || !['pending', 'pass', 'fail', 'not-applicable'].includes(a.status)) errors.push(`acceptance[${i}] requires check and valid status`);
    if (a.status === 'pass') {
      if (!a.evidence?.length) errors.push(`acceptance[${i}] pass requires retained evidence`);
      errors.push(...checkRefs(a.evidence, root, `acceptance[${i}].evidence`));
    }
    if (a.status === 'not-applicable' && !text(a.reason)) errors.push(`acceptance[${i}] needs reason`);
  }
  const cp = p.checkpoint;
  if (!cp || !['completed', 'remaining', 'blockers'].every(k => Array.isArray(cp[k])) || !text(cp.nextAction)) errors.push('checkpoint requires completed/remaining/blockers arrays and nextAction');
  if (p.status !== 'draft') {
    if (!p.inputs?.length || !p.acceptance?.length || !p.ownedPaths?.length) errors.push('non-draft packet requires inputs, ownedPaths and acceptance checks');
    if (p.owner === p.reviewer || p.integrationOwner === p.reviewer) errors.push('builder, integration author and reviewer must preserve review independence');
  }
  if (p.status === 'complete') {
    if (p.acceptance?.some(a => !['pass', 'not-applicable'].includes(a.status))) errors.push('complete packet has unfinished acceptance');
    if (!p.acceptance?.some(a => a.status === 'pass')) errors.push('complete packet needs an observed pass');
    if (cp?.remaining?.length || cp?.blockers?.length) errors.push('complete packet has remaining work or blockers');
  }
  if (p.animation !== null && p.animation !== undefined) {
    if (!['whole-character-frames', 'articulated-rig'].includes(p.animation.method) || !p.animation.requiredStates?.length) errors.push('animation requires method and requiredStates');
  }
  return errors;
}

export function validateRecord(r, root) {
  const errors = [];
  if (r.schema !== 1 || !text(r.contentId)) errors.push('schema 1 and contentId required');
  errors.push(...checkRefs(r.inputs, root));
  for (const k of stages) {
    const s = r.stages?.[k];
    if (!s || !['unknown', 'pending', 'blocked', 'stale', 'complete', 'not-applicable'].includes(s.status)) { errors.push(`${k}: invalid or absent stage`); continue; }
    errors.push(...checkRefs(s.evidence, root, `${k}.evidence`));
    if (s.status === 'complete' && (!r.inputs?.length || !s.evidence?.length)) errors.push(`${k}: complete needs inputs and evidence`);
    if (s.status === 'not-applicable' && !text(s.reason)) errors.push(`${k}: not-applicable needs reason`);
    if (k === 'approval' && s.status === 'complete') {
      if (!s.asset) errors.push('approval: complete needs asset path');
      else try {
        const h = hashFile(inside(root, s.asset));
        const ledger = readJson(path.join(root, 'assets/approvals/decisions.json'));
        if (ledger.decisions?.[h]?.status !== 'Approved') errors.push('approval: current exact bytes are not Approved');
      } catch(e) { errors.push(`approval: ${e.message}`); }
    }
  }
  return errors;
}

export function parseCatalog(source, file) {
  const rows = [], errors = []; let headers = null, section = '';
  const names = ['card', 'curse', 'status', 'token', 'quest', 'unit', 'demon', 'arch-form', 'construct', 'companion', 'beast', 'potion', 'runestone', 'name'];
  const lines = source.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#')) section = line.replace(/^#+\s*/, '');
    if (!line.startsWith('|')) { headers = null; continue; }
    const cells = line.slice(1, line.endsWith('|') ? -1 : undefined).split(/(?<!\\)\|/).map(c => c.trim().replace(/\*\*/g, '').replace(/\\\|/g, '|'));
    if (cells.every(c => /^:?-+:?$/.test(c))) continue;
    const lower = cells.map(c => c.toLowerCase());
    if (lower.some(c => names.includes(c))) { headers = lower; continue; }
    if (!headers) continue;
    const ni = headers.findIndex(c => names.includes(c));
    if (ni < 0 || !cells[ni]) continue;
    if (cells.length !== headers.length) { errors.push(`${file}:${i+1}: unsupported table width`); continue; }
    const name = cells[ni];
    rows.push({catalogKey: `${path.basename(file, '.md')}:${slug(name)}`, name, source: file, line: i+1, section, fields: Object.fromEntries(headers.map((h,j) => [h,cells[j]]))});
  }
  const counts = new Map();
  for (const r of rows) counts.set(r.catalogKey, (counts.get(r.catalogKey) || 0)+1);
  for (const [key,count] of counts) if(count > 1) errors.push(`ambiguous catalog key ${key} (${count} rows); explicit mapping required`);
  return {rows, errors};
}

export function validateEncounter(e) {
  const errors = [], targets = ['hero','front','random_ally','sweep','weakest','ignore_defender'];
  if (!text(e.id) || !['normal','elite','boss','minion'].includes(e.tier) || !positive(e.hp)) errors.push('id, valid tier and positive hp required');
  if (!['cycle','weighted','scripted'].includes(e.ai?.type)) errors.push('ai.type must be cycle, weighted or scripted');
  if (!Array.isArray(e.moves) || !e.moves.length) errors.push('moves required');
  const ids = new Set();
  for (const [i,m] of (e.moves || []).entries()) {
    if (!text(m.id) || ids.has(m.id)) errors.push(`move ${i}: unique ID required`); ids.add(m.id);
    if (!text(m.telegraph)) errors.push(`move ${i}: telegraph required`);
    if (!['attack','effect'].includes(m.kind)) errors.push(`move ${i}: kind attack/effect required`);
    if(m.kind === 'attack' && (!Number.isFinite(m.damage) || m.damage < 0 || !targets.includes(m.targeting))) errors.push(`move ${i}: nonnegative damage and explicit targeting required`);
    if(m.kind === 'effect' && !text(m.effect)) errors.push(`move ${i}: effect description required`);
    if(e.ai?.type === 'weighted' && !positive(m.weight)) errors.push(`move ${i}: positive weight required`);
  }
  if(e.ai?.type === 'scripted' && !text(e.ai.script)) errors.push('scripted AI requires script description');
  if(e.tier === 'boss' && !e.moves?.some(m => m.kind === 'attack' && m.targeting === 'sweep')) errors.push('boss needs sweep attack');
  if(typeof e.corpse?.raisable !== 'boolean' || typeof e.tame?.tameable !== 'boolean') errors.push('explicit corpse.raisable and tame.tameable required');
  if(e.corpse?.raisable && (!ids.has(e.corpse.thrall_move) || !positive(e.corpse.thrall_hp_pct) || e.corpse.thrall_hp_pct > 1)) errors.push('raisable corpse needs valid move and HP fraction');
  if(e.tame?.tameable && (e.tier !== 'normal' || !ids.has(e.tame.instinct_move) || !text(e.tame.bond_perk) || !positive(e.tame.companion_hp_pct) || e.tame.companion_hp_pct > 1)) errors.push('tameable needs normal tier, move, HP fraction and bond perk');
  if(!Array.isArray(e.animations) || !['idle','attack','hit','die'].every(a => e.animations.includes(a))) errors.push('required animation mappings missing');
  return errors;
}

export function validateAnimation(m, directory) {
  const errors = [];
  const variants = m.variants ? Object.entries(m.variants) : [['base', m]];
  if (!variants.length) errors.push('at least one animation variant required');
  for (const [variant, v] of variants) {
    if (!Array.isArray(v.frames) || !v.frames.length || !(v.states || v.animations) || !Object.keys(v.states || v.animations).length) { errors.push(`${variant}: expected nonempty frames and states/animations`); continue; }
    for (const [i,f] of v.frames.entries()) {
      try { if (!fs.statSync(inside(directory, f.file)).isFile()) throw Error('not a file'); }
      catch(e) { errors.push(`${variant} frame ${i}: ${e.message}`); }
    }
    for (const [name, c] of Object.entries(v.states || v.animations)) {
      const times = c.durations_ms || c.duration_ms || c.durations;
      if (!Array.isArray(c.frames) || !c.frames.length || !Array.isArray(times) || times.length !== c.frames.length || times.some(t => !positive(t))) { errors.push(`${variant}/${name}: invalid frame durations`); continue; }
      if(c.frames.some(i => !Number.isInteger(i) || i < 0 || i >= v.frames.length)) errors.push(`${variant}/${name}: out-of-bounds frame index`);
      if(typeof c.loop !== 'boolean') errors.push(`${variant}/${name}: loop flag required`);
      if(['die','death'].includes(name) && c.loop) errors.push(`${variant}/${name}: death must not loop`);
      const duration = times.reduce((a,b) => a+b,0);
      const events = [...(c.events || []), ...(c.event?.impact_ms != null ? [{time_ms:c.event.impact_ms}] : [])];
      for(const event of events) if(!Number.isFinite(event.time_ms) || event.time_ms < 0 || event.time_ms >= duration) errors.push(`${variant}/${name}: event outside clip`);
    }
    const size = v.frame_canvas || v.frame_size || m.frame_canvas || m.frame_size;
    const anchor = v.anchor || v.ground_anchor || m.anchor || m.ground_anchor;
    if(!Array.isArray(size) || size.length !== 2 || size.some(n => !positive(n))) errors.push(`${variant}: invalid frame dimensions`);
    if(!Array.isArray(anchor) || anchor.length !== 2 || anchor.some((n,i) => !Number.isFinite(n) || n < 0 || n > size?.[i])) errors.push(`${variant}: invalid anchor`);
  }
  return errors;
}

export function validateAudio(tracks) {
  if(!Array.isArray(tracks) || !tracks.length) return ['expected nonempty loop manifest array'];
  const errors = [], ids = new Set();
  for (const t of tracks) {
    if(!text(t.slug) || ids.has(t.slug)) errors.push('unique track slug required'); ids.add(t.slug);
    const start=t.loop_start_sample, end=t.loop_end_sample_exclusive, rate=t.sample_rate;
    if(!positive(rate) || !Number.isInteger(rate) || !Number.isInteger(start) || start<0 || !Number.isInteger(end) || end<=start || !positive(t.duration_seconds)) errors.push(`${t.slug}: invalid sample metadata`);
    else if(end > Math.round(t.duration_seconds*rate)+1) errors.push(`${t.slug}: loop extends beyond declared audio duration`);
  }
  return errors;
}
