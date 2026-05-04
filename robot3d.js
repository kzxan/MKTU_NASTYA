import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/loaders/GLTFLoader.js";

let scene, camera, renderer, controls;
let robot = null;
let mixer = null;
let clock = new THREE.Clock();

let activeType = "biped";
let isMoving = false;
let moveDirection = null;

let objectBox = null;
let isHoldingObject = false;

const robotModels = {
  biped: {
    name: "🚶 Biped Robot",
    path: "assets/models/biped_robot.glb",
    scale: 1.2,
    fallbackColor: 0x38bdf8,
    offset: Math.PI / 2
  },
  manipulator: {
    name: "🦾 Manipulator Robot",
    path: "assets/models/manipulator_robot.glb",
    scale: 1.2,
    fallbackColor: 0xfacc15,
    offset: 0
  }
};

function init3DScene() {
  const container = document.getElementById("threeContainer");
  if (!container) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07111f);

  camera = new THREE.PerspectiveCamera(
    55,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(4.5, 3.2, 6.2);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 1, 0);
  controls.maxPolarAngle = Math.PI / 2.05;

  addLights();
  createRoom();
  // createPickObject();
  loadRobotModel("biped");

  window.addEventListener("resize", onWindowResize);
  animate();
}

function addLights() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.65));

  const mainLight = new THREE.DirectionalLight(0xffffff, 1.3);
  mainLight.position.set(5, 8, 5);
  mainLight.castShadow = true;
  scene.add(mainLight);

  const blueLight = new THREE.PointLight(0x38bdf8, 1.6, 12);
  blueLight.position.set(-3.5, 3.2, 3);
  scene.add(blueLight);

  const purpleLight = new THREE.PointLight(0xa78bfa, 1.2, 12);
  purpleLight.position.set(3.5, 3.2, -3);
  scene.add(purpleLight);
}

function createRoom() {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 14),
    new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.55,
      metalness: 0.15
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const grid = new THREE.GridHelper(14, 14, 0x38bdf8, 0x334155);
  grid.position.y = 0.012;
  scene.add(grid);

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.85
  });

  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), wallMaterial);
  backWall.position.set(0, 3, -7);
  scene.add(backWall);

  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), wallMaterial);
  leftWall.position.set(-7, 3, 0);
  leftWall.rotation.y = Math.PI / 2;
  scene.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), wallMaterial);
  rightWall.position.set(7, 3, 0);
  rightWall.rotation.y = -Math.PI / 2;
  scene.add(rightWall);
}

function createPickObject() {
  objectBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.45, 0.45),
    new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.45,
      metalness: 0.1
    })
  );

  objectBox.position.set(1.6, 0.23, -1.2);
  objectBox.castShadow = true;
  objectBox.receiveShadow = true;
  scene.add(objectBox);
}

function resetPickObject() {
  if (!objectBox) return;
  isHoldingObject = false;
  objectBox.position.set(1.6, 0.23, -1.2);
}

function createFallbackRobot(type = "biped") {
  const group = new THREE.Group();
  const color = robotModels[type]?.fallbackColor || 0x38bdf8;

  const metal = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.35,
    metalness: 0.35
  });

  const dark = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.45,
    metalness: 0.4
  });

  const green = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    roughness: 0.4,
    metalness: 0.25
  });

  if (type === "manipulator") {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 0.35, 32), metal);
    base.position.y = 0.18;
    base.castShadow = true;
    group.add(base);

    const arm1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.7, 0.35), metal);
    arm1.position.set(0, 1.05, 0);
    arm1.rotation.z = -0.45;
    arm1.castShadow = true;
    group.add(arm1);

    const arm2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.4, 0.3), metal);
    arm2.position.set(0.75, 1.85, 0);
    arm2.rotation.z = 0.85;
    arm2.castShadow = true;
    group.add(arm2);

    const gripper = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.18, 0.22), dark);
    gripper.position.set(1.45, 1.55, 0);
    gripper.castShadow = true;
    group.add(gripper);
  } else {
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.48, 1.15, 8, 24), metal);
    body.position.y = 1.35;
    body.castShadow = true;
    group.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 32), green);
    head.position.y = 2.35;
    head.castShadow = true;
    group.add(head);

    const face = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.05), dark);
    face.position.set(0, 2.38, 0.38);
    group.add(face);

    const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.8, 8, 16), metal);
    legL.position.set(-0.23, 0.42, 0);
    legL.castShadow = true;
    group.add(legL);

    const legR = legL.clone();
    legR.position.x = 0.23;
    group.add(legR);
  }

  group.position.set(0, 0, 0);
  return group;
}

