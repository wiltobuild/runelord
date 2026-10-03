const title=s=>s.replace(/[-_]/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
export function classify(rel,m={}){
 const origin=(m.origin||rel).replaceAll('\\','/'), p=('/'+origin).toLowerCase(), leaf=p.split('/').at(-1), stem=leaf.replace(/\.[^.]+$/,'');
 const card=p.includes('/cards/')||['Cards','Card artwork'].includes(m.group);
 const animation=/\/animations?\//.test(p)||m.group==='Animation studies'||m.group==='Animations';
 let group=m.group||'Other art',kind='Artwork';
 if(/\/templates\/|(?:^|\/)(?:mask[-_]|text-layer|art-layer|clean-panels|fixed-frame)/.test(p)){group='Production assets';kind='Layer / template'}
 else if(/(?:review|comparison|contact[-_]?sheet|batch[-_].*review)/.test(stem)&&! /\.(gif|mp4|webm)$/.test(leaf)){group='Review sheets';kind='Review sheet'}
 else if(animation){group=/\.(gif|mp4|webm)$/.test(leaf)?'Animations':'Production assets';kind=group==='Animations'?'Animation preview':'Animation frame / source'}
 else if(card){group=m.group==='Card artwork'||m.role==='illustration'||/(?:illustration|artwork|^art$)/.test(stem)?'Card artwork':'Cards';kind=group==='Cards'?'Finished card':'Card illustration'}
 else if(p.includes('/environments/')){group='Environments';kind='Battle scene'}
 else if(p.includes('/objects/')){group='Objects';kind='Object / prop'}
 else if(p.includes('/heroes/')){group='Heroes';kind='Hero design'}
 else if(p.includes('/characters/')||p.includes('/concepts/')){group='Characters';kind='Character design'}
 let subject=m.subject||'Runelord',name=m.name||title(stem);
 if(card){const hero=p.match(/runeblade|warlock|runesmith|ranger|neutral|quest/)||subject.match(/runeblade|warlock|runesmith|ranger|neutral|quest/i);if(hero)subject=title(hero[0].toLowerCase());
  if(!m.name){const parts=origin.split('/');const parent=parts.at(-2);const slug=/^r\d/.test(parent)?parts.at(-3):parent;if(group==='Card artwork'&&slug)name=title(slug)}
 }
 if(!m.subject&&!card){const parts=origin.split('/');const index=parts.findIndex(x=>['characters','objects','environments','heroes'].includes(x));if(index>=0){let next=parts[index+1];if(['references','animations'].includes(next))next=parts[index+2];if(next)subject=title(next)}}
 subject=subject.replace(/ Motion Proof$/i,'');
 return {group,kind,subject,name,format:leaf.split('.').at(-1).toUpperCase(),inbox:rel.startsWith('approvals/inbox/')};
}
