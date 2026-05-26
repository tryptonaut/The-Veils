const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

scene.clearColor = new BABYLON.Color4(0.015, 0.012, 0.04, 1);

const camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(0, 8, -35), scene);
camera.setTarget(new BABYLON.Vector3(0, 4, 0));
camera.speed = 0;

const hemi = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
hemi.intensity = 1.45;

const glowMat = new BABYLON.StandardMaterial("glowMat", scene);
glowMat.emissiveColor = new BABYLON.Color3(0.35, 0.55, 1);
glowMat.diffuseColor = new BABYLON.Color3(0.5, 0.65, 1);

const stoneMat = new BABYLON.StandardMaterial("stoneMat", scene);
stoneMat.diffuseColor = new BABYLON.Color3(0.55, 0.52, 0.75);
stoneMat.emissiveColor = new BABYLON.Color3(0.05, 0.04, 0.12);

const platform = BABYLON.MeshBuilder.CreateCylinder("platform", {
  diameter: 42,
  height: 2,
  tessellation: 9
}, scene);
platform.material = stoneMat;

const eye = BABYLON.MeshBuilder.CreateBox("Stone Eye", { width: 10, height: 7, depth: 2 }, scene);
eye.position = new BABYLON.Vector3(0, 5, 10);
eye.material = stoneMat;

const pupil = BABYLON.MeshBuilder.CreateSphere("Eye Glow", { diameter: 2.5 }, scene);
pupil.position = new BABYLON.Vector3(0, 5, 8.8);
pupil.scaling.y = 0.35;
pupil.material = glowMat;

for (let i = 0; i < 90; i++) {
  const star = BABYLON.MeshBuilder.CreateSphere("star", { diameter: Math.random() * 0.35 + 0.08 }, scene);
  star.position = new BABYLON.Vector3(
    (Math.random() - 0.5) * 150,
    Math.random() * 85 + 6,
    (Math.random() - 0.5) * 150
  );
  star.material = glowMat;
}

for (let i = 0; i < 18; i++) {
  const mono = BABYLON.MeshBuilder.CreateBox("monolith", {
    width: Math.random() * 2 + 1.3,
    height: Math.random() * 16 + 8,
    depth: Math.random() * 2 + 1.3
  }, scene);
  mono.position = new BABYLON.Vector3(
    (Math.random() - 0.5) * 85,
    Math.random() * 24 + 8,
    Math.random() * 75 - 5
  );
  mono.rotation.x = Math.random() * 0.8;
  mono.rotation.y = Math.random() * Math.PI;
  mono.rotation.z = Math.random() * 0.8;
  mono.material = i % 3 === 0 ? glowMat : stoneMat;
}

const glyph = BABYLON.MeshBuilder.CreateTorus("glyph", {
  diameter: 4,
  thickness: 0.06,
  tessellation: 96
}, scene);
glyph.position = new BABYLON.Vector3(8, 4, 4);
glyph.rotation.x = Math.PI / 2;
glyph.material = glowMat;

let moveX = 0;
let moveZ = 0;
let sprinting = false;
let verticalVelocity = 0;
let grounded = true;

const base = document.getElementById("stickBase");
const stick = document.getElementById("stick");
const jumpBtn = document.getElementById("jumpBtn");
const sprintBtn = document.getElementById("sprintBtn");

let joystickActive = false;
let joystickPointer = null;

function resetStick() {
  joystickActive = false;
  joystickPointer = null;
  moveX = 0;
  moveZ = 0;
  stick.style.left = "38px";
  stick.style.top = "38px";
}

function updateStick(e) {
  const rect = base.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  let dx = e.clientX - cx;
  let dy = e.clientY - cy;

  const max = 42;
  const dist = Math.hypot(dx, dy);

  if (dist > max) {
    dx = (dx / dist) * max;
    dy = (dy / dist) * max;
  }

  stick.style.left = `${38 + dx}px`;
  stick.style.top = `${38 + dy}px`;

  moveX = dx / max;
  moveZ = -dy / max;
}

base.addEventListener("pointerdown", e => {
  e.preventDefault();
  joystickActive = true;
  joystickPointer = e.pointerId;
  updateStick(e);
}, { passive: false });

window.addEventListener("pointermove", e => {
  if (!joystickActive || e.pointerId !== joystickPointer) return;
  e.preventDefault();
  updateStick(e);
}, { passive: false });

window.addEventListener("pointerup", e => {
  if (e.pointerId === joystickPointer) resetStick();
});

window.addEventListener("pointercancel", resetStick);

sprintBtn.addEventListener("pointerdown", e => {
  e.preventDefault();
  sprinting = true;
}, { passive: false });

window.addEventListener("pointerup", () => {
  sprinting = false;
});

jumpBtn.addEventListener("pointerdown", e => {
  e.preventDefault();
  if (grounded) {
    verticalVelocity = 0.32;
    grounded = false;
  }
}, { passive: false });

let looking = false;
let lookPointer = null;
let lastX = 0;
let lastY = 0;

canvas.addEventListener("pointerdown", e => {
  const target = e.target;
  if (target.closest && target.closest("#mobileControls")) return;

  looking = true;
  lookPointer = e.pointerId;
  lastX = e.clientX;
  lastY = e.clientY;
}, { passive: false });

window.addEventListener("pointermove", e => {
  if (!looking || e.pointerId !== lookPointer) return;

  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;

  lastX = e.clientX;
  lastY = e.clientY;

  camera.rotation.y += dx * 0.006;
  camera.rotation.x += dy * 0.006;

  camera.rotation.x = Math.max(-1.25, Math.min(1.25, camera.rotation.x));
}, { passive: false });

window.addEventListener("pointerup", e => {
  if (e.pointerId === lookPointer) {
    looking = false;
    lookPointer = null;
  }
});

scene.onBeforeRenderObservable.add(() => {
  const dt = engine.getDeltaTime() / 1000;
  glyph.rotation.z += dt;

  const forward = camera.getDirection(BABYLON.Axis.Z);
  const right = camera.getDirection(BABYLON.Axis.X);

  forward.y = 0;
  right.y = 0;
  forward.normalize();
  right.normalize();

  const speed = sprinting ? 24 : 13;

  const move = forward.scale(moveZ).add(right.scale(moveX));

  if (move.length() > 0) {
    move.normalize();
    camera.position.addInPlace(move.scale(speed * dt));
  }

  verticalVelocity -= 0.9 * dt;
  camera.position.y += verticalVelocity;

  if (camera.position.y <= 8) {
    camera.position.y = 8;
    verticalVelocity = 0;
    grounded = true;
  }
});

engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());
