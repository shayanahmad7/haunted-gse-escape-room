import {createLobbyCharacter} from './lobby-character.js';
import {ROOMS,STORAGE_KEY,validProgress,canEscape,isRoomOrigin,parseRoomMessage,createDoorTracker} from './mission-state.js';
const app=document.getElementById('app');
const lobbyScene='2172808776581645156';
let solved=[];try{solved=validProgress(JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'));}catch{}
let view='board',active=null,lastCompleted=null,lastLeft=null,roomFrame=null,lobbyFrame=null,tracker=null,loadTimeout,character=null,pendingRoom=null,journey=null;
const lock='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';
const arrow='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg>';
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(solved));}catch{}}
function roomUrl(id){return 'https://www.thinglink.com/view/scene/'+id+'?lang=en&embed=1';}
function progress(){return '<div class="progress" aria-label="'+solved.length+' of 5 missions complete"><span class="progress-count">'+solved.length+' <span>/ 5</span></span><div class="progress-lights">'+ROOMS.map(r=>'<i class="'+(solved.includes(r.number)?'lit':'')+'" title="Room '+r.number+(solved.includes(r.number)?' complete':' remaining')+'"></i>').join('')+'</div><span class="progress-caption">missions complete</span></div>';}
function header(){return '<header class="topbar"><a class="brand" href="#" aria-label="Return to GSE lobby"><span>HAUNTED</span><strong>GSE</strong></a><div class="header-right">'+progress()+(view==='room'?'<button class="text-button" id="board-button" title="Leave this room unsolved and return to the lobby. You can try it again later.">Return to lobby '+arrow+'</button>':'<span class="exit-status '+(canEscape(solved)?'is-open':'')+'">'+lock+(canEscape(solved)?'Exit unlocked':'Exit locked')+'</span>')+'</div></header>';}
function loading(label){return '<div class="room-loading" role="status"><span class="loading-dot"></span><p>'+label+'</p><button id="reload-scene" class="text-button" hidden>Reload scene</button></div>';}
function watchLoading(){loadTimeout=setTimeout(()=>{const el=document.querySelector('.room-loading');if(el){el.querySelector('p').textContent='The scene is taking a moment to load.';document.getElementById('reload-scene').hidden=false;}},18000);document.getElementById('reload-scene').onclick=render;}
function render(){if(journey)clearTimeout(journey.timeout);journey=null;character?.dispose();character=null;pendingRoom=null;clearTimeout(loadTimeout);roomFrame=null;lobbyFrame=null;tracker=null;app.className='view-'+view;
if(view==='room'){
app.innerHTML=header()+'<main class="room-stage"><div class="room-label"><span>MISSION</span><h1>Room '+active.number+'</h1></div>'+loading('Entering Room '+active.number+'…')+'<iframe id="mission-room" title="Room '+active.number+' puzzle" src="'+roomUrl(active.scene)+'" allow="autoplay"></iframe></main>';
roomFrame=document.getElementById('mission-room');tracker=createDoorTracker(active);watchLoading();document.getElementById('board-button').onclick=leaveRoom;
}else if(view==='finish'){
app.innerHTML='<iframe class="backdrop" title="GSE lobby" tabindex="-1" aria-hidden="true" src="'+roomUrl(lobbyScene)+'"></iframe><div class="shade"></div>'+header()+'<main class="finish content-enter"><div class="eyebrow">ALL FIVE MISSIONS COMPLETE</div><div class="escape-mark">'+arrow+'</div><h1>You made<br>it out.</h1><p>The doors swing open. You solved every mystery and escaped Haunted GSE. Congratulations!</p><div class="finished-rooms">'+ROOMS.map(r=>'<span>✓ '+r.number+'</span>').join('')+'</div><button class="primary" id="new-attempt">Start a new escape '+arrow+'</button></main>';
document.getElementById('new-attempt').onclick=newAttempt;
}else{
const left=ROOMS.filter(r=>!solved.includes(r.number)),allDone=canEscape(solved);
const notice=allDone?'All five rooms cleared. The main exit is open.':lastCompleted?'Room '+lastCompleted+' cleared. Choose your next mission.':lastLeft?'Room '+lastLeft+' is still unsolved. Try another room, or return to it later.':'Solve five missions to unlock the main exit. You can switch rooms whenever you get stuck.';
app.innerHTML=header()+'<main class="lobby-stage"><iframe id="lobby-scene" title="Explore the GSE study-room lobby in 360 degrees" src="'+roomUrl(lobbyScene)+'" allow="autoplay"></iframe>'+'<div id="lobby-character" class="lobby-character" aria-hidden="true"></div><div class="walk-status" hidden><span class="walking-light"></span><span id="walk-label" role="status"></span><button class="text-button" id="cancel-walk">Cancel</button></div>'+loading('Entering the GSE lobby…')+'<section class="lobby-welcome content-enter"><span class="eyebrow">YOUR ESCAPE STARTS HERE</span><h1>Study-room lobby</h1><p id="lobby-notice" role="status">'+notice+'</p><span class="lobby-look">Choose a room to walk, fly to its floor, and land inside. Drag to look around.</span></section><section class="lobby-directory" aria-label="Lobby room directory"><div class="directory-heading"><div><span class="eyebrow">ROOM DIRECTORY</span><h2>'+(allDone?'Every mission complete':'Choose your next room')+'</h2></div><button class="text-button" id="toggle-directory" aria-expanded="true" aria-controls="directory-options">Hide directory</button></div><div id="directory-options"><div class="lobby-rooms">'+ROOMS.map(r=>{const done=solved.includes(r.number);return '<button class="lobby-room '+(done?'is-cleared':'')+'" data-room="'+r.number+'" '+(done?'disabled':'')+' aria-label="Room '+r.number+', '+r.floor+(done?', cleared':', enter mission')+'"><span class="lobby-room-top">'+r.floor+(done?'<span class="room-tick" aria-hidden="true">✓</span>':arrow)+'</span><strong>'+r.number+'</strong><span class="room-state">'+(done?'Cleared':'Enter room')+'</span></button>';}).join('')+'</div><div class="directory-bottom"><span>10 minutes · Follow the presentation timer.</span><div class="lobby-exit"><span>'+(allDone?'Ready to escape':left.length+' '+(left.length===1?'mission':'missions')+' remaining')+'</span><button id="escape" class="primary '+(allDone?'':'locked')+'" '+(allDone?'':'disabled')+'>'+(allDone?'Leave GSE '+arrow:lock+' Main exit locked')+'</button></div></div></div></section><button class="lobby-reset text-button" id="new-attempt">New attempt</button></main>';
lobbyFrame=document.getElementById('lobby-scene');character=createLobbyCharacter(document.getElementById('lobby-character'));document.getElementById('cancel-walk').onclick=()=>render();watchLoading();app.querySelectorAll('[data-room]').forEach(b=>b.onclick=()=>walkToRoom(b.dataset.room));document.getElementById('escape').onclick=()=>{if(canEscape(solved)){view='finish';lastCompleted=null;render()}};document.getElementById('new-attempt').onclick=newAttempt;
document.getElementById('toggle-directory').onclick=()=>{const button=document.getElementById('toggle-directory'),options=document.getElementById('directory-options');options.hidden=!options.hidden;button.setAttribute('aria-expanded',String(!options.hidden));button.textContent=options.hidden?'Choose a room':'Hide directory';};
}
app.querySelector('.brand').onclick=e=>{e.preventDefault();if(pendingRoom)render();else if(view==='room')leaveRoom();else if(view==='finish'){view='board';render()}};
}
function leaveRoom(){lastLeft=active?.number??null;view='board';active=null;lastCompleted=null;render();}
function journeyPhase(stage,text){
if(!journey)return;journey.stage=stage;document.querySelector('.lobby-stage').dataset.journeyStage=stage;document.getElementById('walk-label').textContent=text;
document.querySelectorAll('[data-journey-step]').forEach(el=>{el.classList.toggle('current',el.dataset.journeyStep===stage)});
}
function walkToRoom(number){
if(pendingRoom||!ROOMS.some(r=>r.number===number)||solved.includes(number))return;
if(!character){enterRoom(number);return;}
const room=ROOMS.find(r=>r.number===number),floor=number.startsWith('2')?2:3,stage=document.querySelector('.lobby-stage');
pendingRoom=number;app.classList.add('is-walking');document.querySelector('.walk-status').hidden=false;app.querySelectorAll('[data-room]').forEach(b=>b.disabled=true);
const frame=document.createElement('iframe');frame.id='journey-room';frame.className='journey-destination';frame.title='Arriving at Room '+number;frame.setAttribute('aria-hidden','true');frame.setAttribute('tabindex','-1');frame.setAttribute('allow','autoplay');frame.src=roomUrl(room.scene);stage.append(frame);
journey={room,floor,frame,ready:false,stage:'walk',timeout:null};
const veil=document.createElement('div');veil.className='flight-veil';stage.append(veil);
const panel=document.createElement('section');panel.className='journey-panel';panel.setAttribute('aria-label','Journey to Room '+number);panel.innerHTML='<span class="eyebrow">HALLOWEEN FLIGHT</span><h2>Room '+number+'</h2><ol><li data-journey-step="walk">Leave the lobby</li><li data-journey-step="fly">Fly to floor '+floor+'</li><li data-journey-step="land">Land inside Room '+number+'</li></ol><button class="text-button" id="retry-arrival" hidden>Reload destination room</button>';stage.append(panel);
document.getElementById('retry-arrival').onclick=()=>{if(journey){journey.ready=false;journey.frame.src=roomUrl(journey.room.scene);document.getElementById('retry-arrival').hidden=true;}};
journeyPhase('walk','Leaving the lobby for Room '+number+'…');
character.walkTo(number,()=>{
 if(!journey)return;app.classList.add('is-flying');journeyPhase('fly','Flying up to floor '+floor+'…');
 character.flyToFloor(floor,()=>{
  if(!journey)return;journey.stage='hover';
  if(journey.ready)landInRoom();else{document.getElementById('walk-label').textContent='At floor '+floor+'. Waiting for Room '+number+' to load…';journey.timeout=setTimeout(()=>{if(journey)document.getElementById('retry-arrival').hidden=false;},12000);}
 },finishJourney,number);
},1.4);
}
function landInRoom(){if(!journey||journey.stage!=='hover'||!journey.ready)return;clearTimeout(journey.timeout);journeyPhase('land','Landing inside Room '+journey.room.number+'…');journey.frame.classList.add('revealed');app.classList.add('is-landing');character.land();}
function finishJourney(){
if(!journey)return;const {room,frame}=journey;clearTimeout(journey.timeout);journey=null;character?.dispose();character=null;pendingRoom=null;
active=room;lastCompleted=null;lastLeft=null;view='room';roomFrame=frame;lobbyFrame=null;tracker=createDoorTracker(room);app.className='view-room';
const stage=document.querySelector('.lobby-stage');for(const child of [...stage.children])if(child!==frame)child.remove();stage.className='room-stage';delete stage.dataset.journeyStage;
frame.id='mission-room';frame.className='';frame.title='Room '+room.number+' puzzle';frame.removeAttribute('aria-hidden');frame.removeAttribute('tabindex');
stage.insertAdjacentHTML('afterbegin','<div class="room-label"><span>MISSION</span><h1>Room '+room.number+'</h1></div>');app.querySelector('.topbar').outerHTML=header();document.getElementById('board-button').onclick=leaveRoom;app.querySelector('.brand').onclick=e=>{e.preventDefault();leaveRoom()};
}
function enterRoom(number){const room=ROOMS.find(r=>r.number===number);if(!room||solved.includes(number))return;active=room;lastCompleted=null;lastLeft=null;view='room';render();}
function newAttempt(){const dialog=document.createElement('dialog');dialog.className='reset-dialog';dialog.innerHTML='<h2>Start a new escape?</h2><p>This clears the completed missions on this browser.</p><div><button class="text-button" id="keep-progress">Keep my progress</button><button class="primary" id="reset-progress">Start again</button></div>';document.body.append(dialog);dialog.showModal();dialog.querySelector('#keep-progress').onclick=()=>dialog.close();dialog.querySelector('#reset-progress').onclick=()=>{solved=[];save();active=null;lastCompleted=null;lastLeft=null;view='board';dialog.close();render()};dialog.onclose=()=>dialog.remove();}
function sceneViewed(m,id){return (m.action==='scene.view'&&String(m.sceneId)===id)||(m.action==='TL_STAT'&&m.event==='scene.view'&&String(m.scene?.id)===id);}
window.addEventListener('message',event=>{
if(!isRoomOrigin(event.origin))return;const message=parseRoomMessage(event.data);if(!message)return;
if(journey&&event.source===journey.frame.contentWindow){if(sceneViewed(message,journey.room.scene)){journey.ready=true;if(journey.stage==='hover')landInRoom();}return;}
if(view==='board'&&lobbyFrame&&event.source===lobbyFrame.contentWindow){if(sceneViewed(message,lobbyScene)){clearTimeout(loadTimeout);document.querySelector('.room-loading')?.remove();}return;}
if(view!=='room'||!active||!roomFrame||event.source!==roomFrame.contentWindow)return;
if(sceneViewed(message,active.scene)){clearTimeout(loadTimeout);document.querySelector('.room-loading')?.remove();}
if(tracker.observe(message)){const completed=active.number;solved=validProgress([...solved,completed]);save();lastCompleted=completed;lastLeft=null;active=null;view='board';render();}
});
render();
