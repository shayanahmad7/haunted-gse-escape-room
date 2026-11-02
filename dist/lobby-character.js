import * as THREE from './vendor/three.module.js';
import {ROUTES,LOBBY_PATH,worldPoint,journeyFor} from './gse-routes.js';

// An articulated 3D explorer, with photo-overlay controls and plan-based travel.
export function createLobbyCharacter(host,{position=[.48,.88]}={}){
 let renderer;
 try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{return null;}
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
 renderer.setClearColor(0x000000,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.domElement.setAttribute('aria-hidden','true');host.append(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,1,.1,80);
 camera.position.set(0,7,12);camera.lookAt(0,.2,0);camera.updateMatrixWorld();
 scene.add(new THREE.HemisphereLight(0xffe3b8,0x536459,2.5));
 const sun=new THREE.DirectionalLight(0xffd3a0,3.5);sun.position.set(-4,9,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-15,right:15,top:15,bottom:-15,near:.1,far:40});sun.shadow.bias=-.001;scene.add(sun);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.ShadowMaterial({opacity:.28}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
 const rig=new THREE.Group();scene.add(rig);
 const mat=(color,roughness=.8)=>new THREE.MeshStandardMaterial({color,roughness});
 const skin=mat(0xbd8056),coat=mat(0xd69c46),dark=mat(0x283d37),hair=mat(0x26231f),shoe=mat(0x262725),pack=mat(0x744a35),cream=mat(0xffe9c7),eyes=mat(0x221d1b);
 const mesh=(geo,material,parent=rig,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;};
 const body=new THREE.Group();rig.add(body);
 mesh(new THREE.CapsuleGeometry(.24,.42,5,10),coat,body,0,1.06,0);
 mesh(new THREE.SphereGeometry(.255,16,12),skin,body,0,1.65,.01);
 const cap=mesh(new THREE.SphereGeometry(.265,16,8,0,Math.PI*2,0,Math.PI*.57),hair,body,0,1.69,0);cap.rotation.x=-.12;
 mesh(new THREE.SphereGeometry(.06,8,6),skin,body,0,1.64,.245);
 for(const x of [-.088,.088])mesh(new THREE.SphereGeometry(.023,8,6),eyes,body,x,1.69,.238);
 mesh(new THREE.BoxGeometry(.36,.48,.18),pack,body,0,1.07,-.26);
 for(const x of [-.16,.16])mesh(new THREE.BoxGeometry(.045,.46,.035),pack,body,x,1.12,.235);
 mesh(new THREE.BoxGeometry(.09,.11,.025),cream,body,0,1.18,.262);
 const hips=[],knees=[],arms=[];
 for(const side of [-1,1]){
  const leg=new THREE.Group();leg.position.set(side*.13,.81,0);rig.add(leg);hips.push(leg);
  mesh(new THREE.CapsuleGeometry(.092,.23,4,8),dark,leg,0,-.16,0);
  const knee=new THREE.Group();knee.position.y=-.35;leg.add(knee);knees.push(knee);
  mesh(new THREE.CapsuleGeometry(.078,.22,4,8),dark,knee,0,-.15,0);
  mesh(new THREE.BoxGeometry(.19,.12,.31),shoe,knee,0,-.33,.067);
  const arm=new THREE.Group();arm.position.set(side*.31,1.32,0);body.add(arm);arms.push(arm);
  mesh(new THREE.CapsuleGeometry(.082,.29,4,8),coat,arm,0,-.18,0);
  mesh(new THREE.SphereGeometry(.084,10,8),skin,arm,0,-.42,0);
 }
 const lantern=new THREE.Group();lantern.position.set(0,-.56,0);arms[1].add(lantern);
 mesh(new THREE.TorusGeometry(.075,.012,6,12),hair,lantern,0,.11,0);
 mesh(new THREE.CylinderGeometry(.09,.08,.16,8),mat(0xffc866),lantern);
 for(const y of [-.09,.09])mesh(new THREE.CylinderGeometry(.105,.105,.025,8),hair,lantern,0,y,0);
 const world=new THREE.Group();world.visible=false;scene.add(world);
 const routeFloor=new THREE.MeshStandardMaterial({color:0x364e43,roughness:.95});
 const floorGroups=new Map();for(const n of [1,2,3]){const g=new THREE.Group();floorGroups.set(n,g);world.add(g);}
 function setFloor(n){for(const [level,g] of floorGroups)g.visible=level===n;}
 const edges=new Set(),allPaths=[{floor:1,points:LOBBY_PATH},...Object.values(ROUTES)];
 const v=p=>new THREE.Vector3(p.x,p.y,p.z),smooth=t=>t*t*(3-2*t);
 for(const route of allPaths){
  for(let i=1;i<route.points.length;i++){
   const a=worldPoint(route.points[i-1],route.floor),b=worldPoint(route.points[i],route.floor),key=route.floor+':'+[route.points[i-1].join(','),route.points[i].join(',')].sort().join('|');if(edges.has(key))continue;edges.add(key);
   const length=Math.hypot(b.x-a.x,b.z-a.z),strip=new THREE.Mesh(new THREE.BoxGeometry(2.2,.12,length+.12),routeFloor);strip.position.set((a.x+b.x)/2,a.y-.09,(a.z+b.z)/2);strip.rotation.y=Math.atan2(b.x-a.x,b.z-a.z);strip.receiveShadow=true;floorGroups.get(route.floor).add(strip);
   const outline=new THREE.LineSegments(new THREE.EdgesGeometry(strip.geometry),new THREE.LineBasicMaterial({color:0xc9ad7e,transparent:true,opacity:.23}));outline.position.copy(strip.position);outline.rotation.copy(strip.rotation);floorGroups.get(route.floor).add(outline);
  }
 }
 const cab=new THREE.Group();world.add(cab);
 mesh(new THREE.BoxGeometry(2.2,.12,2.2),mat(0x8b958c),cab,0,-.05,0).receiveShadow=true;
 const metal=mat(0x9fa89e,.45),glass=new THREE.MeshStandardMaterial({color:0x819d8e,transparent:true,opacity:.17,roughness:.3});
 for(const x of [-1.05,1.05])for(const z of [-1.05,1.05])mesh(new THREE.BoxGeometry(.06,2.55,.06),metal,cab,x,1.25,z);
 for(const z of [-1.08,1.08])mesh(new THREE.BoxGeometry(2.12,2.5,.035),glass,cab,0,1.25,z);
 const doorGlass=new THREE.MeshStandardMaterial({color:0xb5c4b7,transparent:true,opacity:.27,roughness:.45});
 const east=[],west=[];for(const sign of [-1,1]){east.push(mesh(new THREE.BoxGeometry(.035,2.45,1.06),doorGlass,cab,1.08,1.2,sign*.54));west.push(mesh(new THREE.BoxGeometry(.035,2.45,1.06),doorGlass,cab,-1.08,1.2,sign*.54));}
 function doorOpen(side,amount){side.forEach((d,i)=>d.position.z=(i?1:-1)*(.54+amount*1.08));}
 doorOpen(east,1);doorOpen(west,0);
 const portal=new THREE.Group();world.add(portal);const gold=mat(0xd7ba82,.6);
 for(const x of [-.83,.83])mesh(new THREE.BoxGeometry(.07,2.55,.12),gold,portal,x,1.25,0);mesh(new THREE.BoxGeometry(1.72,.08,.12),gold,portal,0,2.55,0);
 const signCanvas=document.createElement('canvas');signCanvas.width=256;signCanvas.height=96;const ctx=signCanvas.getContext('2d'),signTexture=new THREE.CanvasTexture(signCanvas);signTexture.colorSpace=THREE.SRGBColorSpace;mesh(new THREE.PlaneGeometry(1.3,.48),new THREE.MeshBasicMaterial({map:signTexture,transparent:true}),portal,0,2.14,.02);
 let alive=true,raf,previous=performance.now(),elapsed=0,mode='companion',screen=[...position],target=[...position],direction=[0,0],moving=false,motion=null,listener=null,gesture=0,show=true;
 const plane=new THREE.Plane(new THREE.Vector3(0,1,0),0),ray=new THREE.Raycaster();
 function groundPoint(p){ray.setFromCamera(new THREE.Vector2(p[0]*2-1,1-p[1]*2),camera);return ray.ray.intersectPlane(plane,new THREE.Vector3())||new THREE.Vector3();}
 function overlayCamera(){camera.position.set(0,7,12);camera.lookAt(0,.2,0);camera.updateMatrixWorld();}
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();if(mode==='companion')rig.position.copy(groundPoint(screen));}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();rig.position.copy(groundPoint(screen));rig.rotation.y=-.2;
 function walkPose(t,strength=1){hips.forEach((l,i)=>l.rotation.x=Math.sin(t+i*Math.PI)*.55*strength);knees.forEach((k,i)=>k.rotation.x=Math.max(0,-Math.sin(t+i*Math.PI))*.6*strength);arms.forEach((a,i)=>{a.rotation.z=0;a.rotation.x=-Math.sin(t+i*Math.PI)*.42*strength});body.position.y=Math.abs(Math.sin(t))*.025*strength;body.rotation.x=.04*strength;}
 function standPose(){hips.forEach(l=>l.rotation.x=0);knees.forEach(k=>k.rotation.x=0);arms.forEach(a=>{a.rotation.x=0;a.rotation.z=0});body.rotation.x=0;body.position.y=Math.sin(elapsed*2)*.01;}
 function pathData(points){const lengths=points.slice(1).map((p,i)=>v(p).distanceTo(v(points[i])));return {points,lengths,total:lengths.reduce((a,b)=>a+b,0)};}
 function beginStep(index){if(!motion)return;motion.index=index;motion.time=0;motion.distance=0;const step=motion.route.steps[index];motion.path=pathData(step.points);setFloor(index===2?motion.route.floor:1);motion.callbacks.phase(index,step,motion.route);if(step.type==='elevator'){doorOpen(east,1);doorOpen(west,0);}}
 function followCamera(dt,forward){const behind=forward.clone().multiplyScalar(-6.2);const desired=rig.position.clone().add(behind).add(new THREE.Vector3(0,4.8,0));camera.position.lerp(desired,1-Math.exp(-dt*5));camera.lookAt(rig.position.clone().add(new THREE.Vector3(0,.95,0)));}
 function advanceTravel(wall,dt){if(!motion)return;const step=motion.route.steps[motion.index],sim=wall*2;motion.time+=sim;
  if(step.type==='walk'){
   const old=rig.position.clone();motion.distance=Math.min(motion.distance+sim*1.5,motion.path.total);let acc=0,i=0;for(;i<motion.path.lengths.length-1&&acc+motion.path.lengths[i]<motion.distance;i++)acc+=motion.path.lengths[i];
   const a=v(motion.path.points[i]),b=v(motion.path.points[i+1]),f=(motion.distance-acc)/(motion.path.lengths[i]||1);rig.position.lerpVectors(a,b,Math.min(f,1));const forward=b.clone().sub(a).normalize(),yaw=Math.atan2(forward.x,forward.z);rig.rotation.y+=Math.atan2(Math.sin(yaw-rig.rotation.y),Math.cos(yaw-rig.rotation.y))*Math.min(1,dt*10);walkPose(motion.distance*4);followCamera(dt,forward);
   if(motion.distance>=motion.path.total){if(motion.index===0)beginStep(1);else{mode='waiting';standPose();motion.callbacks.door(motion.route);}}
  }else{
   standPose();const liftTime=1.2+Math.abs(step.to-step.from)*2.8,t=motion.time;
   if(t<.55){doorOpen(east,1-smooth(t/.55));}
   else if(t<.55+liftTime){doorOpen(east,0);const f=smooth((t-.55)/liftTime);rig.position.lerpVectors(v(step.points[0]),v(step.points[1]),f);cab.position.y=rig.position.y;}
   else{setFloor(step.to);rig.position.copy(v(step.points[1]));cab.position.y=rig.position.y;doorOpen(west,smooth(Math.min((t-.55-liftTime)/.55,1)));if(t>.55+liftTime+.75)beginStep(2);}
   followCamera(dt,new THREE.Vector3(-1,0,0));
  }
 }
 function animate(now){if(!alive)return;const wall=Math.max(0,(now-previous)/1000),dt=Math.min(wall,.05);previous=now;elapsed+=wall;
  if(mode==='travel'){advanceTravel(wall,dt);if(motion&&mode==='travel')motion.callbacks.position?.(rig.position,motion.route);}else if(mode==='waiting')standPose();else{
   if(direction[0]||direction[1])target=[Math.min(.95,Math.max(.05,screen[0]+direction[0]*dt*.13)),Math.min(.95,Math.max(.37,screen[1]+direction[1]*dt*.13))];
   const dx=target[0]-screen[0],dy=target[1]-screen[1],distance=Math.hypot(dx,dy);moving=distance>.001;
   if(moving){const speed=Math.min(distance,dt*.17),old=rig.position.clone();screen=[screen[0]+dx/distance*speed,screen[1]+dy/distance*speed];rig.position.copy(groundPoint(screen));const d=rig.position.clone().sub(old),yaw=Math.atan2(d.x,d.z);rig.rotation.y+=Math.atan2(Math.sin(yaw-rig.rotation.y),Math.cos(yaw-rig.rotation.y))*Math.min(1,dt*12);walkPose(elapsed*11);}else standPose();
   if(gesture>0){gesture-=dt;arms[1].rotation.z=-.7*Math.sin(Math.min(gesture,1)*Math.PI);}
   listener?.(screen,moving);
  }
  if(!alive)return;if(show)renderer.render(scene,camera);raf=requestAnimationFrame(animate);
 }
 raf=requestAnimationFrame(animate);
 return {
  navigate(number,callbacks){const route=journeyFor(number);if(!route)return false;mode='travel';world.visible=true;motion={route,callbacks,index:0,time:0,distance:0};ground.visible=false;rig.position.copy(v(route.steps[0].points[0]));cab.position.set(0,0,0);doorOpen(east,1);doorOpen(west,0);
   const path=route.steps[2].points,end=v(path.at(-1)),prev=v(path.at(-2)),toward=prev.clone().sub(end);portal.position.copy(end);portal.rotation.y=Math.atan2(toward.x,toward.z);ctx.clearRect(0,0,256,96);ctx.fillStyle='#f2d8ac';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='48px Georgia';ctx.fillText('Room '+number,128,48);signTexture.needsUpdate=true;
   const firstForward=v(route.steps[0].points[1]).sub(rig.position).normalize();camera.position.copy(rig.position.clone().sub(firstForward.multiplyScalar(7)).add(new THREE.Vector3(0,5,0)));camera.lookAt(rig.position.clone().add(new THREE.Vector3(0,1,0)));beginStep(0);return true;
  },skip(){if(!motion)return;mode='waiting';const end=v(motion.route.steps[2].points.at(-1));rig.position.copy(end);setFloor(motion.route.floor);camera.position.copy(end.clone().add(new THREE.Vector3(0,5,7)));camera.lookAt(end.clone().add(new THREE.Vector3(0,1,0)));motion.callbacks.door(motion.route);
  },companion(next=position){mode='companion';motion=null;world.visible=false;ground.visible=true;ground.position.y=0;screen=[...next];target=[...next];direction=[0,0];overlayCamera();rig.position.copy(groundPoint(screen));rig.rotation.y=-.2;},
  target(p){if(mode==='companion')target=[Math.min(.95,Math.max(.05,p[0])),Math.min(.95,Math.max(.37,p[1]))];},
  direction(x,y){direction=[x,y];},listen(fn){listener=fn;listener?.(screen,false);},react(){gesture=1;},visible(value){show=value;host.style.visibility=value?'visible':'hidden';},
  dispose(){alive=false;cancelAnimationFrame(raf);observer.disconnect();scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();});signTexture.dispose();sun.shadow.dispose();renderer.forceContextLoss();renderer.dispose();renderer.domElement.remove();}
 };
}
