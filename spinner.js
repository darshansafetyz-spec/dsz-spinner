// spinner.js (complete working version with horizontal labels + celebration)

// ===== OPTIONS =====
const OPTIONS = [
  "Appreciation Award",
  "Signature Surprise Box",
  "Bonus Leave",
  "Golden Perk",
  "Silver Perk",
  "1 Week Free Dress",
  "Flexi Incoming",
  "Flexi Outgoing"
];

// DOM
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const confettiCanvas = document.getElementById('confettiCanvas');
const cctx = confettiCanvas.getContext('2d');

const spinBtn = document.getElementById('spinBtn');
const resetBtn = document.getElementById('resetBtn');
const exportCSV = document.getElementById('exportCSV');
const downloadCertBtn = document.getElementById('downloadCert');
const employeeNameInput = document.getElementById('employeeName');
const logTableBody = document.getElementById('logTable');
const modal = document.getElementById('modal');
const resultTitle = document.getElementById('resultTitle');
const resultTag = document.getElementById('resultTag');
const resultMeta = document.getElementById('resultMeta');
const closeModal = document.getElementById('closeModal');
const auditModeCheckbox = document.getElementById('auditMode');
const pointer = document.getElementById('topPointer');

let sizePx = 520;
let DPR = Math.max(1, window.devicePixelRatio || 1);
let center = { x: sizePx/2, y: sizePx/2, r: sizePx/2 - 12 };
let rotation = 0;
let isSpinning = false;

// pastel colors
const colors = ["#ffcdcdff","#fce8c8ff","#fffbcaff","#c2ffd5ff","#c5ebffff","#dec3ffff","#ffd1e7ff","#ffe6ceff"];

// resize and initial draw
function resize(){
  const wrap = document.getElementById('wheelWrap');
  const rect = wrap.getBoundingClientRect();
  const cssSize = Math.min(Math.max(300, rect.width || 520), rect.height || 520);
  sizePx = cssSize;
  DPR = Math.max(1, window.devicePixelRatio || 1);

  canvas.width = Math.floor(sizePx * DPR);
  canvas.height = Math.floor(sizePx * DPR);
  canvas.style.width = `${sizePx}px`;
  canvas.style.height = `${sizePx}px`;
  ctx.setTransform(DPR,0,0,DPR,0,0);

  confettiCanvas.width = canvas.width;
  confettiCanvas.height = canvas.height;
  confettiCanvas.style.width = `${sizePx}px`;
  confettiCanvas.style.height = `${sizePx}px`;
  cctx.setTransform(DPR,0,0,DPR,0,0);

  center = { x: sizePx/2, y: sizePx/2, r: sizePx/2 - 12 };
  drawWheel(rotation);
}
window.addEventListener('resize', ()=> requestAnimationFrame(resize));
window.addEventListener('load', ()=> setTimeout(resize,50));
resize();

// draw wheel (sectors + horizontal labels) then center badge
function drawWheel(rotDeg = 0){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.save();

  // rotate wheel group
  ctx.translate(center.x, center.y);
  ctx.rotate((rotDeg * Math.PI)/180);
  ctx.translate(-center.x, -center.y);

  const n = OPTIONS.length;
  const sector = 360 / n;
  const fontBase = Math.max(10, Math.floor(sizePx / 44));
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i=0;i<n;i++){
    const startAng = (sector * i - 90) * Math.PI/180;
    const endAng = (sector * (i+1) - 90) * Math.PI/180;

    // sector
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.arc(center.x, center.y, center.r, startAng, endAng, false);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();

    // divider
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.arc(center.x, center.y, center.r, startAng, startAng + 0.001, false);
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // horizontal label
    const midAng = (startAng + endAng)/2;
    const labelR = center.r * 0.66;
    const tx = center.x + Math.cos(midAng) * labelR;
    const ty = center.y + Math.sin(midAng) * labelR;

    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(1); // keep horizontal
    ctx.fillStyle = "#071019";
    ctx.font = `700 ${fontBase}px Arial`;
    const lines = wrapText(ctx, OPTIONS[i], center.r * 0.42, 2);
    for (let li=0; li<lines.length; li++){
      const yoff = (li - (lines.length-1)/2) * (fontBase + 2);
      ctx.fillText(lines[li], 0, yoff);
    }
    ctx.restore();
  }

  // outer ring
  ctx.beginPath();
  ctx.arc(center.x, center.y, center.r, 0, Math.PI*2);
  ctx.lineWidth = 10;
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.stroke();

  ctx.restore();

  // draw center badge on top
  drawCenter();
}

