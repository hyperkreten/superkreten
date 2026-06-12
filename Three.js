<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Gravity Simulator</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #000; overflow: hidden; font-family: 'Courier New', monospace; color: #e0e0e0; }
  #canvas { display: block; }

  #ui {
    position: fixed;
    top: 0; left: 0;
    width: 260px;
    height: 100vh;
    background: rgba(5,8,20,0.88);
    border-right: 1px solid rgba(100,160,255,0.15);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow-y: auto;
    z-index: 10;
  }

  #ui h1 {
    font-size: 13px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #6ab0ff;
    border-bottom: 1px solid rgba(100,160,255,0.2);
    padding-bottom: 10px;
  }

  .section-title {
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #4a7aaa;
    margin-bottom: 4px;
  }

  .preset-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  .preset-btn {
    background: rgba(30,50,90,0.6);
    border: 1px solid rgba(100,160,255,0.2);
    color: #9dc8ff;
    font-family: 'Courier New', monospace;
    font-size: 11px;
    padding: 8px 6px;
    cursor: pointer;
    border-radius: 3px;
    transition: all 0.15s;
    text-align: center;
  }
  .preset-btn:hover {
    background: rgba(60,100,180,0.5);
    border-color: rgba(100,160,255,0.5);
    color: #fff;
  }
  .preset-btn.active {
    background: rgba(60,110,200,0.6);
    border-color: #6ab0ff;
    color: #fff;
  }

  .slider-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .slider-label {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #8aaccc;
  }
  .slider-label span { color: #cce0ff; }
  input[type=range] {
    width: 100%;
    height: 4px;
    -webkit-appearance: none;
    background: rgba(100,160,255,0.2);
    border-radius: 2px;
    outline: none;
  }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px; height: 12px;
    border-radius: 50%;
    background: #6ab0ff;
    cursor: pointer;
  }

  .action-btn {
    background: rgba(20,40,80,0.7);
    border: 1px solid rgba(100,160,255,0.25);
    color: #9dc8ff;
    font-family: 'Courier New', monospace;
    font-size: 11px;
    padding: 9px 12px;
    cursor: pointer;
    border-radius: 3px;
    transition: all 0.15s;
    width: 100%;
    text-align: left;
  }
  .action-btn:hover {
    background: rgba(50,90,160,0.5);
    color: #fff;
  }
  .action-btn.danger {
    border-color: rgba(255,80,80,0.3);
    color: #ff9999;
  }
  .action-btn.danger:hover {
    background: rgba(120,30,30,0.5);
    color: #ffcccc;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 11px;
    color: #8aaccc;
  }
  .toggle {
    width: 32px; height: 16px;
    background: rgba(30,50,90,0.8);
    border: 1px solid rgba(100,160,255,0.3);
    border-radius: 8px;
    cursor: pointer;
    position: relative;
    transition: background 0.2s;
  }
  .toggle.on { background: rgba(60,130,255,0.5); }
  .toggle::after {
    content: '';
    position: absolute;
    width: 10px; height: 10px;
    border-radius: 50%;
    background: #6ab0ff;
    top: 2px; left: 2px;
    transition: left 0.2s;
  }
  .toggle.on::after { left: 18px; }

  #status {
    position: fixed;
    bottom: 16px; left: 276px;
    font-size: 11px;
    color: rgba(100,160,255,0.6);
    letter-spacing: 0.08em;
    pointer-events: none;
  }

  #crosshair {
    position: fixed;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    display: none;
  }
  #crosshair.show { display: block; }
  #crosshair svg { opacity: 0.6; }

  #spawn-preview {
    position: fixed;
    bottom: 50px; left: 276px;
    background: rgba(5,10,25,0.85);
    border: 1px solid rgba(100,160,255,0.2);
    padding: 10px 14px;
    font-size: 11px;
    color: #8aaccc;
    border-radius: 3px;
    pointer-events: none;
  }

  #help {
    position: fixed;
    top: 16px; right: 16px;
    background: rgba(5,10,25,0.85);
    border: 1px solid rgba(100,160,255,0.12);
    padding: 12px 16px;
    font-size: 10px;
    color: rgba(100,160,255,0.5);
    border-radius: 3px;
    line-height: 1.8;
    letter-spacing: 0.05em;
    max-width: 220px;
  }
  #help b { color: rgba(150,200,255,0.7); }

  #body-count {
    position: fixed;
    top: 16px;
    left: 276px;
    font-size: 11px;
    color: rgba(100,160,255,0.5);
    letter-spacing: 0.1em;
    pointer-events: none;
  }
