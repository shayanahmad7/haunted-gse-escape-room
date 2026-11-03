import test from 'node:test';
import assert from 'node:assert/strict';
import {isWalkable,clearSegment,moveAndSlide,findPath,createWalker,REFERENCE_ASPECT,toScreen,fromScreen} from './dist/lobby-navigation.js';

test('a held forward movement stops in front of the sofa, even with a large step',()=>{
 const stopped=moveAndSlide([.48,.88],[0,-.6]);
 assert.ok(isWalkable(stopped));assert.ok(stopped[1]>=.73);assert.ok(stopped[1]<.75);
 assert.equal(isWalkable([.48,.6]),false);
});
test('dragging to the other aisle finds a route around furniture with no intersecting segment',()=>{
 const start=[.30,.65],goal=[.68,.73];assert.ok(isWalkable(start));assert.ok(isWalkable(goal));
 assert.equal(clearSegment(start,goal),false);
 const path=findPath(start,goal);assert.ok(path.length>=2);let previous=start;
 for(const p of path){assert.ok(clearSegment(previous,p));previous=p;}
 assert.deepEqual(path.at(-1),goal);
});
test('a destination inside furniture resolves to reachable floor',()=>{
 const start=[.48,.88],path=findPath(start,[.48,.5]);assert.ok(path.length);let previous=start;
 for(const p of path){assert.ok(isWalkable(p));assert.ok(clearSegment(previous,p));previous=p;}
});
test('continuous keyboard motion stays on the floor, slides along boundaries, and stops',()=>{
 const w=createWalker();w.direction(-1,-1);
 for(let i=0;i<1000;i++){const s=w.step(1/60);assert.ok(isWalkable(fromScreen(s.position,REFERENCE_ASPECT)));}
 w.stop();const p=w.position();for(let i=0;i<20;i++)w.step(1/60);assert.deepEqual(w.position(),p);
});
test('a drag route completes without tunnelling, and a keyboard press cancels it',()=>{
 const w=createWalker([.30,.65]);w.target([.68,.73]);
 for(let i=0;i<1200;i++){const old=w.position();w.step(1/60);assert.ok(clearSegment(old,w.position()));}
 assert.ok(Math.hypot(...w.position().map((x,i)=>x-[.68,.73][i]))<.012);
 w.target([.30,.65]);w.direction(0,1);const before=w.position();for(let i=0;i<20;i++)w.step(1/60);assert.ok(w.position()[1]>before[1]);
});
test('projection aligns boundaries after resizing, including a narrow viewport',()=>{
 for(const aspect of [.6,1,2.45,3]){const p=[.5,.88];assert.deepEqual(fromScreen(toScreen(p,aspect),aspect),p);const w=createWalker();w.resize(aspect);w.direction(1,-1);for(let i=0;i<500;i++){const s=w.step(1/60);assert.ok(isWalkable(fromScreen(s.position,aspect),aspect));assert.ok(s.position[0]>0&&s.position[0]<1);}}
});
