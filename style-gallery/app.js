const $=id=>document.getElementById(id);
const groups=['Browse','Needs review','Approval inbox','Heroes','Characters','Cards','Card artwork','Environments','Objects','Animations','Review sheets','Other art','All art'];
let assets=[],category='Browse',fingerprint='',limit=60,token='',selected=null,refreshing=false;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const media=(a,lazy=true)=>a.video?`<video src="${a.url}" muted controls preload="metadata"></video>`:`<img src="${a.url}?v=${a.modified}" alt="${esc(a.name)}" ${lazy?'loading="lazy"':''}>`;
function options(id,key,label){const old=$(id).value;$(id).innerHTML=`<option value="">${label}</option>`+[...new Set(assets.filter(a=>belongs(a,category)).flatMap(members).map(a=>a[key]))].sort().map(v=>`<option>${esc(v)}</option>`).join('');$(id).value=[...$(id).options].some(o=>o.value===old)?old:''}
function detail(a){
 $('detail').innerHTML=`<div>${reviewSelector(a)}${media(a,false)}</div><div><div class="eyebrow">${esc(a.group)}</div><h2 id="detail-title">${esc(a.name)}</h2><p>${esc(a.subject)}</p><span class="badge ${a.status==='Approved'?'Approved':''}">${esc(a.status)}</span><p>${esc(a.notes)}</p><div class="decision-panel"><label for="decision-note">Review note <span class="meta">(optional)</span></label><textarea id="decision-note" rows="3" maxlength="2000" placeholder="What works, or what needs to change…">${esc(a.decision?.note||'')}</textarea><div class="decision-actions"><button class="action approve" data-decision="Approved" ${a.status==='Approved'?'disabled':''}>${a.status==='Approved'?'Approved ✓':'Approve design'}</button><button class="action" data-decision="Needs revision">Request changes</button><button class="action" data-decision="Pending approval">Reset to pending</button></div><p id="decision-message" role="status" class="meta">${a.decision?`Saved ${new Date(a.decision.at).toLocaleString()}. Codex reads this decision from the project.`:'Your decision is saved with this exact artwork revision for Codex.'}</p></div><p class="meta">${esc(a.source)}<br>${esc(a.path)}</p><p class="meta">${(a.bytes/1048576).toFixed(2)} MB · Updated ${new Date(a.modified).toLocaleString()}</p>${a.copies.length?`<details class="meta"><summary>${a.copies.length} other source locations</summary>${a.copies.map(esc).join('<br>')}</details>`:''}<p><a href="${a.url}" target="_blank" rel="noopener">Open original artwork ↗</a></p></div>`;
}
let selectedParent=null,showRequest=0;
async function show(id,parentId){
 const parent=assets.find(a=>a.id===(parentId||id))||assets.find(a=>members(a).some(m=>m.id===id));if(!parent)return;
 const request=++showRequest;
 try{const r=await fetch('/api/item/'+id);if(!r.ok)throw Error();const a=await r.json();if(request!==showRequest)return;
 stopPlayback();selectedParent=parent.id;selected=a;detail(selected);updateNavigation();if(!$('viewer').open)$('viewer').showModal();
 }catch{$('error').textContent='Could not open this artwork. Refresh and try again.'}
}
async function decide(status){
 if(!selected)return;const buttons=[...$('detail').querySelectorAll('[data-decision]')];buttons.forEach(b=>b.disabled=true);$('decision-message').textContent='Saving your decision…';
 try{const r=await fetch('/api/decision',{method:'POST',headers:{'Content-Type':'application/json','X-Gallery-Token':token},body:JSON.stringify({id:selected.id,sha256:selected.sha256,status,note:$('decision-note').value})});const data=await r.json();if(!r.ok)throw Error(data.error||'Could not save the decision');
  // Update immediately from the successful durable write, then reconcile the library.
  selected={...selected,status,decision:data.decision};for(const a of assets){for(const m of members(a))if(m.id===selected.id)m.status=status;if(a.id===selected.id){a.status=status;a.decision=data.decision}if(a.states)a.needsReview=members(a).some(m=>m.status!=='Approved')}detail(selected);render();await refresh();
 }catch(error){$('decision-message').textContent=error.message;buttons.forEach(b=>b.disabled=false)}
}