</style>
</head>
<body>

<canvas id="canvas"></canvas>

<div id="ui">
  <h1>⬡ Gravity Simulator</h1>

  <div>
    <div class="section-title">Spawn Object</div>
    <div class="preset-grid">
      <button class="preset-btn active" data-type="planet">🪐 Planet</button>
      <button class="preset-btn" data-type="star">⭐ Star</button>
      <button class="preset-btn" data-type="blackhole">⚫ Black Hole</button>
      <button class="preset-btn" data-type="moon">🌑 Moon</button>
      <button class="preset-btn" data-type="asteroid">🪨 Asteroid</button>
      <button class="preset-btn" data-type="comet">☄️ Comet</button>
    </div>
  </div>

  <div class="slider-row">
    <div class="slider-label">Mass <span id="mass-val">1.0</span></div>
    <input type="range" id="mass-slider" min="-2" max="4" step="0.1" value="0">
  </div>

  <div class="slider-row">
    <div class="slider-label">Initial Velocity <span id="vel-val">0.0</span></div>
    <input type="range" id="vel-slider" min="0" max="50" step="0.5" value="0">
  </div>

  <div class="slider-row">
    <div class="slider-label">Gravity Constant <span id="g-val">6.67</span></div>
    <input type="range" id="g-slider" min="1" max="30" step="0.1" value="6.67">
  </div>

  <div class="slider-row">
    <div class="slider-label">Time Scale <span id="time-val">1.0x</span></div>
    <input type="range" id="time-slider" min="0.1" max="5" step="0.1" value="1">
  </div>

  <div>
    <div class="section-title">Quick Scenarios</div>
    <div class="preset-grid">
      <button class="preset-btn" onclick="spawnSolarSystem()">Solar Sys</button>
      <button class="preset-btn" onclick="spawnBinaryStars()">Binary Stars</button>
      <button class="preset-btn" onclick="spawnGalaxy()">Galaxy</button>
      <button class="preset-btn" onclick="spawnChaos()">Chaos</button>
    </div>
  </div>

  <div>
    <div class="section-title">Options</div>
    <div class="toggle-row">
      Show Trails
      <div class="toggle on" id="toggle-trails" onclick="toggleOption('trails')"></div>
    </div>
    <div class="toggle-row" style="margin-top:8px">
      Show Vectors
      <div class="toggle" id="toggle-vectors" onclick="toggleOption('vectors')"></div>
    </div>
    <div class="toggle-row" style="margin-top:8px">
      Collisions
      <div class="toggle on" id="toggle-collisions" onclick="toggleOption('collisions')"></div>
    </div>
    <div class="toggle-row" style="margin-top:8px">
      Stars BG
      <div class="toggle on" id="toggle-stars" onclick="toggleOption('stars')"></div>
    </div>
  </div>

  <button class="action-btn danger" onclick="clearAll()">✕ Clear All Bodies</button>
  <button class="action-btn" onclick="pauseToggle()">⏸ Pause / Resume</button>
</div>

<div id="body-count">Bodies: 0</div>

<div id="crosshair" class="show">
  <svg width="24" height="24" viewBox="0 0 24 24">
    <line x1="12" y1="2" x2="12" y2="8" stroke="#6ab0ff" stroke-width="1.5"/>
    <line x1="12" y1="16" x2="12" y2="22" stroke="#6ab0ff" stroke-width="1.5"/>
    <line x1="2" y1="12" x2="8" y2="12" stroke="#6ab0ff" stroke-width="1.5"/>
    <line x1="16" y1="12" x2="22" y2="12" stroke="#6ab0ff" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="2" stroke="#6ab0ff" stroke-width="1" fill="none"/>
  </svg>
</div>

<div id="spawn-preview">Click to spawn · Space+drag for velocity</div>

