// Generates el-nino-monsoon.png
// Scientific-style SST anomaly map showing El Niño warm pool (Pacific)
// and Indian Ocean, with simplified land outlines
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const W = 1200, H = 630;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// Map region: 30°E → 200°E (lon), 35°N → 35°S (lat)
const LON0 = 30, LON1 = 200;   // 170° span
const LAT0 = 35, LAT1 = -35;   // 70° span

function px(lon, lat) {
  return [
    (lon - LON0) / (LON1 - LON0) * W,
    (LAT0 - lat) / (LAT0 - LAT1) * H
  ];
}

// ── Ocean background (deep navy) ─────────────────────────────────────────────
ctx.fillStyle = '#05213a';
ctx.fillRect(0, 0, W, H);

// ── SST anomaly layer ─────────────────────────────────────────────────────────
// Helper: draw a soft elliptical blob of color
function sst(lon, lat, rLon, rLat, color) {
  const [cx, cy] = px(lon, lat);
  const rx = rLon / (LON1 - LON0) * W;
  const ry = rLat / (LAT0 - LAT1) * H;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
  g.addColorStop(0,   color);
  g.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.save();
  ctx.scale(1, ry / rx);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy * (rx / ry), rx * 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// El Niño warm pool — eastern/central Pacific (strong reds)
sst(205, 0,  28, 14, 'rgba(200, 40, 20, 0.75)');   // far east Pacific hot core
sst(190, 0,  22, 12, 'rgba(220, 80, 20, 0.65)');
sst(175, 0,  18, 10, 'rgba(220,120, 30, 0.55)');   // central Pacific warm
sst(160, 2,  14,  8, 'rgba(200,150, 40, 0.40)');   // transition zone

// Slight cool in western Pacific (suppressed convection)
sst(130, 5,  10,  8, 'rgba( 20, 80,160, 0.30)');
sst(125, 0,  12,  8, 'rgba( 20, 60,140, 0.25)');

// Indian Ocean — neutral baseline with warm Arabian Sea (pIOD-like)
sst( 62, 16,  14, 10, 'rgba(200,100, 20, 0.35)');   // Arabian Sea warm
sst( 82, 14,  10,  8, 'rgba(200,120, 30, 0.25)');   // Bay of Bengal warm
sst( 70,  0,  18, 12, 'rgba( 30,120,180, 0.25)');   // Central IO neutral-cool
sst( 96, -2,  12,  8, 'rgba( 20, 80,160, 0.35)');   // East IO cool (pIOD)

// Southern IO cool
sst( 80,-25,  30, 12, 'rgba( 20, 60,140, 0.20)');

// ── Background ocean texture — subtle grid ────────────────────────────────────
ctx.strokeStyle = 'rgba(255,255,255,0.04)';
ctx.lineWidth = 1;
// Latitude lines
[-30,-20,-10,0,10,20,30].forEach(lat => {
  const [,y] = px(LON0, lat);
  ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
});
// Longitude lines
[60,90,120,150,180].forEach(lon => {
  const [x] = px(lon, 0);
  ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
});

// ── Land outlines ─────────────────────────────────────────────────────────────
function land(points, color = '#2d5a1b') {
  ctx.beginPath();
  points.forEach(([lon, lat], i) => {
    const [x, y] = px(lon, lat);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
}

// Africa eastern coast (left edge of map)
land([
  [30,-35],[30,35],[38,34],[44,12],[51,12],[44,8],[42,2],[40,-11],[36,-20],[34,-35]
], '#3a6b2a');

// Arabian Peninsula
land([
  [32,30],[37,23],[43,13],[45,13],[52,14],[57,21],[60,22],[58,24],[56,25],[50,30],[44,33],[38,31],[32,30]
], '#3a6b2a');

// Iran / Pakistan (partially)
land([
  [44,33],[50,30],[60,22],[62,26],[67,25],[66,30],[60,29],[55,33],[48,35],[44,35],[44,33]
], '#3a6b2a');

// INDIA — main shape (clear, prominent)
land([
  [66,23],[68,24],[72,22],[74,20],[72,20],
  [73,19],[74,18],[72,18],   // Mumbai dip
  [76,15],[76,11],[77,8],    // SW coast tip
  [78,8],[80,10],            // SE base
  [80,14],[80,18],[83,20],
  [85,21],[87,22],[88,23],[88,24],[89,25],
  [91,26],[92,25],           // Assam
  [88,27],[87,27],           // northeast curve
  [85,27],[82,28],[80,30],
  [78,30],[77,30],[76,31],[75,32],[74,33],
  [72,33],[70,30],[68,28],[66,25],[66,23]
], '#4a8a2e');
// Sri Lanka
land([[80,10],[81,9],[82,8],[81,6],[80,7],[79,9],[80,10]], '#4a8a2e');

// Southeast Asia
land([
  [100,20],[102,22],[104,21],[104,18],[106,16],[108,14],[108,10],
  [103,2],[104,1],[102,1],[100,3],[99,5],[100,8],[99,12],[98,16],[97,18],[100,20]
], '#3a6b2a');
// Malay Peninsula / Sumatra
land([
  [100,3],[103,1],[104,1],[108,2],[112,0],[116,-4],[116,-8],
  [110,-8],[106,-7],[104,-4],[103,-2],[100,0],[98,2],[100,3]
], '#3a6b2a');
// Borneo
land([[116,-4],[118,-4],[120,-2],[118,2],[116,4],[114,4],[112,2],[110,0],[112,-4],[116,-4]], '#3a6b2a');
// Philippines (simplified)
land([[120,10],[122,8],[124,10],[126,14],[124,16],[122,18],[120,16],[118,12],[120,10]], '#3a6b2a');

// Japan / Korea (northern)
land([[130,32],[134,34],[138,36],[141,38],[140,42],[138,44],[134,44],[131,38],[130,34],[130,32]], '#3a6b2a');

// Australia
land([
  [114,-22],[116,-32],[118,-34],[122,-34],[126,-34],[130,-32],[132,-32],
  [136,-36],[140,-36],[142,-38],[148,-38],[152,-36],[154,-28],[152,-24],
  [148,-20],[146,-18],[142,-12],[136,-12],[130,-14],[126,-14],[122,-18],[114,-22]
], '#3a6b2a');

// New Guinea
land([[132,-2],[136,-4],[142,-4],[146,-6],[148,-8],[142,-8],[136,-6],[132,-4],[132,-2]], '#3a6b2a');

// ── Walker Circulation arrow (suppressed, dashed) ─────────────────────────────
// During El Niño: rising over eastern Pacific, subsiding over India/IO
function dashedLine(x1, y1, x2, y2, dash, color, width) {
  ctx.setLineDash(dash);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.setLineDash([]);
}
const [arX1] = px(185, 0); const [arX2] = px(75, 8);
const arY = H * 0.38;
dashedLine(arX1, arY, arX2, arY, [10, 6], 'rgba(255,255,255,0.35)', 2);
// Arrowhead pointing west (toward India)
ctx.fillStyle = 'rgba(255,255,255,0.5)';
ctx.beginPath();
ctx.moveTo(arX2 - 2, arY);
ctx.lineTo(arX2 + 16, arY - 8);
ctx.lineTo(arX2 + 16, arY + 8);
ctx.closePath();
ctx.fill();

// Subsidence arc over India
const [inX, inY] = px(78, 22);
ctx.strokeStyle = 'rgba(255,180,80,0.5)';
ctx.lineWidth = 2;
ctx.setLineDash([6,4]);
ctx.beginPath();
ctx.arc(inX, inY - 15, 35, 0.2 * Math.PI, 0.8 * Math.PI);
ctx.stroke();
ctx.setLineDash([]);
// Downward arrow for subsidence
ctx.strokeStyle = 'rgba(255,180,80,0.7)';
ctx.lineWidth = 2;
ctx.beginPath(); ctx.moveTo(inX, inY - 15); ctx.lineTo(inX, inY + 15); ctx.stroke();
ctx.fillStyle = 'rgba(255,180,80,0.7)';
ctx.beginPath();
ctx.moveTo(inX, inY + 20);
ctx.lineTo(inX - 6, inY + 8);
ctx.lineTo(inX + 6, inY + 8);
ctx.closePath();
ctx.fill();

// ── Labels ────────────────────────────────────────────────────────────────────
function label(lon, lat, text, size, color, align = 'center') {
  const [x, y] = px(lon, lat);
  ctx.font = `bold ${size}px sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}

// Ocean region labels
label( 70, -15, 'INDIAN OCEAN', 14, 'rgba(120,190,255,0.7)');
label(155,  20, 'PACIFIC OCEAN', 14, 'rgba(120,190,255,0.6)');
label(155,  17, '(El Niño warm pool)', 12, 'rgba(255,140,80,0.8)');
label( 68,  16, 'INDIA', 13, 'rgba(255,255,255,0.9)');
label( 62,  23, 'Arabian', 11, 'rgba(200,120,50,0.8)');
label( 62,  20, 'Sea ▲', 11, 'rgba(200,120,50,0.8)');
label( 87,  16, 'Bay of', 11, 'rgba(200,120,50,0.7)');
label( 87,  13, 'Bengal ▲', 11, 'rgba(200,120,50,0.7)');
label( 95,   2, 'Cool SST ▼', 11, 'rgba(80,140,220,0.8)');  // east IO

// Walker suppression label
const [wlx] = px(130, 0);
ctx.font = '11px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.textAlign = 'center';
ctx.fillText('suppressed Walker Circulation', wlx, arY - 12);

// Subsidence label
ctx.font = '11px sans-serif'; ctx.fillStyle = 'rgba(255,180,80,0.75)'; ctx.textAlign = 'center';
ctx.fillText('subsidence', inX, inY + 36);

// ── Colour scale bar ──────────────────────────────────────────────────────────
const barX = W - 200, barY = H - 90, barW = 160, barH = 14;
const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
grad.addColorStop(0,    '#1a4fa8');
grad.addColorStop(0.35, '#2090c0');
grad.addColorStop(0.5,  '#e8e8a0');
grad.addColorStop(0.65, '#e07030');
grad.addColorStop(1,    '#c01010');
ctx.fillStyle = grad;
ctx.fillRect(barX, barY, barW, barH);
ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 0.5;
ctx.strokeRect(barX, barY, barW, barH);
ctx.font = '11px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.textAlign = 'center';
ctx.fillText('SST Anomaly (°C)', barX + barW / 2, barY - 6);
ctx.textAlign = 'left';  ctx.fillText('−2', barX, barY + barH + 14);
ctx.textAlign = 'center';ctx.fillText('0', barX + barW / 2, barY + barH + 14);
ctx.textAlign = 'right'; ctx.fillText('+4', barX + barW, barY + barH + 14);

// ── Title bar ─────────────────────────────────────────────────────────────────
ctx.fillStyle = 'rgba(0,0,0,0.62)';
ctx.fillRect(0, 0, W, 68);

ctx.font = 'bold 26px sans-serif';
ctx.fillStyle = '#ffffff';
ctx.textAlign = 'left';
ctx.fillText('El Niño and the Indian Monsoon', 20, 30);

ctx.font = '16px sans-serif';
ctx.fillStyle = 'rgba(255,255,255,0.55)';
ctx.fillText('Sea Surface Temperature Anomaly Pattern  ·  A Tug of War Across Oceans', 20, 54);

// Footer
ctx.font = '12px sans-serif';
ctx.fillStyle = 'rgba(255,255,255,0.25)';
ctx.textAlign = 'right';
ctx.fillText('clustersandclimate.com', W - 12, H - 8);

const outPath = path.join(__dirname, '../../assets/images/climate/el-nino-monsoon.png');
fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
console.log('Wrote', outPath);