let visible=[],view='grid',restored=false,serverCounts={},serverTotal=0;
const initial=new URLSearchParams(location.search);
if(groups.includes(initial.get('category')))category=initial.get('category');
if(['grid','compact','list'].includes(initial.get('view')))view=initial.get('view');
const descriptions={Browse:'A curated browsing view of designs, finished cards, illustrations, and worlds.',Cards:'Finished cards, complete with frame, cost, title, and rules.','Card artwork':'Standalone card illustrations, without the card frame or rules.','Needs review':'Pending designs and requested revisions, ready for your feedback.','Approval inbox':'Everything submitted for review, including previously approved revisions.',Animations:'One design per card. Play a state or cycle through its animations.','Review sheets':'Contact sheets, comparisons, and batch reviews.','Production assets':'Animation frames, masks, layers, templates, and working files.',Environments:'Battle scenes, biome backgrounds, and world artwork.',Objects:'Potions, runestones, equipment, and scene props.',Heroes:'Hero identities and character references.',Characters:'Creature designs, bases, and variants.','All art':'All artwork and animated designs. Production files are excluded.'};
function members(a){return a.states?[...a.designs,...a.states]:[a]}
function belongs(a,g){return g==='All art'||(g==='Animations'?!!a.states?.length:g==='Browse'?a.group!=='Review sheets':g==='Needs review'?members(a).some(m=>m.status!=='Approved')&&a.group!=='Review sheets':g==='Approval inbox'?a.inbox||a.path.startsWith('approvals/inbox/'):a.group===g)}
function saveView(){const q=new URLSearchParams();q.set('category',category);for(const id of ['search','subject','status','format','source','sort'])if($(id).value)q.set(id,$(id).value);q.set('view',view);history.replaceState(null,'','?'+q)}
function updateNavigation(){const i=visible.findIndex(a=>a.id===selectedParent);$('previous').disabled=i<=0;$('next').disabled=i<0||i>=visible.length-1}
function navigate(delta){if(!selected)return;if($('decision-note').value!==(selected.decision?.note||'')){ $('decision-message').textContent='Save your review decision before moving to another artwork.';return}const i=visible.findIndex(a=>a.id===selectedParent);if(visible[i+delta])show(visible[i+delta].id)}
function render(){
 if(!restored){$('collection').innerHTML='<div class="empty">Loading the library…</div>';return}
 for(const [id,label] of [['subject','All subjects'],['status','All statuses'],['format','All formats'],['source','All sources']])options(id,id,label);
 const counts=Object.fromEntries(groups.map(g=>[g,0]));for(const a of assets)for(const g of groups)if(belongs(a,g))counts[g]++;

 $('tabs').innerHTML=groups.map(g=>(g==='Heroes'?'<div class="nav-section">Artwork</div>':g==='Review sheets'?'<div class="nav-section">Working library</div>':'')+'<button class="tab '+(category===g?'active':'')+'" aria-pressed="'+(category===g)+'" data-group="'+g+'"><span>'+g+'</span><small>'+counts[g].toLocaleString()+'</small></button>').join('');
 $('page-title').textContent=category==='Browse'?'Browse the library':category;$('page-description').textContent=descriptions[category]||'Explore every piece in this collection.';$('pending-count').textContent=counts['Needs review'].toLocaleString();
 const tokens=$('search').value.toLowerCase().trim().split(/\s+/).filter(Boolean);
 visible=assets.filter(a=>belongs(a,category)&&['subject','status','format','source'].every(key=>!$(key).value||members(a).some(m=>m[key]===$(key).value))&&tokens.every(t=>(a.name+' '+a.subject+' '+a.group+' '+a.kind+' '+a.path+' '+a.copies.join(' ')+' '+(a.searchText||'')).toLowerCase().includes(t)));
 const sort=$('sort').value;visible.sort((a,b)=>sort==='newest'?b.modified-a.modified:sort==='oldest'?a.modified-b.modified:sort==='name'?a.name.localeCompare(b.name,undefined,{numeric:true}):a.subject.localeCompare(b.subject)||a.name.localeCompare(b.name,undefined,{numeric:true}));
 $('result-count').textContent=visible.length.toLocaleString()+' results · '+Math.min(visible.length,limit)+' shown';
 $('active-filters').innerHTML=['search','subject','status','format','source'].filter(id=>$(id).value).map(id=>'<button class="chip" data-clear="'+id+'" aria-label="Clear '+id+' filter">'+esc($(id).value)+' ×</button>').join('');
 document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===view));$('collection').className=view==='grid'?'':view;
 
 if(!visible.length){$('collection').innerHTML='<div class="empty">No artwork matches these filters.<br>Try another category or clear the filters above.</div>';saveView();return}
 stopPlayback();$('collection').innerHTML='<div class="grid">'+visible.slice(0,limit).map(a=>'<article class="card" data-family="'+a.id+'" data-group="'+esc(a.group)+'"><button class="art" data-id="'+a.id+'" aria-label="View '+esc(a.name)+'">'+(a.video||a.format==='GIF'?'<span>▶ Animation preview</span>':media(a))+'</button>'+(a.states?.length?'<div class="animation-controls"><button class="action" data-play="'+a.id+'">▶ Play · '+a.states.length+' animations</button></div>':'')+'<div class="caption"><div class="meta">'+esc(a.group)+' · '+esc(a.subject)+' · '+esc(a.format)+'</div><h3>'+esc(a.name)+'</h3><span class="badge '+((a.states?!a.needsReview:a.status==='Approved')?'Approved':'')+'">'+esc(a.states?(a.needsReview?'Needs review':'Approved'):a.status)+'</span><button class="review-link" data-id="'+a.id+'" aria-label="Review '+esc(a.name)+'">Review →</button></div></article>').join('')+'</div>';
 if(visible.length>limit){const more=document.createElement('button');more.className='action load-more';more.textContent='Load 60 more · '+(visible.length-limit).toLocaleString()+' remaining';more.onclick=()=>{limit+=60;render()};$('collection').append(more)}
 updateNavigation();saveView();
}
async function refresh(){
 if(refreshing)return;refreshing=true;
 try{const r=await fetch('/api/art');if(!r.ok)throw Error();const data=await r.json();token=data.csrfToken;serverCounts=data.groupCounts||{};serverTotal=data.total||data.assets.length;const f=JSON.stringify(data);
 if(f!==fingerprint){fingerprint=f;assets=data.assets.map(a=>({...a,status:['pending approval','unreviewed','draft'].includes(a.status.toLowerCase())?'Pending approval':a.status}));for(const [id,label] of [['subject','All subjects'],['status','All statuses'],['format','All formats'],['source','All sources']])options(id,id,label);
 if(!restored){for(const id of ['search','subject','status','format','source','sort'])if(initial.has(id))$(id).value=initial.get(id);restored=true}
 $('heroes').innerHTML=['Runeblade','Warlock','Runesmith','Ranger'].map(s=>assets.filter(a=>a.group==='Heroes'&&a.subject===s&&a.status==='Approved').sort((a,b)=>Number(/base/i.test(b.name))-Number(/base/i.test(a.name))||b.modified-a.modified)[0]).filter(Boolean).map(a=>'<button class="hero" data-id="'+a.id+'" aria-label="View '+esc(a.subject)+'">'+media(a)+'<span>'+esc(a.subject)+'</span></button>').join('');renderRefreshed()}
 $('live').textContent='● Synced '+new Date().toLocaleTimeString();$('error').textContent=data.warnings.join(' · ');
 }catch{$('live').textContent='○ Disconnected';$('error').textContent='The library is temporarily unavailable. Your current view is preserved.'}finally{refreshing=false}
}
function clearFilters(){for(const id of ['search','subject','status','format','source'])$(id).value='';limit=60;render()}
$('tabs').onclick=e=>{const b=e.target.closest('[data-group]');if(b){category=b.dataset.group;limit=60;render();refresh()}};
$('active-filters').onclick=e=>{const b=e.target.closest('[data-clear]');if(b){$(b.dataset.clear).value='';limit=60;render()}};
$('reset').onclick=clearFilters;$('pending-shortcut').onclick=()=>{category='Needs review';clearFilters()};
let searchTimer;for(const id of ['search','subject','status','format','source','sort'])$(id).addEventListener('input',()=>{limit=60;if(id==='search'){clearTimeout(searchTimer);searchTimer=setTimeout(render,120)}else render()});
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{view=b.dataset.view;render()});
for(const id of ['collection','heroes'])$(id).onclick=e=>{
 const play=e.target.closest('[data-play]');if(play){startPlayback(assets.find(a=>a.id===play.dataset.play),play.closest('.card'));return}
 if(e.target.closest('[data-stop]')){stopPlayback();return}
 const review=e.target.closest('[data-review-state]');if(review){show(review.dataset.reviewState,playback?.asset.id);return}
 const card=e.target.closest('[data-id]');if(card)show(card.dataset.id);
};
$('detail').addEventListener('change',e=>{if(e.target.id==='review-member'){
 if($('decision-note').value!==(selected.decision?.note||'')){e.target.value=selected.id;$('decision-message').textContent='Save your review decision before switching artwork.';return}
 show(e.target.value,selectedParent);
}});
$('detail').onclick=e=>{const b=e.target.closest('[data-decision]');if(b)decide(b.dataset.decision)};
$('previous').onclick=()=>navigate(-1);$('next').onclick=()=>navigate(1);
$('close').onclick=()=>$('viewer').close();$('viewer').onclick=e=>{if(e.target===$('viewer'))$('viewer').close()};
$('background').onclick=()=>{document.body.classList.toggle('light');$('background').textContent=document.body.classList.contains('light')?'Dark backdrop':'Light backdrop'};
document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!$('viewer').open){e.preventDefault();$('search').focus()}});