<div id="help">
  <b>WASD</b> — move camera<br>
  <b>Mouse drag</b> — look around<br>
  <b>Scroll</b> — zoom in/out<br>
  <b>Click</b> — spawn object<br>
  <b>Space+Click drag</b> — spawn with velocity<br>
  <b>Right-click body</b> — delete
</div>

<div id="status">Ready</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>
// ─── Scene Setup ───────────────────────────────────────────────────────────────
const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000308);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 50000);
camera.position.set(0, 80, 300);
camera.lookAt(0, 0, 0);

// ─── Lights ────────────────────────────────────────────────────────────────────
const ambientLight = new THREE.AmbientLight(0x111133, 0.5);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(100, 200, 100);
scene.add(dirLight);

// ─── Star Background ───────────────────────────────────────────────────────────
let starField;
function createStarField() {
  if (starField) scene.remove(starField);
  const geo = new THREE.BufferGeometry();
  const count = 8000;
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 8000 + Math.random() * 4000;
    pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i*3+2] = r * Math.cos(phi);
    const t = Math.random();
    col[i*3]   = 0.6 + t * 0.4;
    col[i*3+1] = 0.6 + t * 0.2;
    col[i*3+2] = 0.8 + t * 0.2;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size: 1.2, vertexColors: true, sizeAttenuation: false });
  starField = new THREE.Points(geo, mat);
  scene.add(starField);
}
createStarField();

// ─── Physics Bodies ────────────────────────────────────────────────────────────
const bodies = [];
let paused = false;
let G = 6.67;
let timeScale = 1.0;
let showTrails = true;
let showVectors = false;
let showCollisions = true;
let showStars = true;

const TYPES = {
  planet:    { color: 0x4488ff, emissive: 0x112244, baseRadius: 4,  baseMass: 1,    glowColor: '#4488ff' },
  star:      { color: 0xffdd44, emissive: 0xaa6600, baseRadius: 12, baseMass: 100,  glowColor: '#ffee44' },
  blackhole: { color: 0x220033, emissive: 0x660099, baseRadius: 8,  baseMass: 1000, glowColor: '#aa00ff' },
  moon:      { color: 0xaaaaaa, emissive: 0x222222, baseRadius: 2,  baseMass: 0.01, glowColor: '#aaaaaa' },
  asteroid:  { color: 0x886644, emissive: 0x221100, baseRadius: 1.5,baseMass: 0.001,glowColor: '#886644' },
  comet:     { color: 0x88ddff, emissive: 0x002244, baseRadius: 2,  baseMass: 0.05, glowColor: '#88ddff' },
};

let massExp = 0; // log10 mass multiplier
let initVel = 0;
let selectedType = 'planet';

