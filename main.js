const canvas = document.getElementById("renderCanvas");

const engine = new BABYLON.Engine(canvas, true, {
  preserveDrawingBuffer: true,
  stencil: true
});

const scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color4(0.015, 0.012, 0.04, 1);

const camera = new BABYLON.UniversalCamera(
  "camera",
  new BABYLON.Vector3(0, 8, -35),
  scene
);

camera.setTarget(new BABYLON.Vector3(0, 4, 0));
camera.attachControl(canvas, true);
camera.speed = 0;
camera.angularSensibility = 3500;

canvas.addEventListener("click", () => {
  canvas.requestPointerLock?.();
});

const hemi = new BABYLON.HemisphericLight(
  "hemi",
  new BABYLON.Vector3(0, 1, 0),
  scene
);
hemi.intensity = 1.45;

const glowMat = new BABYLON.StandardMaterial("glowMat", scene);
glowMat.emissiveColor = new BABYLON.Color3(0.35, 0.55, 1);
glowMat.diffuseColor = new BABYLON.Color3(0.5, 0.65, 1);

const stoneMat = new BABYLON.StandardMaterial("stoneMat", scene);
stoneMat.diffuseColor = new BABYLON.Color3(0.55, 0.52, 0.75);
stoneMat.emissiveColor = new BABYLON.Color3(0.05, 0.04, 0.12);

const darkMat = new BABYLON.StandardMaterial("darkMat", scene);
darkMat.diffuseColor = new BABYLON.Color3(0.18, 0.16, 0.3);
darkMat.emissiveColor = new BABYLON.Color3(0.025, 0.02, 0.06);

const ground = BABYLON.MeshBuilder.CreateCylinder("Stone Eye Platform", {
  diameter: 42,
  height: 2,
  tessellation: 9
}, scene);
ground.position.y = 0;
ground.material = stoneMat;

const eye = BABYLON.MeshBuilder.CreateBox("The Stone Eye", {
  width: 10,
  height: 7,
  depth: 2
}, scene);
eye.position = new BABYLON.Vector3(0, 5, 10);
eye.material = stoneMat;

const pupil = BABYLON.MeshBuilder.CreateSphere("Eye Glow", {
  diameter: 2.5
}, scene);
pupil.position = new BABYLON.Vector3(0, 5, 8.8);
pupil.scaling.y = 0.35;
pupil.material = glowMat;

for (let i = 0; i < 80; i++) {
  const star = BABYLON.MeshBuilder.CreateSphere("star", {
    diameter: Math.random() * 0.35 + 0.08
  }, scene);

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

for (let i = 0; i < 12; i++) {
  const shard = BABYLON.MeshBuilder.CreateBox("edgeShard", {
    width: 1.2,
    height: 3 + Math.random() * 4,
    depth: 1
  }, scene);

  const angle = (Math.PI * 2 * i) / 12;

  shard.position = new BABYLON.Vector3(
    Math.cos(angle) * 22,
    2.2,
    Math.sin(angle) * 22
  );

  shard.rotation.y = -angle;
  shard.rotation.x = Math.random() * 0.4;
  shard.material = i % 4 === 0 ? glowMat : darkMat;
}

const glyph = BABYLON.MeshBuilder.CreateTorus("Veil Glyph", {
  diameter: 4,
  thickness: 0.06,
  tessellation: 96
}, scene);
glyph.position = new BABYLON.Vector3(8, 4, 4);
glyph.rotation.x = Math.PI / 2;
glyph.material = glowMat;

const keys = {};
const mobileMove = { x: 0, z: 0 };

let verticalVelocity = 0;
let grounded = true;
let sprinting = false;

window.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;

  if (e.code === "Space") {
    jump();
  }
});

window.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

function jump() {
  if (!grounded) return;
  verticalVelocity = 0.38;
  grounded = false;
}

function setupMobileControls() {
  const base = document.getElementById("stickBase");
  const stick = document.getElementById("stick");
  const jumpBtn = document.getElementById("jumpBtn");
  const sprintBtn = document.getElementById("sprintBtn");

  if (!base || !stick || !jumpBtn || !sprintBtn) return;

  let active = false;
  let rect = null;

  function resetStick() {
    stick.style.left = "38px";
    stick.style.top = "38px";
    mobileMove.x = 0;
    mobileMove.z = 0;
  }

  function handleStick(touch) {
    if (!rect) rect = base.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;

    const max = 42;
    const dist = Math.hypot(dx, dy);

    if (dist > max) {
      dx = (dx / dist) * max;
      dy = (dy / dist) * max;
    }

    stick.style.left = `${38 + dx}px`;
    stick.style.top = `${38 + dy}px`;

    mobileMove.x = dx / max;
    mobileMove.z = -dy / max;
  }

  base.addEventListener("touchstart", e => {
    e.preventDefault();
    active = true;
    rect = base.getBoundingClientRect();
    handleStick(e.touches[0]);
  }, { passive: false });

  base.addEventListener("touchmove", e => {
    e.preventDefault();
    if (!active) return;
    handleStick(e.touches[0]);
  }, { passive: false });

  base.addEventListener("touchend", e => {
    e.preventDefault();
    active = false;
    resetStick();
  }, { passive: false });

  jumpBtn.addEventListener("touchstart", e => {
    e.preventDefault();
    jump();
  }, { passive: false });

  sprintBtn.addEventListener("touchstart", e => {
    e.preventDefault();
    sprinting = true;
  }, { passive: false });

  sprintBtn.addEventListener("touchend", e => {
    e.preventDefault();
    sprinting = false;
  }, { passive: false });
}

setupMobileControls();

scene.onBeforeRenderObservable.add(() => {
  const dt = engine.getDeltaTime() / 1000;

  glyph.rotation.z += dt * 0.8;

  const forward = camera.getDirection(BABYLON.Axis.Z);
  const right = camera.getDirection(BABYLON.Axis.X);

  forward.y = 0;
  right.y = 0;

  forward.normalize();
  right.normalize();

  let inputX = 0;
  let inputZ = 0;

  if (keys.w) inputZ += 1;
  if (keys.s) inputZ -= 1;
  if (keys.a) inputX -= 1;
  if (keys.d) inputX += 1;

  inputX += mobileMove.x;
  inputZ += mobileMove.z;

  const mag = Math.hypot(inputX, inputZ);

  if (mag > 1) {
    inputX /= mag;
    inputZ /= mag;
  }

  const speed = sprinting || keys.shift ? 18 : 10;

  const move = forward.scale(inputZ).add(right.scale(inputX));

  if (move.length() > 0) {
    move.normalize();
    camera.position.addInPlace(move.scale(speed * dt));
  }

  verticalVelocity -= 0.95 * dt;
  camera.position.y += verticalVelocity;

  if (camera.position.y <= 8) {
    camera.position.y = 8;
    verticalVelocity = 0;
    grounded = true;
  }

  if (camera.position.y < -40) {
    camera.position = new BABYLON.Vector3(0, 8, -35);
    camera.setTarget(new BABYLON.Vector3(0, 4, 0));
    verticalVelocity = 0;
    grounded = true;
  }
});

engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener("resize", () => {
  engine.resize();
});
