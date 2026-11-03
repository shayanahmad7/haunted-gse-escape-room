import * as THREE from './vendor/three.module.js';
import {createWalker,fromScreen,toScreen} from './lobby-navigation.js?v=1.6.0';

// A lobby-only 3D mascot. Puzzle rooms use the original ThingLink viewer directly.
export function createLobbyCharacter(host,{position=[.48,.88],onReady=()=>{}}={}){
 let renderer;
 try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{return null;}
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
 renderer.setClearColor(0x000000,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.domElement.setAttribute('aria-hidden','true');host.append(renderer.domElement);
 const backdrop=new THREE.Scene(),backdropCamera=new THREE.PerspectiveCamera(70,1,.1,10);
 backdropCamera.lookAt(1,-.22,0);
 const panorama=new THREE.TextureLoader().load('./assets/gse-lobby-panorama.jpg',()=>{if(alive)onReady();});
 panorama.colorSpace=THREE.SRGBColorSpace;panorama.mapping=THREE.EquirectangularReflectionMapping;backdrop.background=panorama;
 renderer.autoClear=false;
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
 const walker=createWalker(position);
 let alive=true,raf,previous=performance.now(),elapsed=0,gait=0,screen=[...position],listener=null,show=true;
 const plane=new THREE.Plane(new THREE.Vector3(0,1,0),0),ray=new THREE.Raycaster();
 function groundPoint(p){ray.setFromCamera(new THREE.Vector2(p[0]*2-1,1-p[1]*2),camera);return ray.ray.intersectPlane(plane,new THREE.Vector3())||new THREE.Vector3();}
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();backdropCamera.aspect=w/h;backdropCamera.updateProjectionMatrix();walker.resize(w/h);screen=toScreen(walker.position(),w/h);rig.position.copy(groundPoint(screen));}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();rig.position.copy(groundPoint(screen));rig.rotation.y=-.2;
 function walkPose(t){hips.forEach((l,i)=>l.rotation.x=Math.sin(t+i*Math.PI)*.55);knees.forEach((k,i)=>k.rotation.x=Math.max(0,-Math.sin(t+i*Math.PI))*.6);arms.forEach((a,i)=>a.rotation.x=-Math.sin(t+i*Math.PI)*.42);body.position.y=Math.abs(Math.sin(t))*.025;body.rotation.x=.04;}
 function standPose(dt){const settle=Math.exp(-dt*14);hips.forEach(l=>l.rotation.x*=settle);knees.forEach(k=>k.rotation.x*=settle);arms.forEach(a=>a.rotation.x*=settle);body.rotation.x*=settle;body.position.y=body.position.y*settle+Math.sin(elapsed*2)*.008*(1-settle);}
 function animate(now){if(!alive)return;const wall=Math.max(0,(now-previous)/1000),dt=Math.min(wall,.05);previous=now;elapsed+=wall;
  const movement=walker.step(dt),old=rig.position.clone(),moving=movement.moving;screen=movement.position;rig.position.copy(groundPoint(screen));
  if(moving){const d=rig.position.clone().sub(old),yaw=Math.atan2(d.x,d.z);rig.rotation.y+=Math.atan2(Math.sin(yaw-rig.rotation.y),Math.cos(yaw-rig.rotation.y))*Math.min(1,dt*10);gait+=movement.travelled*31;walkPose(gait);}else standPose(dt);
  listener?.(screen,moving);rig.visible=show;renderer.clear();renderer.render(backdrop,backdropCamera);renderer.clearDepth();renderer.render(scene,camera);raf=requestAnimationFrame(animate);
 }
 raf=requestAnimationFrame(animate);
 return {
  snapshots(){
   renderer.clear();renderer.render(backdrop,backdropCamera);const background=renderer.domElement.toDataURL('image/webp',.85);
   ground.visible=false;rig.visible=show;renderer.clear();renderer.render(scene,camera);const explorer=renderer.domElement.toDataURL('image/webp',.9);ground.visible=true;
   renderer.clear();renderer.render(backdrop,backdropCamera);renderer.clearDepth();renderer.render(scene,camera);
   return {background,explorer,position:[...screen]};
  },
  target(p){walker.target(fromScreen(p,camera.aspect));},
  direction(x,y){walker.direction(x,y);},stop(){walker.stop();},listen(fn){listener=fn;listener?.(screen,false);},visible(value){show=value;},
  dispose(){alive=false;cancelAnimationFrame(raf);observer.disconnect();scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();});panorama.dispose();sun.shadow.dispose();renderer.forceContextLoss();renderer.dispose();renderer.domElement.remove();}
 };
}