function loadRobotModel(type) {
  activeType = type;
  isMoving = false;
  moveDirection = null;
  isHoldingObject = false;

  const config = robotModels[type] || robotModels.biped;
  const title = document.getElementById("robotName");
  if (title) title.innerText = config.name;

  renderControls(type);
  resetPickObject();

  if (robot) {
    scene.remove(robot);
    robot = null;
    mixer = null;
  }

  const loader = new GLTFLoader();

  loader.load(
    config.path,
    (gltf) => {
      robot = gltf.scene;
      robot.scale.setScalar(config.scale);
      robot.position.set(0, 0, 0);
      robot.rotation.set(0, 0, 0);

      const box = new THREE.Box3().setFromObject(robot);
      const size = new THREE.Vector3();
      box.getSize(size);

      const maxSize = Math.max(size.x, size.y, size.z) || 1;
      const normalizedScale = 2.2 / maxSize;
      robot.scale.multiplyScalar(normalizedScale);

      const normalizedBox = new THREE.Box3().setFromObject(robot);
      robot.position.y -= normalizedBox.min.y;

      robot.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      scene.add(robot);

      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(robot);

        robot.userData.actions = gltf.animations.map((clip) => {
            const action = mixer.clipAction(clip);
            action.clampWhenFinished = true;
            action.loop = THREE.LoopOnce;
            return action;
        });

        // Автоматты түрде ойнатпаймыз
        }
    },
    undefined,
    () => {
      console.warn(`Модель табылмады: ${config.path}. Fallback робот көрсетілді.`);
      robot = createFallbackRobot(type);
      scene.add(robot);
    }
  );
}

function renderControls(type) {
  const panel = document.getElementById("robotControls");
  if (!panel) return;

  if (type === "biped") {
    panel.innerHTML = `
      <button onclick="setRobotDirection('forward')">⬆ Алға</button>
      <button onclick="setRobotDirection('backward')">⬇ Артқа</button>
      <button onclick="setRobotDirection('left')">⬅ Солға</button>
      <button onclick="setRobotDirection('right')">➡ Оңға</button>
      <button onclick="stopRobot3D()">⏸ Тоқтату</button>
      <button onclick="trainRobot()">🧬 Үйрету</button>
      <button onclick="resetRobot3D()">↩ Қайтару</button>
    `;
  }

    if (type === "manipulator") {
    panel.innerHTML = `
        <button onclick="grabObject()">🦾 Анимацияны қосу</button>
        <button onclick="rotateManipulatorLeft()">↺ Солға бұру</button>
        <button onclick="rotateManipulatorRight()">↻ Оңға бұру</button>
        <button onclick="resetRobot3D()">↩ Қайтару</button>
        <button onclick="trainRobot()">🧬 Үйрету</button>
    `;
    }
}

function setRobotDirection(direction) {
  if (!robot) return;

  moveDirection = direction;
  isMoving = true;

  const offset = robotModels[activeType]?.offset || 0;

  if (direction === "forward") robot.rotation.y = offset + 0;
  if (direction === "backward") robot.rotation.y = offset + Math.PI;
  if (direction === "left") robot.rotation.y = offset + Math.PI / 2;
  if (direction === "right") robot.rotation.y = offset - Math.PI / 2;
}

function moveRobot3D() {
  setRobotDirection("forward");
}

function stopRobot3D() {
  isMoving = false;
  moveDirection = null;
}

function rotateManipulatorLeft() {
  if (!robot) return;
  activeType = "manipulator";
  robot.rotation.y += 0.15;
}

function rotateManipulatorRight() {
  if (!robot) return;
  activeType = "manipulator";
  robot.rotation.y -= 0.15;
}

function getHoldPointWorld() {
  if (!robot) return new THREE.Vector3(0, 1, 0);

  const localHoldPoint =
    activeType === "manipulator"
      ? new THREE.Vector3(1.45, 1.55, 0)
      : new THREE.Vector3(0, 1.3, -0.65);

  return robot.localToWorld(localHoldPoint.clone());
}

function grabObject() {
  if (!robot || activeType !== "manipulator") return;

  if (robot.userData.actions && robot.userData.actions[0]) {
    robot.userData.actions[0].reset();
    robot.userData.actions[0].play();
  }
}  

function liftObject() {
  if (!objectBox) return;

  isHoldingObject = true;
  objectBox.position.y += 0.55;

  if (robot) {
    robot.rotation.z = Math.sin(Date.now() * 0.003) * 0.03;
  }
}

function dropObject() {
  if (!objectBox) return;

  isHoldingObject = false;
  objectBox.position.y = 0.23;
}

function resetRobot3D() {
  if (robot) {
    robot.position.set(0, 0, 0);
    robot.rotation.set(0, 0, 0);
  }

  isMoving = false;
  moveDirection = null;
  resetPickObject();
}

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  if (mixer) mixer.update(delta);

  if (robot && isMoving && moveDirection && activeType === "biped") {
    const speed = 0.035;

    if (moveDirection === "forward") robot.position.z -= speed;
    if (moveDirection === "backward") robot.position.z += speed;
    if (moveDirection === "left") robot.position.x -= speed;
    if (moveDirection === "right") robot.position.x += speed;

    robot.position.x = Math.max(-5.5, Math.min(5.5, robot.position.x));
    robot.position.z = Math.max(-5.5, Math.min(5.5, robot.position.z));
  }

  if (objectBox && isHoldingObject) {
    objectBox.position.copy(getHoldPointWorld());
  }

  controls.update();
  renderer.render(scene, camera);
}

function onWindowResize() {
  const container = document.getElementById("threeContainer");
  if (!container || !camera || !renderer) return;

  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

window.loadRobotModel = loadRobotModel;
window.moveRobot3D = moveRobot3D;
window.setRobotDirection = setRobotDirection;
window.stopRobot3D = stopRobot3D;
window.resetRobot3D = resetRobot3D;

window.rotateManipulatorLeft = rotateManipulatorLeft;
window.rotateManipulatorRight = rotateManipulatorRight;
window.grabObject = grabObject;
window.liftObject = liftObject;
window.dropObject = dropObject;

document.addEventListener("DOMContentLoaded", init3DScene);