class Body {
  constructor(pos, vel, type, mass, radius) {
    this.type = type;
    const def = TYPES[type];
    this.mass = mass !== undefined ? mass : def.baseMass * Math.pow(10, massExp);
    this.radius = radius !== undefined ? radius : def.baseRadius * Math.pow(this.mass / def.baseMass, 0.333);
    this.radius = Math.max(0.8, Math.min(this.radius, 60));

    this.pos = pos.clone();
    this.vel = vel ? vel.clone() : new THREE.Vector3();
    this.acc = new THREE.Vector3();
    this.alive = true;

    // Mesh
    const geo = new THREE.SphereGeometry(this.radius, 24, 16);
    const mat = new THREE.MeshPhongMaterial({
      color: def.color,
      emissive: def.emissive,
      shininess: 30,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(pos);
    this.mesh.userData.body = this;
    scene.add(this.mesh);

    // Glow sprite for stars / black holes
    if (type === 'star' || type === 'blackhole') {
      this.addGlow(def.glowColor, type === 'blackhole' ? 80 : 60);
    }

    // Trail
    this.trailPositions = [];
    this.trailMax = type === 'comet' ? 120 : 60;
    this.trailGeo = new THREE.BufferGeometry();
    this.trailPos = new Float32Array(this.trailMax * 3);
    this.trailGeo.setAttribute('position', new THREE.BufferAttribute(this.trailPos, 3));
    const trailColor = new THREE.Color(def.glowColor);
    this.trailMat = new THREE.LineBasicMaterial({
      color: trailColor,
      transparent: true,
      opacity: type === 'comet' ? 0.7 : 0.35,
      linewidth: 1,
    });
    this.trailLine = new THREE.Line(this.trailGeo, this.trailMat);
    this.trailLine.frustumCulled = false;
    scene.add(this.trailLine);

    // Velocity arrow
    const dir = new THREE.Vector3(1, 0, 0);
    this.arrowHelper = new THREE.ArrowHelper(dir, pos, 10, 0x00ff88, 3, 2);
    this.arrowHelper.visible = false;
    scene.add(this.arrowHelper);
  }

  addGlow(color, size) {
    const spriteMat = new THREE.SpriteMaterial({
      map: makeGlowTexture(color),
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    this.glowSprite = new THREE.Sprite(spriteMat);
    this.glowSprite.scale.set(size, size, 1);
    this.mesh.add(this.glowSprite);
  }

  update(dt) {
    this.vel.addScaledVector(this.acc, dt);
    this.pos.addScaledVector(this.vel, dt);
    this.mesh.position.copy(this.pos);
    this.acc.set(0, 0, 0);

    // Trail
    this.trailPositions.push(this.pos.clone());
    if (this.trailPositions.length > this.trailMax) this.trailPositions.shift();
    if (showTrails && this.trailPositions.length > 1) {
      this.trailLine.visible = true;
      const len = this.trailPositions.length;
      for (let i = 0; i < len; i++) {
        this.trailPos[i*3]   = this.trailPositions[i].x;
        this.trailPos[i*3+1] = this.trailPositions[i].y;
        this.trailPos[i*3+2] = this.trailPositions[i].z;
      }
      // Pad rest with last pos
      for (let i = len; i < this.trailMax; i++) {
        this.trailPos[i*3]   = this.trailPositions[len-1].x;
        this.trailPos[i*3+1] = this.trailPositions[len-1].y;
        this.trailPos[i*3+2] = this.trailPositions[len-1].z;
      }
      this.trailGeo.attributes.position.needsUpdate = true;
      this.trailGeo.setDrawRange(0, len);
    } else {
      this.trailLine.visible = false;
    }

    // Velocity vector
    if (showVectors && this.vel.lengthSq() > 0.001) {
      this.arrowHelper.visible = true;
      const dir = this.vel.clone().normalize();
      const speed = this.vel.length();
      this.arrowHelper.setDirection(dir);
      this.arrowHelper.setLength(Math.min(speed * 3, 80), 4, 2);
      this.arrowHelper.position.copy(this.pos);
    } else {
      this.arrowHelper.visible = false;
    }

    // Spin
    this.mesh.rotation.y += 0.005 * (this.type === 'planet' ? 1 : 0.2);
  }

  applyForce(force) {
    this.acc.addScaledVector(force, 1 / this.mass);
  }

  destroy() {
    scene.remove(this.mesh);
    scene.remove(this.trailLine);
    scene.remove(this.arrowHelper);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.trailGeo.dispose();
    this.alive = false;
  }
}

// ─── Glow Texture ──────────────────────────────────────────────────────────────
function makeGlowTexture(color) {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const grd = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  grd.addColorStop(0, color);
  grd.addColorStop(0.3, color + '88');
  grd.addColorStop(1, 'transparent');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

// ─── Physics ───────────────────────────────────────────────────────────────────
function computeGravity(dt) {
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i], b = bodies[j];
      if (!a.alive || !b.alive) continue;
      const diff = new THREE.Vector3().subVectors(b.pos, a.pos);
      const distSq = diff.lengthSq();
      const minDist = (a.radius + b.radius) * 0.8;
      if (distSq < minDist * minDist) {
        if (showCollisions) merge(i, j);
        continue;
      }
      const dist = Math.sqrt(distSq);
      const force = (G * a.mass * b.mass) / distSq;
      const dir = diff.divideScalar(dist);
      a.applyForce(dir.clone().multiplyScalar(force));
      b.applyForce(dir.clone().multiplyScalar(-force));
    }
  }
}

function merge(i, j) {
  const a = bodies[i], b = bodies[j];
  const totalMass = a.mass + b.mass;
  const dominant = a.mass >= b.mass ? a : b;
  const minor = a.mass < b.mass ? a : b;
  // Conserve momentum
  dominant.vel.multiplyScalar(dominant.mass).addScaledVector(minor.vel, minor.mass).divideScalar(totalMass);
  dominant.mass = totalMass;
  dominant.radius = Math.pow(Math.pow(dominant.radius, 3) + Math.pow(minor.radius, 3), 1/3);
  dominant.radius = Math.max(0.8, Math.min(dominant.radius, 80));
  dominant.mesh.geometry.dispose();
  dominant.mesh.geometry = new THREE.SphereGeometry(dominant.radius, 24, 16);
  minor.destroy();
  bodies.splice(bodies.indexOf(minor), 1);
}

// ─── Camera Control ────────────────────────────────────────────────────────────
const camState = {
  yaw: 0, pitch: -0.15,
  speed: 60,
  dragActive: false,
  lastX: 0, lastY: 0,
};
const keys = {};

window.addEventListener('keydown', e => { keys[e.code] = true; });
window.addEventListener('keyup',   e => { keys[e.code] = false; });

canvas.addEventListener('mousedown', e => {
  if (e.button === 0) {
    camState.dragActive = true;
    camState.lastX = e.clientX;
    camState.lastY = e.clientY;
  }
});
window.addEventListener('mouseup', e => {
  if (e.button === 0) camState.dragActive = false;
});
window.addEventListener('mousemove', e => {
  if (!camState.dragActive) return;
  const dx = e.clientX - camState.lastX;
  const dy = e.clientY - camState.lastY;
  camState.lastX = e.clientX;
  camState.lastY = e.clientY;
  camState.yaw   -= dx * 0.003;
  camState.pitch -= dy * 0.003;
  camState.pitch = Math.max(-Math.PI/2 + 0.01, Math.min(Math.PI/2 - 0.01, camState.pitch));
});

canvas.addEventListener('wheel', e => {
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  camera.position.addScaledVector(forward, -e.deltaY * 0.5);
});

// Spawn on click (not drag)
let clickStartX, clickStartY;
canvas.addEventListener('mousedown', e => {
  if (e.button === 2) {
    handleRightClick(e);
    return;
  }
  clickStartX = e.clientX;
  clickStartY = e.clientY;
});
canvas.addEventListener('mouseup', e => {
  if (e.button !== 0) return;
  const dx = Math.abs(e.clientX - clickStartX);
  const dy = Math.abs(e.clientY - clickStartY);
  if (dx < 4 && dy < 4) {
    spawnAtCenter(e);
  }
});
canvas.addEventListener('contextmenu', e => e.preventDefault());

function handleRightClick(e) {
  // Raycast to find body
  const rect = canvas.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    -((e.clientY - rect.top) / rect.height) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const meshes = bodies.map(b => b.mesh);
  const hits = raycaster.intersectObjects(meshes);
  if (hits.length > 0) {
    const body = hits[0].object.userData.body;
    body.destroy();
    const idx = bodies.indexOf(body);
    if (idx !== -1) bodies.splice(idx, 1);
  }
}

function spawnAtCenter(event) {
  // Spawn in front of camera at variable depth
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  const dist = 120 + Math.random() * 40;
  const spawnPos = camera.position.clone().addScaledVector(forward, dist);

  // Velocity: sideways relative to camera if space held
  let vel = new THREE.Vector3();
  if (keys['Space'] && initVel > 0) {
    const right = new THREE.Vector3();
    right.crossVectors(forward, camera.up).normalize();
    vel = right.multiplyScalar(initVel);
  } else if (initVel > 0) {
    vel = new THREE.Vector3(
      (Math.random() - 0.5) * initVel * 0.5,
      (Math.random() - 0.5) * initVel * 0.2,
      (Math.random() - 0.5) * initVel * 0.5
    );
  }

  const b = new Body(spawnPos, vel, selectedType);
  bodies.push(b);
  setStatus(`Spawned ${selectedType} (mass: ${b.mass.toExponential(2)})`);
}

function updateCamera(dt) {
  // Build camera orientation
  const qYaw   = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), camState.yaw);
  const qPitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0), camState.pitch);
  camera.quaternion.multiplyQuaternions(qYaw, qPitch);

  const forward = new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
  const right   = new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion);
  const up      = new THREE.Vector3(0,1,0);

  const spd = camState.speed * dt * (keys['ShiftLeft'] || keys['ShiftRight'] ? 4 : 1);
  if (keys['KeyW'] || keys['ArrowUp'])    camera.position.addScaledVector(forward, spd);
  if (keys['KeyS'] || keys['ArrowDown'])  camera.position.addScaledVector(forward, -spd);
  if (keys['KeyA'] || keys['ArrowLeft'])  camera.position.addScaledVector(right, -spd);
  if (keys['KeyD'] || keys['ArrowRight']) camera.position.addScaledVector(right, spd);
  if (keys['KeyQ']) camera.position.addScaledVector(up, -spd);
  if (keys['KeyE']) camera.position.addScaledVector(up, spd);
}

