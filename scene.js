"use strict";

(() => {
  const canvas = document.querySelector("#topology-canvas");
  const hero = document.querySelector(".studio-hero");
  const tools = document.querySelector(".scene-tools");
  const THREE = window.THREE;
  if (!canvas || !THREE) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  } catch {
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor(0x130c1b, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-10, 10, 7, -7, .1, 100);
  camera.position.set(13, 12, 15);
  camera.lookAt(0, 1, 0);
  const ambientLight = new THREE.HemisphereLight(0xf6edc0, 0x21152b, 2.6);
  scene.add(ambientLight);
  const light = new THREE.DirectionalLight(0xffffff, 3.2);
  light.position.set(-5, 12, 7);
  light.castShadow = true;
  light.shadow.mapSize.set(1024, 1024);
  light.shadow.camera.left = -9;
  light.shadow.camera.right = 9;
  light.shadow.camera.top = 9;
  light.shadow.camera.bottom = -9;
  light.shadow.normalBias = .05;
  scene.add(light);

  const structure = new THREE.Group();
  scene.add(structure);
  const white = new THREE.MeshStandardMaterial({ color: 0xf0e5b5, roughness: .36, metalness: .28 });
  const graphite = new THREE.MeshStandardMaterial({ color: 0x1b1026, roughness: .5, metalness: .3 });
  const layers = [];
  const nodeGeometry = new THREE.BoxGeometry(.82, .58, .82);
  const plateGeometry = new THREE.BoxGeometry(4.6, .13, 3.6);
  const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x60486c, transparent: true, opacity: .3 });

  function addBlock(geometry, material, parent, position) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  ["network", "storage", "compute"].forEach((name, layerIndex) => {
    const group = new THREE.Group();
    const height = layerIndex * 1.65;
    group.position.y = height;
    const accent = new THREE.MeshStandardMaterial({ color: name === "compute" ? 0xf0d66e : 0x553a66, roughness: .46, metalness: .12 });
    addBlock(plateGeometry, white, group, [0, 0, 0]);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(plateGeometry), edgeMaterial);
    group.add(edges);
    for (let column = 0; column < 4; column += 1) {
      for (let row = 0; row < 3; row += 1) {
        const horizontal = (column - 1.5) * 1.04;
        const depth = (row - 1) * 1.05;
        addBlock(nodeGeometry, layerIndex === 1 ? graphite : white, group, [horizontal, .39, depth]);
        addBlock(new THREE.BoxGeometry(.66, .035, .66), accent, group, [horizontal, .7, depth]);
        for (let vent = 0; vent < 3; vent += 1) {
          addBlock(new THREE.BoxGeometry(.57, .035, .012), layerIndex === 1 ? white : graphite, group, [horizontal, .28 + vent * .105, depth + .417]);
        }
      }
    }
    layers.push({ name, group, accent, height });
    structure.add(group);
  });

  const connectorMaterial = new THREE.MeshStandardMaterial({ color: 0xb9a8c2, metalness: .5, roughness: .4 });
  for (const horizontal of [-2.03, 2.03]) {
    for (const depth of [-1.48, 1.48]) {
      addBlock(new THREE.CylinderGeometry(.025, .025, 3.35, 8), connectorMaterial, structure, [horizontal, 1.7, depth]);
    }
  }

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ color: 0x21152b, opacity: .16 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -.4;
  floor.receiveShadow = true;
  scene.add(floor);

  let frame = 0;
  let visible = true;
  let paused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let pointerHorizontal = 0;
  let pointerVertical = 0;
  let compact = false;
  let activeLayer = "compute";
  const motionButton = document.querySelector("#scene-motion");
  const labels = { compute: "Compute fabric", storage: "Storage topology", network: "Network connections" };
  let lightTheme = document.documentElement.dataset.theme === "light";

  function updateLayerColors() {
    layers.forEach(layer => layer.accent.color.setHex(layer.name === activeLayer
      ? lightTheme ? 0x68477c : 0xf0d66e
      : lightTheme ? 0xe7dcaa : 0x553a66));
  }

  function applySceneTheme() {
    lightTheme = document.documentElement.dataset.theme === "light";
    renderer.setClearColor(lightTheme ? 0xfffbea : 0x130c1b, 0);
    white.color.setHex(lightTheme ? 0xfffdf3 : 0xf0e5b5);
    graphite.color.setHex(lightTheme ? 0x614874 : 0x1b1026);
    ambientLight.color.setHex(lightTheme ? 0xffffff : 0xf6edc0);
    ambientLight.groundColor.setHex(lightTheme ? 0xe6ddbe : 0x21152b);
    edgeMaterial.color.setHex(lightTheme ? 0x917aa0 : 0x60486c);
    connectorMaterial.color.setHex(lightTheme ? 0x8e779d : 0xb9a8c2);
    floor.material.opacity = lightTheme ? .18 : .16;
    updateLayerColors();
    renderer.render(scene, camera);
    canvas.dataset.theme = lightTheme ? "light" : "dark";
    scheduleRender();
  }

  function render(time = 0) {
    frame = 0;
    if (!paused) {
      structure.rotation.y += (pointerHorizontal * .16 - structure.rotation.y) * .035;
      structure.rotation.x += (pointerVertical * .05 - structure.rotation.x) * .035;
      layers.forEach((layer, layerIndex) => {
        layer.group.position.y = layer.height + Math.sin(time * .0007 + layerIndex * .9) * .055;
      });
    }
    renderer.render(scene, camera);
    canvas.dataset.layer = activeLayer;
    if (!paused && visible && !document.hidden) frame = requestAnimationFrame(render);
  }

  function scheduleRender() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  function resize() {
    const width = hero.clientWidth;
    const height = hero.clientHeight;
    const aspect = width / height;
    compact = width <= 560;
    const viewHeight = compact ? 16.5 : width <= 800 ? 13.7 : 11.6;
    camera.left = -viewHeight * aspect / 2;
    camera.right = viewHeight * aspect / 2;
    camera.top = viewHeight / 2;
    camera.bottom = -viewHeight / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    const center = new THREE.Vector3(0, 1.5, 0);
    const projectedCenter = center.clone().project(camera);
    const shortMobile = compact && height < 600;
    const verticalCenter = compact ? shortMobile ? height < 500 ? -.3 : -.34 : -.42 : height < 500 ? .12 : .06;
    const desired = new THREE.Vector3(compact ? .23 : width <= 800 ? .63 : .5, verticalCenter, projectedCenter.z).unproject(camera);
    structure.position.copy(desired.sub(center));
    structure.scale.setScalar(compact ? shortMobile ? .5 : .69 : width <= 800 ? .8 : 1);
    floor.position.y = structure.position.y - .4;
    scheduleRender();
  }

  document.querySelectorAll("button[data-layer]").forEach((button) => {
    button.addEventListener("click", () => {
      activeLayer = button.dataset.layer;
      document.querySelectorAll("button[data-layer]").forEach(control => control.setAttribute("aria-pressed", String(control === button)));
      updateLayerColors();
      document.querySelector("#scene-label").textContent = labels[activeLayer];
      scheduleRender();
    });
  });

  function updateMotionButton() {
    motionButton.setAttribute("aria-pressed", String(paused));
    motionButton.setAttribute("aria-label", paused ? "Resume scene motion" : "Pause scene motion");
    motionButton.title = paused ? "Resume scene motion" : "Pause scene motion";
    motionButton.innerHTML = `<i data-lucide="${paused ? "play" : "pause"}" aria-hidden="true"></i><span class="control-tooltip">${paused ? "Resume" : "Pause"} motion</span>`;
    if (window.lucide) window.lucide.createIcons();
  }

  motionButton.addEventListener("click", () => {
    paused = !paused;
    updateMotionButton();
    scheduleRender();
  });
  window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", event => {
    paused = event.matches;
    updateMotionButton();
    scheduleRender();
  });
  hero.addEventListener("pointermove", event => {
    const bounds = hero.getBoundingClientRect();
    pointerHorizontal = (event.clientX - bounds.left) / bounds.width - .5;
    pointerVertical = (event.clientY - bounds.top) / bounds.height - .5;
    scheduleRender();
  });
  hero.addEventListener("pointerleave", () => {
    pointerHorizontal = 0;
    pointerVertical = 0;
  });
  new ResizeObserver(resize).observe(hero);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) scheduleRender();
  }).observe(hero);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) scheduleRender();
  });
  window.addEventListener("themechange", applySceneTheme);
  canvas.addEventListener("webglcontextlost", event => {
    event.preventDefault();
    cancelAnimationFrame(frame);
    paused = true;
    hero.classList.remove("scene-ready");
    tools.hidden = true;
  });
  updateMotionButton();
  tools.hidden = false;
  hero.classList.add("scene-ready");
  resize();
  applySceneTheme();
})();