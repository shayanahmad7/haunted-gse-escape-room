// Simplified corridor centerlines read from Penn GSE Complex Level 1/2/3 plans.
// Plan coordinates are reference pixels, not a published copy of the source PDFs.
// Ceiling heights and corridor widths in the 3D preview are illustrative.
export const ROUTE_SOURCES=Object.freeze({
 overview:'https://onepenn.gse.upenn.edu/facility-services/information-by-building',
 1:'https://upenn.box.com/v/gse-complex-first-floor',
 2:'https://upenn.box.com/v/gse-complex-second-floor',
 3:'https://upenn.box.com/v/gse-complex-third-floor'
});
export const ELEVATOR=Object.freeze([1240,865]);
export const LOBBY_PATH=Object.freeze([[1330,775],[1295,800],[1295,865],ELEVATOR]);
export const LEVEL_HEIGHT=3.5;
export const ROUTES=Object.freeze({
 '202':{floor:2,area:'GSE',points:[ELEVATOR,[1100,865],[1100,700],[1100,600],[1200,600],[1200,580]]},
 '259':{floor:2,area:'Stiteler Hall',points:[ELEVATOR,[1080,865],[1080,1510],[920,1510]]},
 '322':{floor:3,area:'GSE',points:[ELEVATOR,[1120,865],[1120,520],[830,520],[830,410],[600,410],[600,485]]},
 '355':{floor:3,area:'Stiteler Hall',points:[ELEVATOR,[1105,865],[1105,850],[1045,850]]},
 '357':{floor:3,area:'Stiteler Hall',points:[ELEVATOR,[1105,865],[1105,1180],[1045,1180]]}
});
export function worldPoint(point,floor=1){return {x:(point[0]-ELEVATOR[0])/20.5,y:(floor-1)*LEVEL_HEIGHT,z:(point[1]-ELEVATOR[1])/20.5};}
export function journeyFor(number){const r=ROUTES[number];if(!r)return null;return {number,floor:r.floor,area:r.area,steps:[{type:'walk',floor:1,points:LOBBY_PATH.map(p=>worldPoint(p,1))},{type:'elevator',from:1,to:r.floor,points:[worldPoint(ELEVATOR,1),worldPoint(ELEVATOR,r.floor)]},{type:'walk',floor:r.floor,points:r.points.map(p=>worldPoint(p,r.floor))}]};}
