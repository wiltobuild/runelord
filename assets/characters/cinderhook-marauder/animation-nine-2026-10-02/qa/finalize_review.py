from pathlib import Path
import json, hashlib, datetime

root=Path(__file__).resolve().parent.parent
qa=root/'qa'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
approvals=json.loads((qa/'source-approval-check.json').read_text())
notes={
'v01':['Cleaver retained after hit repair; separate death generation resolves crowded source extraction. All20 used authored poses inspected. Small idle stance jitter remains.'],
'v02':['Long spear and round shield remain whole; true transparency confirmed despite hidden brown RGB. All24 poses inspected. Spear silhouette makes character appear smaller in common canvas scaling.'],
'v03':['Final attack01 rear axe again has crescent blade/orange gem. Component extraction removed neighboring red fragment. Final repaired frame and adjacent attack poses rechecked.'],
'v04':['Final attack02 has empty crossbow rail and flying bolt; release reads correctly. Reload is abbreviated into loaded recovery. Cheek scar reads native but is faint small.','Audit initially found157 RGBA differences between attack02 PNG and atlas, all beneath alpha0; zero visible or alpha differences. Visible equivalence accepted; exact byte comparison remains explicitly recorded.'],
'v05':['Final attack01/02 keep bronze armor on bow arm and dark wrapping on drawing arm; extra elbow plate removed. Reload is abbreviated.'],
'v06':['R2 hit08 removes invented tusk; terminal15 boot complete. All16 poses inspected; individual five-state light/dark playback sampled, terminal hold verified.'],
'v07':['Neighbor fragments removed by component extraction. R3 wounded10/11 have two hands visibly gripping two daggers. R4 runtime excludes04 because blade ownership swapped. Used attack0,5,6,7,0 rechecked.'],
'v08':['All15 runtime-used poses inspected, staff retained and lying intentionally beside terminal corpse. Defective09 without staff excluded. Cast present and activated in combined player.'],
'v09':['All16 exports inspected. Wrong-handed04 excluded in r2. Runtime attack0,5,6,7,0 preserves shield/sword hands;15 used poses accepted. Guard present and activated.']}
report={'schemaVersion':1,'reviewer':'independent /root/review_goblin_animation','completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'pass_with_limitations','sourceRevision':'c7a20871a08e6b089fd6b86dfc5c48fec28e92b1','blockingRuntimeDefects':[],
'scope':'Nine animation previews; not game integration or design approval.',
'limitations':['Sparse whole-character raster poses have coarse motion, minor stance/foot/head jitter and simplified fine details. Source character poses are roughly280-320px, not HD-per-frame animation. Canvas padding does not increase authored detail.','Browser playback was activated and sampled through screenshots and DOM state/frame advancement. Continuous perceptual smoothness/flicker at every instant was not directly observable through this tool.','Small-view sprites are visible but actual character height varies with padded canvas; do not interpret the96px control as every character exactly96px tall.','Ranged reloads are abbreviated; v04 bolt is baked into release image, not a separately exported projectile effect.'],
'designApproval':{'status':'pending_separate_user_review','note':'Approved exact source masters do not approve generated animation previews. Reviewer did not approve gallery items.'},
'browser':{'url':'http://127.0.0.1:4381/','status':'pass_with_limitations','observed':['9/9 manifests loaded','attack/hit run then return idle','wounded_idle visibly distinct from brief hit','all9 death states reach and hold final corpse','Pause/Resume control and frame advance','0.5x speed selection','large/small and light/dark backgrounds','cast applies shaman; guard applies spear guard and captain; unsupported variants remain idle','console error query empty'],'continuous_temporal_certification':'not_run','overview':{'file':'all-nine-review.gif','sha256':sha(root/'all-nine-review.gif'),'sample':'qa/overview-sample.png','observation':'Attack sample readable, nine complete silhouettes and labels without overlaps; overview loops for review only.'}},
'gameIntegration':{'status':'not_run','reason':'No actual game integration in task scope.'},'variants':[]}
for folder in sorted(root.glob('v0*')):
    if not (folder/'manifest.json').exists():continue
    m=json.loads((folder/'manifest.json').read_text(encoding='utf-8-sig'))
    a=json.loads((qa/folder.name/'metadata-audit.json').read_text())
    assert sha(folder/'manifest.json')==a['manifest_sha256'],folder.name+' audit stale'
    used={f['file']:f for s in a['states'].values() for f in s['frames']}
    states={}
    for name,s in a['states'].items():
        passed=s['duration_agrees'] and s['events_in_bounds'] and all(f.get('atlas_visible_equal',f['atlas_equal']) and not f['edge_opaque'] and f['alpha_extrema'][0]==0 for f in s['frames'])
        if not passed:
            report['status']='fail'
            report['blockingRuntimeDefects'].append({'variant':folder.name,'state':name,'reason':'Frame/atlas or metadata audit mismatch; builder repair requested.'})
        states[name]={'status':'pass_with_limitations' if passed else 'fail','metadata':'pass' if passed else 'fail','all_used_frames_identity_and_adjacent_pose_review':'pass_with_limitations','playback':'observed_samples','durationMs':s['duration_sum'],'loop':s['loop'],'terminal':s['terminal'],'holdLastFrame':s['holdLastFrame'],'nextState':s['nextState'],'events':m['states'][name].get('events',[]),'frameFiles':[f['file'] for f in s['frames']]}
    report['variants'].append({'id':folder.name,'status':'pass_with_limitations','approvedMaster':next(v for v in approvals if folder.name in v['path']),'manifestSha256':a['manifest_sha256'],'atlasSha256':a['atlas_sha256'],'canvas':m.get('canvas'), 'exportedFrameCount':len(list((folder/'frames').rglob('*.png'))),'runtimeUsedUniqueFrameCount':len(used),'excludedFrames':m.get('excludedFrames',[]),'observations':notes[folder.name[:3]],'states':states,'usedFrames':list(used.values()),'generatedSources':[{'path':str(p.relative_to(folder)).replace('\\','/'),'sha256':sha(p)} for p in folder.rglob('*.png') if ('source' in str(p.relative_to(folder)) and 'frames' not in str(p.relative_to(folder)))]})
