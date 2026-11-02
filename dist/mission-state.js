export const ROOMS = Object.freeze([
  {number:'202',floor:'Second floor',scene:'2172808776652954468',door:'2172808776652953444'},
  {number:'259',floor:'Second floor',scene:'2172808777328244580',door:'2172808777328243556'},
  {number:'322',floor:'Third floor',scene:'2172833417509471076',door:'2173339308407128741'},
  {number:'355',floor:'Third floor',scene:'2172833417559802724',door:'2173344510371693221'},
  {number:'357',floor:'Third floor',scene:'2172833417744352100',door:'2173641636301505189',optional:true,unlockAfter:2}
]);
export const STORAGE_KEY='haunted-gse-five-missions-v1';
export function validProgress(value){return [...new Set(Array.isArray(value)?value:[])].filter(n=>ROOMS.some(r=>r.number===n));}
export const REQUIRED_ROOMS=Object.freeze(ROOMS.filter(r=>!r.optional));
export function requiredCompletedCount(solved){return validProgress(solved).filter(n=>REQUIRED_ROOMS.some(r=>r.number===n)).length;}
export function requiredRemaining(solved){const done=validProgress(solved);return REQUIRED_ROOMS.filter(r=>!done.includes(r.number));}
export function isRoomUnlocked(number,solved){const room=ROOMS.find(r=>r.number===number);return !!room&&validProgress(solved).length>=(room.unlockAfter||0);}
export function canEnterRoom(number,solved){return isRoomUnlocked(number,solved)&&!validProgress(solved).includes(number);}
export function canEscape(solved){return requiredRemaining(solved).length===0;}
export function parseRoomMessage(value){if(typeof value==='string'){try{return JSON.parse(value)}catch{return null}}return value&&typeof value==='object'?value:null;}
export function isRoomOrigin(origin){return origin==='https://www.thinglink.com'||origin==='https://thinglink.com';}
export function createDoorTracker(room){let completed=false;return {observe(value){const m=parseRoomMessage(value);if(completed||!m)return false;if(m.action==='TL_STAT'&&m.event==='tag.action'&&String(m.scene?.id)===room.scene&&String(m.tag?.id)===room.door&&m.tag?.type==='transition'){completed=true;return true}return false;}};}
