/* Original pixel still life. Integer geometry; four independently rendered planes. */
(function(root){
'use strict';
const CONFIG={seed:41,width:480,height:270,palette:{void:'#151820',wall:'#303c4d',wallLight:'#3d4b60',line:'#222936',night:'#252b49',dusk:'#626383',light:'#d9d1bc',wood:'#867169',woodLight:'#b3a08b',woodDark:'#51494e',ink:'#1b202c',sage:'#8b9f8b',leaf:'#637e74',leafDark:'#3d5a55',pink:'#c0a2b8',blue:'#809db8'},light:{x:350,y:40},textureScale:1,textureStrength:.18,edgeSoftness:0,motionAmplitude:24};
const P=CONFIG.palette;
function drawLayer(ctx,layer,variant=0){
const W=CONFIG.width,H=CONFIG.height;ctx.clearRect(0,0,W,H);ctx.imageSmoothingEnabled=false;
const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
const poly=(pts,c)=>{const lo=Math.min(...pts.map(p=>p[1])),hi=Math.max(...pts.map(p=>p[1]));for(let y=Math.ceil(lo);y<hi;y++){const hits=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y))hits.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));}hits.sort((a,b)=>a-b);for(let i=0;i+1<hits.length;i+=2)rect(Math.ceil(hits[i]),y,Math.floor(hits[i+1])-Math.ceil(hits[i])+1,1,c)}};
const ellipse=(cx,cy,rx,ry,c)=>{for(let y=-ry;y<=ry;y++){const dx=Math.floor(rx*Math.sqrt(Math.max(0,1-y*y/(ry*ry))));rect(cx-dx,cy+y,dx*2+1,1,c)}};
const line=(x0,y0,x1,y1,c,th=1)=>{let dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1,e=dx+dy;while(true){rect(x0,y0,th,th,c);if(x0===x1&&y0===y1)break;let e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}};
let state=CONFIG.seed+layer*113;function rnd(){state=(state*1664525+1013904223)>>>0;return state/4294967296}
const shift=variant===1?-32:variant===2?25:0;
if(layer===0){
 rect(0,0,W,H,P.wall);rect(0,0,170,184,P.wallLight);rect(170,0,4,190,P.line);rect(0,183,W,87,P.woodDark);
 // A quiet lilac evening through the window; simple ordered material ramps.
 rect(277+shift,13,169,153,P.line);rect(284+shift,20,155,138,P.night);rect(284+shift,20,155,45,'#666987');rect(284+shift,65,155,35,'#545c79');rect(284+shift,100,155,58,'#3c465f');
 ellipse(399+shift,45,13,13,'#c3c3c1');ellipse(404+shift,41,12,12,'#666987');
 for(let i=0;i<10;i++){let x=284+shift+i*17,y=119-Math.floor(rnd()*28);rect(x,y,14,158-y,'#2c374d');rect(x+3,y+9,2,3,'#a49f99');if(i%2)rect(x+8,y+18,2,3,'#7c8291')}
 rect(358+shift,20,5,138,P.line);rect(284+shift,88,155,5,P.line);rect(275+shift,160,174,7,'#566275');rect(275+shift,167,174,3,P.line);
 for(let i=0;i<70;i++){let x=3+Math.floor(rnd()*160),y=3+Math.floor(rnd()*170);rect(x,y,1+(i%3),1,'#435167')}
 // Wall-mounted print with a miniature composition, never used as a project sample.
 rect(29,34,89,91,P.line);rect(33,38,81,83,'#a49c9e');rect(38,43,71,73,'#637b80');ellipse(86,63,12,12,'#c7bda7');poly([[38,104],[59,75],[77,102],[92,86],[109,106],[109,116],[38,116]],'#354d58');rect(72,95,3,14,'#202c38');rect(69,107,9,2,'#202c38');
}
if(layer===1){
 // Shelf and books; their supported contact line is below each spine.
 rect(16,145,134,6,'#a08e7d');rect(19,151,130,4,P.line);rect(28,121,9,24,'#9c849b');rect(38,115,11,30,'#718b8c');rect(50,124,8,21,'#c1b293');rect(59,118,12,27,'#647189');rect(74,128,31,7,'#b3a08b');rect(74,137,31,8,'#8d788e');for(let x=31;x<70;x+=12)rect(x,128,2,9,'#d4c8b5');
 // A desk lamp. The light is a discrete patch, not a blurred glow.
 poly([[358,99],[313,198],[422,198]],'#465064');rect(371,108,3,77,'#929d9d');line(371,111,354,86,'#a2aaa5',3);poly([[339,79],[358,79],[368,95],[330,95]],'#b7b3a2');rect(333,95,31,3,'#e0d3ad');ellipse(373,188,15,4,P.line);rect(362,185,24,3,'#919b98');
 // Hanging cable and two film reels on the wall.
 line(198,0,198,40,P.ink,2);ellipse(198,49,19,19,'#5a6476');ellipse(198,49,4,4,P.ink);for(let a=0;a<6;a++){const q=a*Math.PI/3;ellipse(Math.round(198+Math.cos(q)*11),Math.round(49+Math.sin(q)*11),4,4,P.line)}
 rect(211,180,114,14,'#414453');
}
if(layer===2){
 // Desk surface, edge and legs.
 poly([[78,185],[417,185],[445,213],[60,213]],P.wood);rect(60,213,385,9,P.woodLight);rect(65,222,376,7,P.woodDark);rect(84,229,12,41,P.ink);rect(409,229,12,41,P.ink);rect(97,229,4,41,'#5c5a60');
 for(let i=0;i<75;i++){let x=85+Math.floor(rnd()*320),y=190+Math.floor(rnd()*20);rect(x,y,3+Math.floor(rnd()*12),1,i%3?'#958073':'#6f6060')}
 // Main monitor with an original mountain scene and an editing timeline.
 rect(181,88,151,102,P.ink);rect(184,91,145,93,'#59667c');rect(189,96,135,83,'#232d43');rect(191,98,131,49,'#657a91');rect(191,98,131,17,'#a0a7ac');ellipse(288,112,8,8,'#d6d1bf');poly([[191,142],[219,111],[250,143],[277,126],[304,143],[322,132],[322,147],[191,147]],'#405b6a');poly([[205,143],[235,127],[264,145],[296,136],[322,145],[322,147],[205,147]],'#293d50');rect(191,148,131,28,'#232838');rect(191,150,131,2,'#536175');
 for(let j=0;j<3;j++){rect(198,155+j*6,16,3,'#576176');rect(216+j*5,155+j*6,28,3,j===1?P.sage:P.pink);rect(247+j*3,155+j*6,32,3,P.blue);rect(284,155+j*6,27-j*4,3,'#9c8cae')}
 rect(263,150,1,26,'#d9cdbb');rect(250,190,12,11,'#7f8a96');rect(232,201,48,4,'#a0a6a6');rect(236,205,42,2,P.ink);rect(245,183,20,2,'#8e98a2');
 // Speaker pair and a warm notebook.
 for(const x of [151,341]){rect(x,147,22,45,P.ink);rect(x+2,149,18,39,'#465264');ellipse(x+11,160,5,5,'#202a39');ellipse(x+11,179,7,7,'#242e3e');ellipse(x+10,177,3,3,'#667286')}
 poly([[292,195],[329,195],[339,208],[296,208]],'#d1b7ac');line(296,198,325,198,'#887c83');line(299,201,330,201,'#887c83');line(302,204,327,204,'#887c83');
 // Keyboard has designed rows, with a dark contact shadow.
 poly([[198,210],[280,210],[292,220],[189,220]],P.ink);poly([[201,208],[279,208],[286,215],[195,215]],'#92999d');for(let row=0;row<2;row++)for(let col=0;col<15;col++)rect(200+col*5-row*2,209+row*3,3,1,'#d1d0c4');
 ellipse(313,216,7,4,'#aab1ab');rect(312,213,1,3,'#616c78');
 // Transparent water glass with stepped rim, unequal reflections and base thickness.
 rect(113,173,18,30,'#69818a');rect(115,178,14,22,'#526c78');ellipse(122,173,9,2,'#bcc6c1');ellipse(122,173,6,1,'#586f7d');rect(114,176,2,22,'#cbd0c5');rect(128,180,1,18,'#8fa5aa');rect(116,190,12,1,'#aabdbc');rect(117,193,5,5,'#7b9398');rect(115,202,14,2,'#c2c9c1');rect(119,203,7,1,'#6b828d');
}
if(layer===3){
 // Foreground camera: offset lens, grip, controls and connected tripod.
 ellipse(79,249,58,7,'#111620');rect(35,212,67,41,'#161c28');rect(39,208,54,6,'#252f40');rect(42,215,52,32,'#394759');rect(39,222,8,27,'#222c3a');rect(43,212,19,3,'#75818a');rect(50,203,20,8,'#202a3a');rect(54,200,13,4,'#6d7884');rect(47,224,18,12,'#718c92');rect(49,226,14,8,'#293d4c');rect(72,212,3,3,'#b8a2b4');rect(77,212,8,3,'#87949d');
 rect(91,219,19,27,'#222d3e');ellipse(109,232,13,17,'#4b586a');ellipse(112,232,10,14,'#1b2537');ellipse(114,231,7,10,'#3c5d72');ellipse(115,231,4,7,'#142535');rect(113,224,3,5,'#8faeae');rect(119,232,1,4,'#778e9d');rect(95,223,2,18,'#67717d');rect(101,220,1,24,'#67717d');
 rect(66,253,15,5,'#4c5866');line(72,258,56,270,'#263140',4);line(76,258,91,270,'#263140',4);
 // Leaves are asymmetric clusters on stems, with lighter upper surfaces.
 rect(420,224,29,37,'#99878c');rect(416,222,37,7,'#b6a1a5');rect(422,230,4,27,'#c1aaad');rect(444,230,4,27,'#70636f');rect(426,260,16,3,'#554c5d');
 const leaves=[[[434,225],[433,188],[419,172],[419,184]],[[434,210],[447,177],[464,165],[460,181]],[[433,202],[415,187],[399,188],[418,200]],[[434,191],[434,163],[443,147],[445,167]],[[434,220],[457,202],[474,201],[460,214]],[[430,214],[413,207],[399,212],[416,217]]];
 leaves.forEach((v,i)=>{poly(v,i%2?P.leaf:P.leafDark);line(v[0][0],v[0][1],v[2][0],v[2][1],P.sage)});line(434,225,434,178,P.leaf,2);
 // Bottom foreground edge visually anchors the room.
 rect(0,267,W,3,'#141923');
}
}
root.PixelStudio={CONFIG,drawLayer};if(typeof module!=='undefined')module.exports=root.PixelStudio;
})(typeof window!=='undefined'?window:globalThis);
