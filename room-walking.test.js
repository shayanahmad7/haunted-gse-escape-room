import test from 'node:test';
import assert from 'node:assert/strict';
import {ROOMS} from './dist/mission-state.js';
import {ROOM_WALKING,roomWalkingOptions} from './dist/room-walking.js';
import {createNavigation,createWalker,fromScreen} from './dist/lobby-navigation.js';

test('every mission has its own panorama and floor map',()=>{
 assert.deepEqual(Object.keys(ROOM_WALKING).sort(),ROOMS.map(r=>r.number).sort());
 const assets=new Set(ROOMS.map(r=>roomWalkingOptions(r.number).texture));assert.equal(assets.size,5);
});
for(const [number,map] of Object.entries(ROOM_WALKING)){
 test('Room '+number+' keeps continuous movement on mapped floor across viewport shapes',()=>{
  const nav=createNavigation(map);
  for(const aspect of [.6,1.5,2.45,3]){
   assert.ok(nav.isWalkable(map.spawn,aspect));
   for(const input of [[0,-1],[-1,-1],[1,-1],[1,0],[-1,0],[0,1]]){
    const w=createWalker(map.spawn,map);w.resize(aspect);w.direction(...input);
    for(let i=0;i<300;i++){const old=w.position(),state=w.step(1/60),p=fromScreen(state.position,aspect);assert.ok(nav.isWalkable(p,aspect));assert.ok(nav.clearSegment(old,p,aspect));}
   }
  }
 });
 test('Room '+number+' routes a drag away from furniture instead of entering it',()=>{
  const nav=createNavigation(map),prop=map.obstacles[0],blocked=prop.reduce((sum,p)=>sum.map((v,i)=>v+p[i]/prop.length),[0,0]);
  assert.equal(nav.isWalkable(blocked),false);
  const path=nav.findPath(map.spawn,blocked);assert.ok(path.length);let p=map.spawn;
  for(const next of path){assert.ok(nav.isWalkable(next));assert.ok(nav.clearSegment(p,next));p=next;}
 });
}
