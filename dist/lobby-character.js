import * as THREE from './vendor/three.module.js';

// A real articulated 3D mesh rendered transparently over the photographic lobby.
// These are screen-space staging routes, not surveyed locations in the GSE building.
export const WALK_ROUTES=Object.freeze({
 '202':[[.48,.88],[.27,.90],[.17,.73],[.16,.57]],
 '259':[[.48,.88],[.29,.86],[.23,.72],[.24,.62]],
 '322':[[.48,.88],[.24,.91],[.12,.76],[.10,.64]],
 '355':[[.48,.88],[.58,.89],[.67,.78],[.68,.66]],
 '357':[[.48,.88],[.60,.88],[.69,.75],[.70,.56]]
});
export function createLobbyCharacter(host){
 let renderer;
 try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{return null;}
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
 renderer.setClearColor(0x000000,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.domElement.setAttribute('aria-hidden','true');host.append(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,1,.1,80);
 camera.position.set(0,7,12);camera.lookAt(0,.2,0);
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
 const beacon=new THREE.Mesh(new THREE.RingGeometry(.24,.32,40),new THREE.MeshBasicMaterial({color:0xffcf85,transparent:true,opacity:.9,side:THREE.DoubleSide}));beacon.rotation.x=-Math.PI/2;beacon.position.y=.012;beacon.visible=false;scene.add(beacon);
 const ray=new THREE.Raycaster(),floor=new THREE.Plane(new THREE.Vector3(0,1,0),0);
 let width=1,height=1,alive=true,raf,travel=null,flight=null,elapsed=0,previous=performance.now(),screenPosition=[.48,.88];
 function groundPoint(point){ray.setFromCamera(new THREE.Vector2(point[0]*2-1,1-point[1]*2),camera);return ray.ray.intersectPlane(floor,new THREE.Vector3())||new THREE.Vector3();}
 function place(point){screenPosition=point;rig.position.copy(groundPoint(point));}
 function resize(){width=host.clientWidth;height=host.clientHeight;if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();if(flight)return;if(!travel)screenPosition=width<=800?[.48,.52]:[.48,.88];place(screenPosition);if(travel)beacon.position.copy(groundPoint(travel.route.at(-1))).y=.012;}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();rig.rotation.y=-.3;
 const levels=new THREE.Group();levels.visible=false;scene.add(levels);
 for(let n=0;n<3;n++){
  const slab=new THREE.Mesh(new THREE.BoxGeometry(6.4,.055,6.4),new THREE.MeshStandardMaterial({color:0x728277,transparent:true,opacity:.09,roughness:.8}));slab.position.y=n*4;levels.add(slab);
  const ring=new THREE.Mesh(new THREE.RingGeometry(3.2,3.24,64),new THREE.MeshBasicMaterial({color:0xe7ba79,transparent:true,opacity:.35,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=n*4;levels.add(ring);
  const edge=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(6.4,.04,6.4)),new THREE.LineBasicMaterial({color:0xb29c71,transparent:true,opacity:.2}));edge.position.y=n*4;levels.add(edge);
 }
 const portal=new THREE.Group();portal.visible=false;scene.add(portal);
 const doorMaterial=new THREE.MeshStandardMaterial({color:0xe7ba79,emissive:0x9f662b,emissiveIntensity:.5,roughness:.5});
 for(const x of [-.86,.86])mesh(new THREE.BoxGeometry(.075,2.7,.12),doorMaterial,portal,x,1.35,0);
 mesh(new THREE.BoxGeometry(1.8,.08,.12),doorMaterial,portal,0,2.7,0);
 mesh(new THREE.PlaneGeometry(1.65,2.65),new THREE.MeshBasicMaterial({color:0x050e09,transparent:true,opacity:.85,side:THREE.DoubleSide}),portal,0,1.35,-.03);
 const signCanvas=document.createElement('canvas');signCanvas.width=256;signCanvas.height=96;const signContext=signCanvas.getContext('2d');const signTexture=new THREE.CanvasTexture(signCanvas);signTexture.colorSpace=THREE.SRGBColorSpace;
 mesh(new THREE.PlaneGeometry(1.25,.47),new THREE.MeshBasicMaterial({map:signTexture,transparent:true}),portal,0,2.25,.02);
 const smooth=t=>t*t*(3-2*t),reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 function flightPose(time){hips.forEach((l,i)=>l.rotation.x=-.18+Math.sin(time*3+i)*.08);knees.forEach(k=>k.rotation.x=.25);arms.forEach((a,i)=>{a.rotation.x=-.25;a.rotation.z=(i?1:-1)*(.75+Math.sin(time*3)*.06)});body.position.y=0;rig.rotation.y+=(0-rig.rotation.y)*.06;}
 function animate(now){if(!alive)return;const delta=Math.min((now-previous)/1000,.05);previous=now;elapsed+=delta;
  if(flight){
   flight.time+=delta;
   if(flight.phase==='ascent'){
    const t=Math.min(flight.time/flight.duration,1),f=smooth(t);
    rig.position.lerpVectors(flight.from,new THREE.Vector3(0,flight.height+1.05,0),f);rig.position.y+=Math.sin(t*Math.PI)*.45;
    const cameraTarget=rig.position.clone().add(new THREE.Vector3(0,4,11));camera.position.lerpVectors(flight.cameraFrom,cameraTarget,f);camera.lookAt(rig.position.clone().add(new THREE.Vector3(0,.8,0)));flightPose(elapsed);
    if(t===1){flight.phase='approach';flight.time=0;flight.from.copy(rig.position);flight.cameraFrom.copy(camera.position);flight.duration=reduced()?.2:1.5;ground.position.y=flight.height;ground.material.opacity=.2;}
   }else if(flight.phase==='approach'){
    const t=Math.min(flight.time/flight.duration,1),f=smooth(t);rig.position.lerpVectors(flight.from,new THREE.Vector3(0,flight.height,-2.55),f);rig.rotation.y=Math.PI;arms.forEach(a=>a.rotation.z=0);const gait=flight.time*10;hips.forEach((l,i)=>l.rotation.x=Math.sin(gait+i*Math.PI)*.4);knees.forEach((k,i)=>k.rotation.x=Math.max(0,-Math.sin(gait+i*Math.PI))*.4);arms.forEach((a,i)=>a.rotation.x=-Math.sin(gait+i*Math.PI)*.3);
    camera.position.lerpVectors(flight.cameraFrom,new THREE.Vector3(0,flight.height+3,6),f);camera.lookAt(0,flight.height+1,-2);
    if(t===1){flight.phase='hover';flight.time=0;flight.onApproach();}
   }else if(flight.phase==='hover'){
    rig.position.y=flight.height+Math.sin(elapsed*2)*.012;hips.forEach(l=>l.rotation.x=0);knees.forEach(k=>k.rotation.x=0);arms.forEach(a=>{a.rotation.x=0;a.rotation.z=0});
   }else{
    const t=Math.min(flight.time/flight.duration,1),f=smooth(t);
    place([.5,.58+.27*f]);rig.rotation.y=0;arms.forEach((a,i)=>{a.rotation.z=(i?1:-1)*.75*(1-f);a.rotation.x=0});hips.forEach(l=>l.rotation.x=0);knees.forEach(k=>k.rotation.x=Math.sin(t*Math.PI)*.25);body.position.y=-Math.sin(t*Math.PI)*.025;
    if(t===1){const done=flight.done;flight=null;ground.material.opacity=.28;done();}
   }
  }else if(travel){travel.time+=delta;const part=Math.min(travel.time/travel.duration,1),distance=part*travel.length;let acc=0,index=0;
   for(;index<travel.segments.length-1&&acc+travel.segments[index]<distance;index++)acc+=travel.segments[index];
   const a=travel.route[index],b=travel.route[index+1],f=Math.min((distance-acc)/travel.segments[index],1);
   const target=[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f],next=groundPoint(target),direction=next.clone().sub(rig.position);
   if(direction.lengthSq()>.000001){const yaw=Math.atan2(direction.x,direction.z);rig.rotation.y+=Math.atan2(Math.sin(yaw-rig.rotation.y),Math.cos(yaw-rig.rotation.y))*.2;}
   place(target);const gait=travel.time*11;hips.forEach((leg,i)=>leg.rotation.x=Math.sin(gait+i*Math.PI)*.6);knees.forEach((knee,i)=>knee.rotation.x=Math.max(0,-Math.sin(gait+i*Math.PI))*.65);arms.forEach((arm,i)=>arm.rotation.x=-Math.sin(gait+i*Math.PI)*.4);body.position.y=Math.abs(Math.sin(gait))*.035;
   beacon.scale.setScalar(1+Math.sin(elapsed*6)*.12);
   if(part===1){const done=travel.done;travel=null;beacon.visible=false;done();}
  }else{hips.forEach(l=>l.rotation.x=0);knees.forEach(k=>k.rotation.x=0);arms.forEach(a=>a.rotation.x=0);body.position.y=Math.sin(elapsed*2)*.013;rig.rotation.y+=Math.sin(elapsed)*.0006;}
  if(!alive)return;renderer.render(scene,camera);raf=requestAnimationFrame(animate);
 }
 raf=requestAnimationFrame(animate);
 return {walkTo(number,done,duration=2.8){if(travel||flight)return false;const route=WALK_ROUTES[number];if(!route)return false;const staged=[screenPosition,...route.slice(1)],segments=staged.slice(1).map((p,i)=>Math.hypot(p[0]-staged[i][0],p[1]-staged[i][1]));const length=segments.reduce((a,b)=>a+b,0);travel={route:staged,segments,length,time:0,duration:matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.25 : duration,done};beacon.position.copy(groundPoint(staged.at(-1))).y=.012;beacon.visible=true;return true;},flyToFloor(floor,onApproach,done,number){
 travel=null;beacon.visible=false;ground.material.opacity=0;levels.visible=true;portal.position.set(0,(floor-1)*4,-3);portal.visible=true;signContext.clearRect(0,0,256,96);signContext.fillStyle='#f3d9ad';signContext.textAlign='center';signContext.textBaseline='middle';signContext.font='52px Georgia';signContext.fillText('Room '+number,128,48);signTexture.needsUpdate=true;
 flight={phase:'ascent',time:0,height:(floor-1)*4,from:rig.position.clone(),cameraFrom:camera.position.clone(),duration:reduced()?.35:(floor===3?4:3),onApproach,done};
 },land(){if(!flight||flight.phase!=='hover')return;flight.phase='landing';flight.time=0;flight.duration=reduced()?.25:1.6;levels.visible=false;portal.visible=false;ground.position.y=0;camera.position.set(0,7,12);camera.lookAt(0,.2,0);place([.5,.58]);ground.material.opacity=.15;
 },dispose(){alive=false;cancelAnimationFrame(raf);observer.disconnect();scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();});signTexture.dispose();sun.shadow.dispose();renderer.forceContextLoss();renderer.dispose();renderer.domElement.remove();}};
}