// ─── UI Bindings ───────────────────────────────────────────────────────────────
document.querySelectorAll('.preset-btn[data-type]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.preset-btn[data-type]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedType = btn.dataset.type;
    document.getElementById('spawn-preview').textContent = `Spawning: ${selectedType}`;
  });
});

const massSlider = document.getElementById('mass-slider');
const massVal    = document.getElementById('mass-val');
massSlider.addEventListener('input', () => {
  massExp = parseFloat(massSlider.value);
  const m = Math.pow(10, massExp);
  massVal.textContent = m < 0.01 ? m.toExponential(1) : m.toFixed(m < 10 ? 2 : 0);
});

const velSlider = document.getElementById('vel-slider');
const velVal    = document.getElementById('vel-val');
velSlider.addEventListener('input', () => {
  initVel = parseFloat(velSlider.value);
  velVal.textContent = initVel.toFixed(1);
});

const gSlider = document.getElementById('g-slider');
const gVal    = document.getElementById('g-val');
gSlider.addEventListener('input', () => {
  G = parseFloat(gSlider.value);
  gVal.textContent = G.toFixed(2);
});

const timeSlider = document.getElementById('time-slider');
const timeVal    = document.getElementById('time-val');
timeSlider.addEventListener('input', () => {
  timeScale = parseFloat(timeSlider.value);
  timeVal.textContent = timeScale.toFixed(1) + 'x';
});