report['stateCount']=sum(len(v['states']) for v in report['variants'])
report['runtimeUsedUniqueFrameCount']=sum(v['runtimeUsedUniqueFrameCount'] for v in report['variants'])
report['exportedFrameCount']=sum(v['exportedFrameCount'] for v in report['variants'])
for v in report['variants']:
    if any(s['status']=='fail' for s in v['states'].values()):v['status']='fail'
(qa/'final-review.json').write_text(json.dumps(report,indent=2),encoding='utf8')
(qa/'final-review.md').write_text(f'''# Independent goblin animation review

Result: **{report['status']}** for {len(report['variants'])} variants and {report['stateCount']} state entries. Blocking runtime defects: {len(report['blockingRuntimeDefects'])}; see JSON for details. {report['runtimeUsedUniqueFrameCount']} distinct runtime-used exported frames reviewed; {report['exportedFrameCount']} PNG exports total. Excluded diagnostic poses are retained and are not approved for runtime use.

Exact source master approvals, current manifest/atlas hashes, per-state checks and per-frame hashes are recorded in final-review.json and metadata-audit.json files. Every used authored pose was inspected against its variant master and adjacent poses; final changed frames were rechecked. The JSON records individual checks for transparency, unclipped canvas edges, atlas equality, duration totals, event bounds and terminal semantics.

Combined player loaded all nine and exercised attack, hit, wounded idle, death, cast, guard, pause/resume, speed, size and backgrounds. Death holds its terminal corpse. No browser console errors observed. Overview attack sample has readable labels and complete silhouettes.

These are coarse short sprite animations with modest native pose resolution, minor stance jitter and simplified fine details. Playback was activated and sampled through screenshots and DOM frame advancement; continuous smoothness/flicker certification is not claimed. Small-view character height varies with canvas padding. Ranged reloads are abbreviated. No game integration tests were applicable. Animation design approval remains pending separate user review; approved source art does not approve these animations.
''',encoding='utf8')
print(json.dumps({k:report[k] for k in ['status','stateCount','runtimeUsedUniqueFrameCount','exportedFrameCount']}))
