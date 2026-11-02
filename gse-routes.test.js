import test from 'node:test';
import assert from 'node:assert/strict';
import {journeyFor,worldPoint,ELEVATOR} from './dist/gse-routes.js';
import {ROOMS} from './dist/mission-state.js';
test('every mission uses a continuous route through the same elevator',()=>{
 for(const room of ROOMS){const route=journeyFor(room.number);assert.ok(route);const [lobby,lift,corridor]=route.steps;assert.deepEqual(lobby.points.at(-1),lift.points[0]);assert.deepEqual(lift.points.at(-1),corridor.points[0]);assert.equal(lift.points[0].x,lift.points[1].x);assert.equal(lift.points[0].z,lift.points[1].z);assert.ok(lift.points[1].y>lift.points[0].y);for(const walk of [lobby,corridor])assert.equal(new Set(walk.points.map(p=>p.y)).size,1);assert.equal(route.floor,Number(room.number[0]));}
});
test('the plan-based routes retain the correct destination wings and branching',()=>{
 assert.equal(journeyFor('202').area,'GSE');assert.equal(journeyFor('322').area,'GSE');for(const n of ['259','355','357'])assert.equal(journeyFor(n).area,'Stiteler Hall');
 const west=journeyFor('322').steps[2].points.at(-1),east=journeyFor('202').steps[2].points.at(-1),south=journeyFor('259').steps[2].points.at(-1);assert.ok(west.x<east.x);assert.ok(south.z>east.z);assert.ok(journeyFor('357').steps[2].points.at(-1).z>journeyFor('355').steps[2].points.at(-1).z);assert.equal(journeyFor('999'),null);assert.deepEqual(worldPoint(ELEVATOR,1),{x:0,y:0,z:0});
});