function stateLabel(a){const parts=a.path.split('/'),revision=parts.findLast(p=>/^(?:proof-)?r\d|^animation-r/.test(p));return a.path.split('/').at(-1).replace(/\.[^.]+$/,'').replaceAll('_',' ') +(revision?' · '+revision:'')}
function reviewSelector(a){const parent=assets.find(x=>x.id===selectedParent);if(!parent?.states)return '';return '<label class="review-selector">Review artwork or animation<select id="review-member">'+members(parent).map(m=>'<option value="'+m.id+'" '+(m.id===a.id?'selected':'')+'>'+esc((m.group==='Animations'?'Animation: '+stateLabel(m):'Design: '+m.name)+' — '+m.status)+'</option>').join('')+'</select></label>'}
let playback=null;
function stopPlayback(){if(!playback)return;clearTimeout(playback.timer);playback.host.innerHTML=playback.original;playback=null}
function startPlayback(asset,host){
 stopPlayback();if(!asset?.states?.length)return;
 playback={asset,host,original:host.innerHTML,timer:null};
 const preferred=asset.states.findIndex(s=>/^idle(?:\.|_)/i.test(s.path.split('/').at(-1)));
 host.querySelector('.art').outerHTML='<div class="art playing" aria-live="off"></div>';
 host.querySelector('.animation-controls').innerHTML='<select aria-label="Animation state">'+asset.states.map((s,i)=>'<option value="'+i+'">'+esc(stateLabel(s))+'</option>').join('')+'</select><label><input type="checkbox" checked> Cycle states</label><button class="action" data-stop>■ Stop</button><button class="action" data-review-state>Review this state</button>';
 const select=host.querySelector('.animation-controls select');select.value=String(Math.max(0,preferred));
 select.onchange=()=>playState(Number(select.value));
 host.querySelector('input').onchange=()=>playState(Number(select.value));
 playState(Number(select.value));
}
function playState(index){
 if(!playback)return;const p=playback,s=p.asset.states[index];clearTimeout(p.timer);
 const stage=p.host.querySelector('.playing');stage.innerHTML=s.video?'<video src="'+s.url+'?v='+s.modified+'" autoplay muted loop playsinline controls></video>':'<img src="'+s.url+'?v='+s.modified+'" alt="'+esc(s.name)+'">';
 p.host.querySelector('select').value=String(index);p.host.querySelector('[data-review-state]').dataset.reviewState=s.id;
 const element=stage.firstElementChild,cycle=p.host.querySelector('input').checked;
 const schedule=()=>{if(playback!==p)return;clearTimeout(p.timer);const duration=s.video&&Number.isFinite(element.duration)?element.duration*1000:s.duration||4000;
  p.timer=setTimeout(()=>{if(playback===p)playState(cycle?(index+1)%p.asset.states.length:index)},Math.max(250,duration));
 };
 element.addEventListener(s.video?'loadeddata':'load',schedule,{once:true});
 element.addEventListener('error',()=>{stage.innerHTML='<span>Preview unavailable. Choose another state.</span>'},{once:true});
 if(!s.video&&element.complete&&element.naturalWidth)schedule();
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPlayback()});
refresh();setInterval(()=>{if(!document.hidden)refresh()},10000);

function renderRefreshed(){
 const resume=playback?{id:playback.asset.id,stateId:playback.asset.states[Number(playback.host.querySelector('select').value)].id,cycle:playback.host.querySelector('input').checked}:null;
 render();
 if(resume){const asset=assets.find(a=>a.id===resume.id),host=document.querySelector('[data-family="'+resume.id+'"]');if(asset&&host){startPlayback(asset,host);const index=asset.states.findIndex(s=>s.id===resume.stateId);host.querySelector('input').checked=resume.cycle;playState(Math.max(0,index))}}
}