function toggleOption(opt) {
  const el = document.getElementById('toggle-' + opt);
  el.classList.toggle('on');
  if (opt === 'trails') showTrails = el.classList.contains('on');
  if (opt === 'vectors') showVectors = el.classList.contains('on');
  if (opt === 'collisions') showCollisions = el.classList.contains('on');
  if (opt === 'stars') {
    showStars = el.classList.contains('on');
    if (starField) starField.visible = showStars;
  }
}

function clearAll() {
  [...bodies].forEach(b => b.destroy());
  bodies.length = 0;
}

function pauseToggle() {
  paused = !paused;
  setStatus(paused ? 'Paused' : 'Running');
}

function setStatus(msg) {
  document.getElementById('status').textContent = msg;
  clearTimeout(setStatus._t);
  setStatus._t = setTimeout(() => {
    document.getElementById('status').textContent = paused ? 'Paused' : 'Running';
  }, 3000);
}

// ─── Scenarios ─────────────────────────────────────────────────────────────────
function spawnSolarSystem() {
  clearAll();
  camera.position.set(0, 200, 500);
  camState.yaw = 0; camState.pitch = -0.3;
  // Sun
  const sun = new Body(new THREE.Vector3(0,0,0), new THREE.Vector3(), 'star', 2000, 20);
  bodies.push(sun);
  // Planets
  const planets = [
    { d: 60,  mass: 0.5,  r: 3,  speed: 15, color: 0x8888ff },
    { d: 100, mass: 2,    r: 5,  speed: 11, color: 0x44ff88 },
    { d: 150, mass: 2,5,  r: 5,  speed: 9,  color: 0x4488ff },
    { d: 220, mass: 0.8,  r: 3.5,speed: 7,  color: 0xff4444 },
    { d: 330, mass: 20,   r: 12, speed: 5,  color: 0xffaa44 },
    { d: 450, mass: 15,   r: 10, speed: 3.8,color: 0xffdd88 },
    { d: 580, mass: 8,    r: 7,  speed: 2.8,color: 0x88ddff },
    { d: 700, mass: 7,    r: 7,  speed: 2.3,color: 0x4466ff },
  ];
  planets.forEach((p, i) => {
    const angle = Math.random() * Math.PI * 2;
    const pos = new THREE.Vector3(Math.cos(angle)*p.d, 0, Math.sin(angle)*p.d);
    const tangent = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle));
    const vel = tangent.multiplyScalar(p.speed);
    const b = new Body(pos, vel, 'planet', p.mass, p.r);
    b.mesh.material.color.set(p.color);
    bodies.push(b);
  });
  setStatus('Solar system spawned!');
}