// helper wrap
function wrapText(ctxRef, text, maxWidth, maxLines=2){
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (let i=0;i<words.length;i++){
    const w = words[i];
    const test = cur ? cur + ' ' + w : w;
    if (ctxRef.measureText(test).width > maxWidth && cur){
      lines.push(cur);
      cur = w;
      if (lines.length >= maxLines){
        cur += ' ' + words.slice(i+1).join(' ');
        break;
      }
    } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, maxLines);
}

// draw center badge (logo from hidden img)
function drawCenter(){
  const badgeR = Math.floor(center.r * 0.22);
  const cx = center.x, cy = center.y;

  // subtle shadow
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, badgeR+6, 0, Math.PI*2);
  ctx.fillStyle = "rgba(0,0,0,0.04)";
  ctx.fill();
  ctx.restore();

  // white badge
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, badgeR, 0, Math.PI*2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();

  // draw hidden img into canvas
  const img = document.getElementById('centerLogo');
  if (img && img.complete && img.naturalWidth){
    const iw = badgeR * 1.05;
    ctx.drawImage(img, cx - iw/2, cy - iw/2 - 6, iw, iw);
  } else {
    // fallback SPIN text
    ctx.save();
    ctx.fillStyle = "#071019";
    ctx.font = `700 ${Math.max(10, Math.floor(badgeR/4))}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText("SPIN", cx, cy + badgeR*0.6);
    ctx.restore();
  }
}

// ---------- spin math ----------
function pickRandomIndex(){ return Math.floor(Math.random() * OPTIONS.length); }
function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

function computeFinalRotationForIndex(targetIndex){
  const n = OPTIONS.length;
  const sector = 360 / n;
  const sectorCenter = targetIndex * sector + sector/2;
  const desired_mod = (360 - sectorCenter) % 360;
  const fullTurns = (Math.floor(Math.random() * 3) + 6) * 360;
  const jitter = (Math.random() - 0.5) * (sector * 0.6);
  return fullTurns + desired_mod + jitter;
}

function animate(from, to, dur, onFrame, onDone){
  const start = performance.now();
  function frame(now){
    const t = Math.min(1, (now - start) / dur);
    const v = easeOutCubic(t);
    const cur = from + (to - from) * v;
    onFrame(cur);
    if (t < 1) requestAnimationFrame(frame);
    else onDone && onDone();
  }
  requestAnimationFrame(frame);
}

// ----- confetti / partyPop / sprinkle -----
let confettiParticles = [];

function spawnConfetti(x,y){
  const count = 40;
  for (let i=0;i<count;i++){
    confettiParticles.push({
      x: x,
      y: y,
      vx: (Math.random()-0.5) * 8,
      vy: (Math.random() - 5) * 6,
      size: 6 + Math.random()*8,
      color: ["#FFD166","#EF476F","#06D6A0","#118AB2","#8E44AD"][Math.floor(Math.random()*5)],
      rot: Math.random()*360,
      drot: (Math.random()-0.5)*10,
      shape: "rect",
      sparkle: false,
      life: 120 + Math.floor(Math.random()*80)
    });
  }
}

function partyPop(x,y){
  for (let i=0;i<45;i++){
    confettiParticles.push({
      x:x, y:y,
      vx:(Math.random()-0.5)*18,
      vy:(Math.random()-0.5)*18,
      size:6 + Math.random()*8,
      color: ["#ff005c","#ff7a00","#00c9ff","#6fff00","#bd00ff"][Math.floor(Math.random()*5)],
      rot: Math.random()*360,
      drot: (Math.random()-0.5)*20,
      shape: Math.random()>0.5 ? "star" : "circle",
      sparkle:false,
      life:60 + Math.floor(Math.random()*40)
    });
  }
}

function sprinkleBurst(x,y){
  for (let i=0;i<35;i++){
    confettiParticles.push({
      x:x, y:y,
      vx:(Math.random()-0.5)*10,
      vy:(Math.random()-0.5)*10,
      size:2 + Math.random()*3,
      color:"#ffffff", shape:"dot", sparkle:true, rot:0, drot:0, life:40 + Math.floor(Math.random()*25)
    });
  }
}

function drawStar(ctxLocal, size, color){
  ctxLocal.beginPath();
  for (let i=0;i<5;i++){
    ctxLocal.lineTo(Math.cos((18 + 72*i) * Math.PI/180) * size, -Math.sin((18 + 72*i) * Math.PI/180) * size);
    ctxLocal.lineTo(Math.cos((54 + 72*i) * Math.PI/180) * size/2, -Math.sin((54 + 72*i) * Math.PI/180) * size/2);
  }
  ctxLocal.closePath();
  ctxLocal.fillStyle = color;
  ctxLocal.fill();
}

function runConfetti(){
  cctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
  for (let i = confettiParticles.length - 1; i >= 0; i--){
    const p = confettiParticles[i];
    p.vy += 0.25; p.x += p.vx; p.y += p.vy; p.rot += (p.drot || 0); p.life--;
    cctx.save();
    cctx.translate(p.x * DPR, p.y * DPR);
    cctx.rotate((p.rot || 0) * Math.PI/180);

    if (p.sparkle){
      cctx.globalAlpha = Math.random() * 0.9 + 0.1;
      cctx.fillStyle = p.color;
      const s = p.size * DPR;
      cctx.fillRect(-s/2, -s/2, s, s);
      cctx.globalAlpha = 1;
    } else if (p.shape === "star"){
      drawStar(cctx, (p.size||6) * DPR * 0.9, p.color);
    } else if (p.shape === "circle"){
      cctx.beginPath(); cctx.fillStyle = p.color; cctx.arc(0,0,(p.size||6) * DPR * 0.5,0,Math.PI*2); cctx.fill();
    } else {
      cctx.fillStyle = p.color;
      const w = p.size * DPR; const h = p.size * DPR * 0.6;
      cctx.fillRect(-w/2, -h/2, w, h);
    }

    cctx.restore();
    if (p.life <= 0 || p.y > center.y + center.r + 50) confettiParticles.splice(i,1);
  }
  if (confettiParticles.length) requestAnimationFrame(runConfetti);
}

// sound (optional)
let audioCtx = null;
try{ audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){ audioCtx = null; }
function playWhoosh(){ if(!audioCtx) return; const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.type='sawtooth'; o.frequency.setValueAtTime(200,audioCtx.currentTime); o.frequency.exponentialRampToValueAtTime(1000,audioCtx.currentTime+0.35); g.gain.setValueAtTime(0.03,audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001,audioCtx.currentTime+0.5); o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime+0.6); }
function playDing(){ if(!audioCtx) return; const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.type='sine'; o.frequency.setValueAtTime(880,audioCtx.currentTime); o.frequency.exponentialRampToValueAtTime(1200,audioCtx.currentTime+0.15); g.gain.setValueAtTime(0.06,audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001,audioCtx.currentTime+0.6); o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime+0.7); }

// logs
function loadLogs(){ try{ const r = localStorage.getItem('spinner_logs_v2'); return r? JSON.parse(r): []; }catch(e){ return []; } }
function saveLogs(l){ localStorage.setItem('spinner_logs_v2', JSON.stringify(l)); }
function appendLog(entry){ const logs = loadLogs(); logs.unshift(entry); saveLogs(logs); renderLogs(); }
function clearLogs(){ localStorage.removeItem('spinner_logs_v2'); renderLogs(); }
function renderLogs(){ const logs = loadLogs(); logTableBody.innerHTML=''; logs.forEach((l,idx)=>{ const tr = document.createElement('tr'); tr.innerHTML = `<td>${idx+1}</td><td>${escapeHtml(l.name)}</td><td>${escapeHtml(l.reward)}</td><td class="small">${escapeHtml(l.time)}</td>`; logTableBody.appendChild(tr); }); }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m])); }

// interactions
spinBtn.addEventListener('click', ()=>{
  if (isSpinning) return;
  const name = employeeNameInput.value.trim();
  if (!name){ alert('कृपया नाम डालो'); employeeNameInput.focus(); return; }
  isSpinning = true; spinBtn.disabled = true;

  const chosen = pickRandomIndex();
  const final = computeFinalRotationForIndex(chosen);
  const from = rotation;
  const to = rotation + (final - (rotation % 360));
  const duration = 4200 + Math.floor(Math.random()*1800);

  playWhoosh();
  animate(from, to, duration, (deg)=>{
    rotation = deg; drawWheel(rotation);
    // pointer wiggle visual
    const wig = Math.sin(Date.now()/80) * Math.min(10, Math.abs((to-deg)/20));
    if (pointer) pointer.style.transform = `translateX(-50%) rotate(${wig}deg)`;
  }, ()=>{
    const R = ((rotation % 360) + 360) % 360;
    const n = OPTIONS.length;
    const sector = 360 / n;
    const landed = Math.floor(((360 - R) % 360) / sector) % n;
    const reward = OPTIONS[landed];

    // celebration
    spawnConfetti(center.x, center.y - center.r*0.2);
    partyPop(center.x, center.y);
    sprinkleBurst(center.x, center.y);
    runConfetti();
    playDing();

    // modal + log
    if (resultTitle) resultTitle.innerText = `${employeeNameInput.value.trim()} got`;
    if (resultTag) resultTag.innerText = reward;
    if (resultMeta) resultMeta.innerText = auditModeCheckbox.checked ? `seed:${chosen} • landed:${landed} • rot:${Math.round(rotation)}°` : '';
    if (modal) { modal.classList.add('show'); modal.setAttribute('aria-hidden','false'); }

    appendLog({ name: employeeNameInput.value.trim(), reward: reward, time: (new Date()).toLocaleString() });
    isSpinning = false; spinBtn.disabled = false;
    if (pointer) pointer.style.transform = `translateX(-50%) rotate(0deg)`;
  });
});

resetBtn.addEventListener('click', ()=> { if (confirm('Clear saved logs?')) clearLogs(); });
if (closeModal) closeModal.addEventListener('click', ()=> { modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); });

if (exportCSV) exportCSV.addEventListener('click', ()=> {
  const logs = loadLogs();
  if (!logs.length){ alert('No logs'); return; }
  const rows = [['Name','Reward','Time']];
  logs.slice().reverse().forEach(l => rows.push([l.name, l.reward, l.time]));
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'spinner_logs_v2.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

// ===== safe certificate handler (use this instead of direct addEventListener) =====
window.addEventListener('load', () => {
  try {
    const downloadCertBtnSafe = document.getElementById('downloadCert');
    // if button not present, nothing to do
    if (!downloadCertBtnSafe) {
      console.warn('downloadCert button not found — certificate handler not attached.');
      return;
    }
// safe helper: wrapLongText (use before certificate code)
function wrapLongText(ctx, text, x, y, maxWidth, lineHeight){
  const words = String(text).split(" ");
  let line = "";
  for (let i = 0; i < words.length; i++){
    const test = line + words[i] + " ";
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, y);
      line = words[i] + " ";
      y += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line.trim(), x, y);
}

    // REWARD_NOTES should already be defined earlier in your file.
    downloadCertBtnSafe.addEventListener('click', () => {
      try {
        const logs = loadLogs();
        if (!logs.length) { alert('No logs yet'); return; }
        const last = logs[0];
        const reward = last.reward || "";
        const noteForReward = (typeof REWARD_NOTES !== 'undefined' && REWARD_NOTES[reward]) ? REWARD_NOTES[reward] : "This reward can be redeemed as per company policy. Contact HR for details.";

        // Canvas + draw (same as your code)
        const c = document.createElement('canvas');
        c.width = 1800; c.height = 1200;
        const cc = c.getContext('2d');

        const bg = cc.createLinearGradient(0,0,c.width, c.height);
        bg.addColorStop(0, "#f6fbff"); bg.addColorStop(1, "#eef6ff");
        cc.fillStyle = bg; cc.fillRect(0,0,c.width,c.height);

        // border + content (trimmed copy of your layout)
        const pad = 50;
        const w = c.width - pad*2, h = c.height - pad*2, x = pad, y = pad;
        cc.strokeStyle = "#2d6cdf"; cc.lineWidth = 10;
        // rounded rect
        const r = 28;
        cc.beginPath();
        cc.moveTo(x+r, y); cc.lineTo(x+w-r, y); cc.quadraticCurveTo(x+w, y, x+w, y+r);
        cc.lineTo(x+w, y+h-r); cc.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
        cc.lineTo(x+r, y+h); cc.quadraticCurveTo(x, y+h, x, y+h-r);
        cc.lineTo(x, y+r); cc.quadraticCurveTo(x, y, x+r, y); cc.closePath(); cc.stroke();

        // Title / name / reward / note etc (same fonts)
        cc.fillStyle = "#0b2b52"; cc.font = "bold 68px Arial";
        cc.fillText("Employee of the Month", x + 60, y + 110);
        cc.strokeStyle = "rgba(11,43,82,0.12)"; cc.lineWidth = 2;
        cc.beginPath(); cc.moveTo(x+60, y+130); cc.lineTo(x + 1200, y+130); cc.stroke();

        cc.fillStyle = "#07203a"; cc.font = "bold 96px Arial";
        cc.fillText(last.name, x + 60, y + 250);

        cc.fillStyle = "#0b3b6c"; cc.font = "600 36px Arial";
        cc.fillText("Awarded For", x + 60, y + 340);

        cc.fillStyle = "#165db3"; cc.font = "bold 64px Arial";
        wrapLongText(cc, reward, x + 60, y + 400, 1200, 74);

        cc.fillStyle = "#21384d"; cc.font = "28px Arial";
        cc.fillText("Note:", x + 60, y + 520);
        cc.font = "22px Arial"; wrapLongText(cc, noteForReward, x + 60, y + 560, 1200, 36);

        cc.fillStyle = "#48607a"; cc.font = "22px Arial";
        cc.fillText("Date: " + last.time, x + 60, y + 760);

        cc.fillStyle = "#7a8b9a"; cc.font = "20px Arial";
        cc.fillText("Darshan Safety Zone — Signature", x + 60, y + h - 36);

        // export
        const url = c.toDataURL('image/png');
        const a = document.createElement('a'); a.href = url; a.download = `Certificate_${last.name.replace(/\s+/g,'_')}.png`;
        document.body.appendChild(a); a.click(); a.remove();
      } catch (errInner) {
        console.error('Error generating certificate:', errInner);
        alert('Error while generating certificate. Check console for details.');
      }
    });
  } catch (err) {
    console.error('Error attaching certificate handler:', err);
  }
});


// init
function init(){ resize(); renderLogs(); drawWheel(0); }
init();
