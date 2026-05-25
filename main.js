const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true, {
  preserveDrawingBuffer: true,
  stencil: true
});

let scene;
let camera;
let playerVelocity = new BABYLON.Vector3(0, 0, 0);
let grounded = false;
let moveInput = { x: 0, z: 0 };
let sprinting = false;

const keys = {};

function createScene() {
  scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.005, 0.004, 0.012, 1);

  scene.gravity = new BABYLON.Vector3(0, -0.45, 0);
  scene.collisionsEnabled = true;

  createCamera();
  createLights();
  createMaterials();
  createWorld();
  createStars();
  createMobileControls();

  scene.onBeforeRenderObservable.add(updatePlayer);

  return scene;
}

function createCamera() {
  camera = new BABYLON.UniversalCamera(
    "VeilCamera",
    new BABYLON.Vector3(0, 3, -12),
    scene
  );

  camera.attachControl(canvas, true);
  camera.minZ = 0.1;
  camera.speed = 0;
  camera.angularSensibility = 4200;
  camera.applyGravity = false;
  camera.checkCollisions = true;
  camera.ellipsoid = new BABYLON.Vector3(0.7, 1.4, 0.7);

  canvas.addEventListener("click", () => {
    canvas.requestPointerLock?.();
  });
}

let matStone, matDark, matGlow, matBlueGlow, matVoid;

function createMaterials() {
  matStone = new BABYLON.StandardMaterial("dreamStone", scene);
  matStone.diffuseColor = new BABYLON.Color3(0.25, 0.24, 0.32);
  matStone.specularColor = new BABYLON.Color3(0.08, 0.08, 0.12);
  matStone.emissiveColor = new BABYLON.Color3(0.025, 0.025, 0.06);

  matDark = new BABYLON.StandardMaterial("voidRock", scene);
  matDark.diffuseColor = new BABYLON.Color3(0.08, 0.075, 0.12);
  matDark.specularColor = new BABYLON.Color3(0.04, 0.04, 0.08);
  matDark.emissiveColor = new BABYLON.Color3(0.015, 0.01, 0.035);

  matGlow = new BABYLON.StandardMaterial("glyphGlow", scene);
  matGlow.diffuseColor = new BABYLON.Color3(0.75, 0.78, 1);
  matGlow.emissiveColor = new BABYLON.Color3(0.25, 0.35, 1);

  matBlueGlow = new BABYLON.StandardMaterial("blueDreamGlow", scene);
  matBlueGlow.diffuseColor = new BABYLON.Color3(0.3, 0.55, 1);
  matBlueGlow.emissiveColor = new BABYLON.Color3(0.05, 0.18, 0.8);

  matVoid = new BABYLON.StandardMaterial("voidMaterial", scene);
  matVoid.diffuseColor = new BABYLON.Color3(0.02, 0.015, 0.04);
  matVoid.emissiveColor = new BABYLON.Color3(0.01, 0.008, 0.03);
}

