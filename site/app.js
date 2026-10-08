const dialog=document.getElementById('player-dialog');
const player=document.getElementById('player');
const status=document.getElementById('player-status');
const original=document.getElementById('original-link');
let works=[],activeFile='',launchButton=null;
fetch('media.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Could not load video list');return r.json()}).then(list=>{works=list;render(list.slice(1))}).catch(()=>{const p=document.createElement('p');p.textContent='The video list could not load. Please refresh.';document.getElementById('work').append(p)});
function render(list){const grid=document.getElementById('work');list.forEach((work,i)=>{
 const card=document.createElement('article');card.className='card';
 const button=document.createElement('button');button.className='video-cover';button.dataset.file=work.file;button.setAttribute('aria-label','Play '+work.title);
 const image=document.createElement('img');image.src=work.poster;image.alt=work.title+' video still';image.loading='lazy';const label=document.createElement('span');label.className='play-label';label.textContent='▶ Play video';button.append(image,label);card.append(button);
 const caption=document.createElement('div');caption.className='caption';const title=document.createElement('h2');title.textContent=work.title;const type=document.createElement('span');type.textContent=String(i+2).padStart(2,'0')+' / '+work.type;caption.append(title,type);card.append(caption);grid.append(card);
})}
async function openVideo(button){const work=works.find(w=>w.file===button.dataset.file);if(!work)return;launchButton=button;player.pause();activeFile=work.file;player.src='media/'+work.file+'.mp4';player.poster=work.poster;document.getElementById('player-title').textContent=work.title;original.href='https://drive.google.com/file/d/'+work.id+'/view';status.textContent='Loading video…';dialog.showModal();document.body.classList.add('player-open');player.load();try{await player.play()}catch(error){if(activeFile===work.file&&error.name==='NotAllowedError')status.textContent='Tap play to start.'}}
document.addEventListener('click',e=>{const b=e.target.closest('.video-cover');if(b)openVideo(b)});
document.getElementById('close-player').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
dialog.addEventListener('close',()=>{player.pause();player.removeAttribute('src');player.load();activeFile='';document.body.classList.remove('player-open');launchButton?.focus()});
player.addEventListener('playing',()=>status.textContent='');
player.addEventListener('waiting',()=>{if(activeFile)status.textContent='Buffering…'});
player.addEventListener('error',()=>{if(activeFile)status.textContent='This video could not load. Try the original in Drive.'});
player.addEventListener('ended',()=>status.textContent='');
