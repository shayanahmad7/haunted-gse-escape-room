// Visible-floor maps calibrated against fixed views of the existing photographs.
const facing=(u,pitch=-.22)=>[Math.cos((u-.5)*Math.PI*2),pitch,Math.sin((u-.5)*Math.PI*2)];
export const ROOM_WALKING={
 '202':{look:facing(.61),spawn:[.5,.84],floor:[[.05,.85],[.30,.95],[.78,.95],[.78,.83],[.67,.62],[.63,.55],[.40,.54],[.22,.67],[.05,.77]],obstacles:[[[.46,.20],[.655,.20],[.65,.73],[.50,.75],[.46,.64]],[[.28,.28],[.41,.28],[.41,.70],[.28,.70]]]},
 '259':{look:facing(.30),spawn:[.5,.88],floor:[[.31,.96],[.62,.96],[.57,.68],[.51,.50],[.48,.49],[.35,.60],[.30,.70]],obstacles:[[[.29,.61],[.46,.61],[.47,.90],[.30,.90]]]},
 '322':{look:facing(.30,-.05),spawn:[.5,.90],floor:[[.30,.96],[.75,.96],[.67,.74],[.61,.60],[.41,.60],[.36,.74]],obstacles:[[[.44,.53],[.61,.53],[.625,.80],[.45,.80]]]},
 '355':{look:facing(.50),spawn:[.5,.88],floor:[[.31,.96],[.72,.96],[.71,.70],[.66,.61],[.53,.57],[.35,.61],[.31,.80]],obstacles:[[[.35,.24],[.50,.24],[.50,.76],[.37,.77]],[[.49,.72],[.56,.72],[.56,.80],[.49,.80]]]},
 '357':{look:facing(.72),spawn:[.54,.88],floor:[[.38,.965],[.72,.965],[.71,.78],[.64,.64],[.61,.53],[.50,.53],[.47,.64],[.42,.77]],obstacles:[[[.32,.38],[.48,.38],[.48,.65],[.45,.73],[.36,.73]]]}
};
export function roomWalkingOptions(number){const map=ROOM_WALKING[number];return map?{texture:'./assets/room-'+number+'-panorama.jpg',look:map.look,position:map.spawn,layout:map}:null;}
