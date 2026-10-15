(function(){
'use strict';
const section=document.getElementById('pixel-studio'),stage=section?.querySelector('.studio-stage');
if(!section||!stage||!window.PixelStudio)return;
const layers=Array.from(stage.querySelectorAll('canvas'));
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
let visible=true,scheduled=false,scale=1;
function draw(){layers.forEach((canvas,i)=>window.PixelStudio.drawLayer(canvas.getContext('2d'),i));}
function resize(){const w=stage.clientWidth;scale=Math.max(1,Math.floor(w/480));stage.style.setProperty('--pixel-scale',scale);stage.style.height=(314*scale)+'px';schedule();}
function update(){scheduled=false;if(!visible)return;
 const bounds=section.getBoundingClientRect(),height=window.innerHeight;
 const progress=Math.max(0,Math.min(1,(height-bounds.top)/(height+bounds.height)));
 const amount=reduced.matches?0:(progress-.5)*(window.innerWidth<650?.55:1);
 layers.forEach((canvas,i)=>{const speed=[0,8,20,42][i];const dy=Math.round(amount*speed*scale),dx=Math.round(amount*[0,-2,-5,-9][i]*scale);canvas.style.transform='translate(-50%, -50%) translate3d('+dx+'px, '+dy+'px, 0)';});
}
function schedule(){if(!scheduled&&visible){scheduled=true;requestAnimationFrame(update)}}
draw();resize();
window.addEventListener('scroll',schedule,{passive:true});
window.addEventListener('resize',resize,{passive:true});
reduced.addEventListener('change',schedule);
if('ResizeObserver' in window)new ResizeObserver(resize).observe(stage);
if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)schedule()},{rootMargin:'100px'}).observe(section);
})();
