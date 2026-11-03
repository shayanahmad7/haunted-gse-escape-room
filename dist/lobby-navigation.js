// Floor coordinates are calibrated against the fixed lobby panorama at 1470 x 600.
// Keeping vertical FOV fixed lets the same boundaries project at other aspect ratios.
export const REFERENCE_ASPECT=2.45;
export const FLOOR=[[.04,.965],[.97,.965],[.69,.63],[.635,.505],[.345,.415],[.17,.61],[.04,.78]];
export const SOFA=[[.355,.36],[.62,.36],[.625,.70],[.365,.70]];
export const FOOT_RADIUS=.032;
const metric=p=>[p[0]*REFERENCE_ASPECT,p[1]];
const length=(a,b)=>Math.hypot((a[0]-b[0])*REFERENCE_ASPECT,a[1]-b[1]);
export const toScreen=(p,aspect)=>[.5+(p[0]-.5)*REFERENCE_ASPECT/aspect,p[1]];
export const fromScreen=(p,aspect)=>[.5+(p[0]-.5)*aspect/REFERENCE_ASPECT,p[1]];
function inside(p,poly){let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
function edgeDistance(p,poly){const [x,y]=metric(p);let min=Infinity;for(let i=0;i<poly.length;i++){const a=metric(poly[i]),b=metric(poly[(i+1)%poly.length]),dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));min=Math.min(min,Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy));}return min;}
export function createNavigation({floor=FLOOR,obstacles=[SOFA],spawn=[.48,.88]}={}){
function isWalkable(p,aspect=REFERENCE_ASPECT){const s=toScreen(p,aspect);return s[0]>.025+FOOT_RADIUS/aspect&&s[0]<.975-FOOT_RADIUS/aspect&&p[1]<.97&&inside(p,floor)&&edgeDistance(p,floor)>=FOOT_RADIUS&&obstacles.every(poly=>!inside(p,poly)&&edgeDistance(p,poly)>=FOOT_RADIUS);}
function clearSegment(a,b,aspect=REFERENCE_ASPECT){const steps=Math.max(1,Math.ceil(length(a,b)/.008));for(let i=0;i<=steps;i++){const t=i/steps;if(!isWalkable([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t],aspect))return false;}return true;}
function moveAndSlide(p,delta,aspect=REFERENCE_ASPECT){let at=[...p];const n=Math.max(1,Math.ceil(Math.hypot(delta[0]*REFERENCE_ASPECT,delta[1])/.006)),d=delta.map(x=>x/n);for(let i=0;i<n;i++){const full=[at[0]+d[0],at[1]+d[1]];if(isWalkable(full,aspect)){at=full;continue;}const x=[at[0]+d[0],at[1]],y=[at[0],at[1]+d[1]];if(isWalkable(x,aspect))at=x;if(isWalkable([at[0],y[1]],aspect))at=[at[0],y[1]];}return at;}
const COLS=76,ROWS=46;
const point=id=>[(id%COLS)/(COLS-1),.4+Math.floor(id/COLS)/(ROWS-1)*.57];
let cachedAspect=-1,grid=[];
function floorGrid(aspect){if(aspect!==cachedAspect){cachedAspect=aspect;grid=Array.from({length:COLS*ROWS},(_,id)=>isWalkable(point(id),aspect));}return grid;}
function findPath(start,requested,aspect=REFERENCE_ASPECT){
 if(!isWalkable(start,aspect))return [];
 if(isWalkable(requested,aspect)&&clearSegment(start,requested,aspect))return [[...requested]];
 const valid=floorGrid(aspect);let first=-1,last=-1,nearStart=Infinity,nearEnd=Infinity;
 for(let id=0;id<valid.length;id++){if(!valid[id])continue;const p=point(id),ds=length(start,p),de=length(requested,p);if(ds<nearStart&&clearSegment(start,p,aspect)){first=id;nearStart=ds;}if(de<nearEnd){last=id;nearEnd=de;}}
 if(first<0||last<0)return [];
 const open=[first],queued=new Set(open),closed=new Set(),cost=new Map([[first,0]]),parent=new Map(),goal=point(last);
 while(open.length){let best=0;for(let i=1;i<open.length;i++)if(cost.get(open[i])+length(point(open[i]),goal)<cost.get(open[best])+length(point(open[best]),goal))best=i;const id=open.splice(best,1)[0];queued.delete(id);if(id===last){const route=[];for(let at=last;at!==undefined;at=parent.get(at))route.unshift(point(at));if(isWalkable(requested,aspect)&&clearSegment(goal,requested,aspect))route.push(requested);const smooth=[];let at=start;while(route.length){let far=route.length-1;while(far>0&&!clearSegment(at,route[far],aspect))far--;if(!clearSegment(at,route[far],aspect))return [];at=route[far];smooth.push(at);route.splice(0,far+1);}return smooth;}
  closed.add(id);const col=id%COLS,row=Math.floor(id/COLS);
  for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++){if(!x&&!y||col+x<0||col+x>=COLS||row+y<0||row+y>=ROWS)continue;const next=id+y*COLS+x;if(!valid[next]||closed.has(next)||!clearSegment(point(id),point(next),aspect))continue;const c=cost.get(id)+length(point(id),point(next));if(c<(cost.get(next)??Infinity)){cost.set(next,c);parent.set(next,id);if(!queued.has(next)){open.push(next);queued.add(next);}}}
 }
 return [];
}
return {isWalkable,clearSegment,moveAndSlide,findPath,spawn};
}
const lobbyNavigation=createNavigation();
export const isWalkable=(...args)=>lobbyNavigation.isWalkable(...args);
export const clearSegment=(...args)=>lobbyNavigation.clearSegment(...args);
export const moveAndSlide=(...args)=>lobbyNavigation.moveAndSlide(...args);
export const findPath=(...args)=>lobbyNavigation.findPath(...args);
export function createWalker(initial=[.48,.88],layout){
 const {isWalkable,moveAndSlide,findPath,spawn}=createNavigation(layout);
 let position=[...initial],velocity=[0,0],input=[0,0],route=[],aspect=REFERENCE_ASPECT;
 return {
  position:()=>[...position],
  resize(value){aspect=value;if(!isWalkable(position,aspect)){position=[...spawn];velocity=[0,0];route=[];}},
  direction(x,y){input=[x,y];if(x||y)route=[];},
  target(p){input=[0,0];route=findPath(position,p,aspect);},
  stop(){input=[0,0];velocity=[0,0];route=[];},
  step(dt){dt=Math.max(0,Math.min(dt,.05));let desired=[0,0],speed=.28*(.7+.5*Math.max(0,position[1]-.45)/.5),remaining=Infinity;
   if(input[0]||input[1]){const n=Math.hypot(...input);desired=input.map(v=>v/n*speed);}else if(route.length){let goal=route[0];remaining=length(position,goal);while(remaining<.008&&route.length>1){route.shift();goal=route[0];remaining=length(position,goal);}if(remaining<.004){route=[];}else{speed=Math.min(speed,Math.sqrt(2*1.4*remaining));desired=[(goal[0]-position[0])*REFERENCE_ASPECT/remaining*speed,(goal[1]-position[1])/remaining*speed];}}
   const change=desired.map((v,i)=>v-velocity[i]),n=Math.hypot(...change),limit=1.4*dt;velocity=velocity.map((v,i)=>v+(n>limit?change[i]/n*limit:change[i]));
   let delta=[velocity[0]*dt/REFERENCE_ASPECT,velocity[1]*dt];if(!input[0]&&!input[1]&&length([0,0],delta)>remaining)delta=delta.map(v=>v*remaining/length([0,0],delta));
   const old=position;position=moveAndSlide(position,delta,aspect);const travelled=length(old,position);if(travelled<.000001&&Math.hypot(...velocity)>.01){velocity=[0,0];if(route.length)route=[];}
   return {position:toScreen(position,aspect),travelled,moving:travelled>.00001};
  }
 };
}
