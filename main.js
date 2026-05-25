const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

scene.clearColor = new BABYLON.Color4(0.015, 0.012, 0.04, 1);

const camera = new BABYLON.UniversalCamera(
  "camera",
  new BABYLON.Vector3(0, 4, -18),
  scene
);

camera.setTarget(new BABYLON.Vector3(0, 4, 0));
camera.attachControl(canvas, true);
camera.speed = 0.45;
camera.angularSensibility = 3500;

const hemi = new BABYLON.HemisphericLight(
  "hemi",
  new BABYLON.Vector3(0, 1, 0),
  scene
);
hemi.intensity = 1.4;

const glowMat = new BABYLON.StandardMaterial("glowMat", scene);
glowMat.emissiveColor = new BABYLON.Color3(0.35, 0.55, 1);
glowMat.diffuseColor = new BABYLON.Color3(0.5, 0.65, 1);

const stoneMat = new BABYLON.StandardMaterial("stoneMat", scene);
stoneMat.diffuseColor = new BABYLON.Color3(0.55, 0.52, 0.75);
stoneMat.emissiveColor = new BABYLON.Color3(0.05, 0.04, 0.12);

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

for (let i = 0; i < 40; i++) {
  const star = BABYLON.MeshBuilder.CreateSphere("star", {
    diameter: Math.random() * 0.4 + 0.12
  }, scene);

  star.position = new BABYLON.Vector3(
    (Math.random() - 0.5) * 120,
    Math.random() * 70 + 8,
    (Math.random() - 0.5) * 120
  );

  star.material = glowMat;
}

for (let i = 0; i < 12; i++) {
  const mono = BABYLON.MeshBuilder.CreateBox("monolith", {
    width: 2,
    height: Math.random() * 14 + 8,
    depth: 2
  }, scene);

  mono.position = new BABYLON.Vector3(
    (Math.random() - 0.5) * 70,
    Math.random() * 20 + 8,
    Math.random() * 60
  );

  mono.rotation.x = Math.random();
  mono.rotation.y = Math.random();
  mono.material = i % 3 === 0 ? glowMat : stoneMat;
}

const keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

scene.onBeforeRenderObservable.add(() => {
  const forward = camera.getDirection(BABYLON.Axis.Z);
  const right = camera.getDirection(BABYLON.Axis.X);

  forward.y = 0;
  right.y = 0;
  forward.normalize();
  right.normalize();

  let move = BABYLON.Vector3.Zero();

  if (keys.w) move.addInPlace(forward);
  if (keys.s) move.subtractInPlace(forward);
  if (keys.d) move.addInPlace(right);
  if (keys.a) move.subtractInPlace(right);

  if (move.length() > 0) {
    move.normalize();
    camera.position.addInPlace(move.scale(0.35));
  }
});

engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener("resize", () => {
  engine.resize();
});