function spawnBinaryStars() {
  clearAll();
  camera.position.set(0, 150, 400);
  camState.yaw = 0; camState.pitch = -0.2;
  const s1 = new Body(new THREE.Vector3(-80,0,0), new THREE.Vector3(0,0,8), 'star', 500, 15);
  const s2 = new Body(new THREE.Vector3(80,0,0),  new THREE.Vector3(0,0,-8),'star', 500, 15);
  bodies.push(s1, s2);
  // Add some planets
  for (let i = 0; i < 5; i++) {
    const angle = (i/5) * Math.PI * 2;
    const r = 180 + Math.random() * 60;
    const pos = new THREE.Vector3(Math.cos(angle)*r, (Math.random()-0.5)*20, Math.sin(angle)*r);
    const tangent = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle));
    const b = new Body(pos, tangent.multiplyScalar(5), 'planet', 1 + Math.random(), 4);
    bodies.push(b);
  }
  setStatus('Binary star system spawned!');
}

function spawnGalaxy() {
  clearAll();
  camera.position.set(0, 400, 600);
  camState.yaw = 0; camState.pitch = -0.4;
  // Central black hole
  const bh = new Body(new THREE.Vector3(), new THREE.Vector3(), 'blackhole', 50000, 18);
  bodies.push(bh);
  // Spiral arms
  const armCount = 3;
  const bodiesPerArm = 20;
  for (let arm = 0; arm < armCount; arm++) {
    const armOffset = (arm / armCount) * Math.PI * 2;
    for (let i = 0; i < bodiesPerArm; i++) {
      const t = (i / bodiesPerArm);
      const r = 60 + t * 350;
      const angle = armOffset + t * Math.PI * 3;
      const scatter = (Math.random() - 0.5) * 30;
      const pos = new THREE.Vector3(
        Math.cos(angle) * r + scatter,
        (Math.random() - 0.5) * 15,
        Math.sin(angle) * r + scatter
      );
      // Orbital velocity
      const orbitSpeed = Math.sqrt(G * 50000 / r) * 0.7;
      const tangent = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle));
      const vel = tangent.multiplyScalar(orbitSpeed);
      const type = Math.random() < 0.08 ? 'star' : 'planet';
      const b = new Body(pos, vel, type, type === 'star' ? 50 : 0.5 + Math.random() * 2, type === 'star' ? 7 : 3);
      bodies.push(b);
    }
  }
  setStatus('Galaxy spawned!');
}

function spawnChaos() {
  clearAll();
  camera.position.set(0, 100, 300);
  camState.yaw = 0; camState.pitch = -0.2;
  const types = ['planet','star','moon','asteroid'];
  for (let i = 0; i < 30; i++) {
    const pos = new THREE.Vector3(
      (Math.random() - 0.5) * 400,
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 400
    );
    const vel = new THREE.Vector3(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 20
    );
    const type = types[Math.floor(Math.random() * types.length)];
    bodies.push(new Body(pos, vel, type));
  }
  setStatus('Chaos spawned!');
}

// ─── Animation Loop ────────────────────────────────────────────────────────────
let lastTime = performance.now();

function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const rawDt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  const dt = paused ? 0 : rawDt * timeScale * 15;

  updateCamera(rawDt);

  if (!paused) {
    computeGravity(dt);
    bodies.forEach(b => b.update(dt));
  }

  document.getElementById('body-count').textContent = `Bodies: ${bodies.length}`;
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Spawn default solar system on load
spawnSolarSystem();
animate();
</script>
</body>
</html>