function createLights() {
  const hemi = new BABYLON.HemisphericLight(
    "cosmicHemi",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  hemi.intensity = 0.55;
  hemi.diffuse = new BABYLON.Color3(0.45, 0.48, 0.8);
  hemi.groundColor = new BABYLON.Color3(0.04, 0.03, 0.08);

  const moon = new BABYLON.PointLight(
    "impossibleStar",
    new BABYLON.Vector3(0, 28, -18),
    scene
  );
  moon.intensity = 1.2;
  moon.diffuse = new BABYLON.Color3(0.55, 0.65, 1);
  moon.specular = new BABYLON.Color3(0.7, 0.8, 1);
}

function createWorld() {
  createMainPlatform();
  createStoneEye();
  createFloatingMonoliths();
  createBrokenRuins();
  createDreamPath();
  createGlyphRing();
}

function createMainPlatform() {
  const ground = BABYLON.MeshBuilder.CreateCylinder(
    "StoneEyePlatform",
    {
      diameter: 42,
      height: 2,
      tessellation: 9
    },
    scene
  );
  ground.position.y = 0;
  ground.material = matStone;
  ground.checkCollisions = true;

  const rim = BABYLON.MeshBuilder.CreateTorus(
    "platformRim",
    {
      diameter: 42,
      thickness: 0.18,
      tessellation: 96
    },
    scene
  );
  rim.position.y = 1.08;
  rim.material = matGlow;

  for (let i = 0; i < 16; i++) {
    const angle = (Math.PI * 2 * i) / 16;
    const shard = BABYLON.MeshBuilder.CreateBox(
      "edgeShard",
      {
        width: 1.2,
        height: 3 + Math.random() * 3,
        depth: 0.8
      },
      scene
    );
    shard.position.x = Math.cos(angle) * 22;
    shard.position.z = Math.sin(angle) * 22;
    shard.position.y = 1.3;
    shard.rotation.y = -angle;
    shard.rotation.x = Math.random() * 0.35;
    shard.material = i % 3 === 0 ? matGlow : matDark;
    shard.checkCollisions = true;
  }
}

function createStoneEye() {
  const eyeBase = BABYLON.MeshBuilder.CreateBox(
    "StoneEye",
    {
      width: 10,
      height: 7,
      depth: 2
    },
    scene
  );
  eyeBase.position = new BABYLON.Vector3(0, 5, 11);
  eyeBase.rotation.x = 0.08;
  eyeBase.material = matDark;
  eyeBase.checkCollisions = true;

  const pupil = BABYLON.MeshBuilder.CreateSphere(
    "EyePupil",
    {
      diameterX: 3.5,
      diameterY: 1.2,
      diameterZ: 0.35,
      segments: 32
    },
    scene
  );
  pupil.position = new BABYLON.Vector3(0, 5.3, 9.86);
  pupil.material = matGlow;

  const tear = BABYLON.MeshBuilder.CreateCylinder(
    "EyeTear",
    {
      diameterTop: 0.5,
      diameterBottom: 1.5,
      height: 4,
      tessellation: 5
    },
    scene
  );
  tear.position = new BABYLON.Vector3(0, 2.2, 9.9);
  tear.rotation.z = Math.PI;
  tear.material = matBlueGlow;

  const brow = BABYLON.MeshBuilder.CreateBox(
    "EyeBrow",
    {
      width: 12,
      height: 0.7,
      depth: 1
    },
    scene
  );
  brow.position = new BABYLON.Vector3(0, 8.7, 9.8);
  brow.rotation.z = 0.08;
  brow.material = matStone;
}

function createFloatingMonoliths() {
  for (let i = 0; i < 18; i++) {
    const mono = BABYLON.MeshBuilder.CreateBox(
      "floatingMonolith",
      {
        width: 2 + Math.random() * 2,
        height: 8 + Math.random() * 18,
        depth: 2 + Math.random() * 2
      },
      scene
    );

    const angle = Math.random() * Math.PI * 2;
    const dist = 35 + Math.random() * 65;

    mono.position = new BABYLON.Vector3(
      Math.cos(angle) * dist,
      8 + Math.random() * 28,
      Math.sin(angle) * dist
    );

    mono.rotation.x = Math.random() * 0.7;
    mono.rotation.y = Math.random() * Math.PI;
    mono.rotation.z = Math.random() * 0.7;

    mono.material = Math.random() > 0.72 ? matGlow : matDark;

    scene.registerBeforeRender(() => {
      mono.rotation.y += 0.0008;
      mono.position.y += Math.sin(performance.now() * 0.0005 + i) * 0.002;
    });
  }
}

function createBrokenRuins() {
  for (let i = 0; i < 10; i++) {
    const pillar = BABYLON.MeshBuilder.CreateCylinder(
      "brokenPillar",
      {
        diameter: 1.7,
        height: 5 + Math.random() * 7,
        tessellation: 6
      },
      scene
    );

    pillar.position = new BABYLON.Vector3(
      -16 + Math.random() * 11,
      2 + Math.random() * 2,
      -7 + Math.random() * 18
    );

    pillar.rotation.x = Math.random() * 0.35;
    pillar.rotation.z = Math.random() * 0.35;
    pillar.material = matStone;
    pillar.checkCollisions = true;
  }

  const archLeft = BABYLON.MeshBuilder.CreateBox(
    "archLeft",
    { width: 1.3, height: 8, depth: 1.3 },
    scene
  );
  archLeft.position = new BABYLON.Vector3(-14, 5, 6);
  archLeft.material = matStone;
  archLeft.checkCollisions = true;

  const archRight = archLeft.clone("archRight");
  archRight.position.x = -9;

  const archTop = BABYLON.MeshBuilder.CreateBox(
    "archTop",
    { width: 6.4, height: 1.1, depth: 1.2 },
    scene
  );
  archTop.position = new BABYLON.Vector3(-11.5, 9, 6);
  archTop.material = matGlow;
  archTop.checkCollisions = true;
}

function createDreamPath() {
  for (let i = 0; i < 14; i++) {
    const stone = BABYLON.MeshBuilder.CreateCylinder(
      "dreamStep",
      {
        diameter: 3.4 - i * 0.06,
        height: 0.45,
        tessellation: 7
      },
      scene
    );

    stone.position = new BABYLON.Vector3(
      7 + Math.sin(i * 0.8) * 3,
      0.35 + i * 0.22,
      -8 - i * 3.2
    );

    stone.rotation.y = i * 0.4;
    stone.material = i % 4 === 0 ? matBlueGlow : matStone;
    stone.checkCollisions = true;
  }
}

function createGlyphRing() {
  for (let i = 0; i < 5; i++) {
    const glyph = BABYLON.MeshBuilder.CreateTorus(
      "veilGlyph",
      {
        diameter: 2.5 + i * 0.4,
        thickness: 0.035,
        tessellation: 80
      },
      scene
    );

    glyph.position = new BABYLON.Vector3(9, 3 + i * 0.15, 5);
    glyph.rotation.x = Math.PI / 2;
    glyph.rotation.z = i * 0.8;
    glyph.material = matGlow;

    scene.registerBeforeRender(() => {
      glyph.rotation.z += 0.003 + i * 0.0007;
    });
  }
}

function createStars() {
  const starMat = new BABYLON.StandardMaterial("starMat", scene);
  starMat.emissiveColor = new BABYLON.Color3(0.8, 0.86, 1);
  starMat.diffuseColor = new BABYLON.Color3(0.8, 0.86, 1);

  for (let i = 0; i < 420; i++) {
    const star = BABYLON.MeshBuilder.CreateSphere(
      "star",
      {
        diameter: Math.random() * 0.18 + 0.035,
        segments: 6
      },
      scene
    );

    const angle = Math.random() * Math.PI * 2;
    const height = -10 + Math.random() * 90;
    const dist = 80 + Math.random() * 220;

    star.position = new BABYLON.Vector3(
      Math.cos(angle) * dist,
      height,
      Math.sin(angle) * dist
    );

    star.material = starMat;
  }

  for (let i = 0; i < 9; i++) {
    const impossibleStar = BABYLON.MeshBuilder.CreateSphere(
      "impossibleStarLarge",
      {
        diameter: 1 + Math.random() * 2.2,
        segments: 16
      },
      scene
    );

    const angle = Math.random() * Math.PI * 2;
    const dist = 90 + Math.random() * 80;

    impossibleStar.position = new BABYLON.Vector3(
      Math.cos(angle) * dist,
      35 + Math.random() * 55,
      Math.sin(angle) * dist
    );

    impossibleStar.material = matGlow;

    scene.registerBeforeRender(() => {
      impossibleStar.scaling.x = 1 + Math.sin(performance.now() * 0.001 + i) * 0.12;
      impossibleStar.scaling.y = 1 + Math.cos(performance.now() * 0.001 + i) * 0.12;
    });
  }
}

function updatePlayer() {
  const dt = engine.getDeltaTime() / 1000;

  let forward = camera.getDirection(BABYLON.Axis.Z);
  let right = camera.getDirection(BABYLON.Axis.X);

  forward.y = 0;
  right.y = 0;

  forward.normalize();
  right.normalize();

  let inputX = 0;
  let inputZ = 0;

  if (keys["w"]) inputZ += 1;
  if (keys["s"]) inputZ -= 1;
  if (keys["a"]) inputX -= 1;
  if (keys["d"]) inputX += 1;

  inputX += moveInput.x;
  inputZ += moveInput.z;

  const inputLength = Math.hypot(inputX, inputZ);
  if (inputLength > 1) {
    inputX /= inputLength;
    inputZ /= inputLength;
  }

  const speed = sprinting || keys["shift"] ? 12 : 7;

  const move = forward.scale(inputZ).add(right.scale(inputX)).scale(speed * dt);

  playerVelocity.y += scene.gravity.y * dt * 3.5;

  const oldY = camera.position.y;

  camera.moveWithCollisions(new BABYLON.Vector3(move.x, playerVelocity.y, move.z));

  if (camera.position.y <= 2.8) {
    grounded = true;
    playerVelocity.y = 0;
    camera.position.y = 2.8;
  } else if (Math.abs(camera.position.y - oldY) < 0.001 && playerVelocity.y < 0) {
    grounded = true;
    playerVelocity.y = 0;
  } else {
    grounded = false;
  }

  if (camera.position.y < -40) {
    camera.position = new BABYLON.Vector3(0, 3, -12);
    playerVelocity = new BABYLON.Vector3(0, 0, 0);
  }
}

function jump() {
  if (grounded) {
    playerVelocity.y = 0.32;
    grounded = false;
  }
}

window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;

  if (e.code === "Space") {
    jump();
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

function createMobileControls() {
  const base = document.getElementById("stickBase");
  const stick = document.getElementById("stick");
  const jumpBtn = document.getElementById("jumpBtn");
  const sprintBtn = document.getElementById("sprintBtn");

  let active = false;
  let baseRect;

  function resetStick() {
    stick.style.left = "38px";
    stick.style.top = "38px";
    moveInput.x = 0;
    moveInput.z = 0;
  }

  base.addEventListener("touchstart", (e) => {
    active = true;
    baseRect = base.getBoundingClientRect();
    handleStick(e.touches[0]);
  });

  base.addEventListener("touchmove", (e) => {
    if (!active) return;
    handleStick(e.touches[0]);
  });

  base.addEventListener("touchend", () => {
    active = false;
    resetStick();
  });

  function handleStick(touch) {
    const centerX = baseRect.left + baseRect.width / 2;
    const centerY = baseRect.top + baseRect.height / 2;

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

    moveInput.x = dx / max;
    moveInput.z = -dy / max;
  }

  jumpBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    jump();
  });

  sprintBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    sprinting = true;
  });

  sprintBtn.addEventListener("touchend", (e) => {
    e.preventDefault();
    sprinting = false;
  });
}

scene = createScene();

engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener("resize", () => {
  engine.resize();
});
