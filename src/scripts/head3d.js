import * as THREE from "three";

const canvas = document.getElementById("headCanvas");

if (!canvas) {
  console.error("[head3d] canvas not found");
} else {
  console.log("[head3d] start");

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });

  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 4);
  camera.lookAt(0, 0, 0);

  function resize() {
    const w = Math.max(1, Math.floor(canvas.clientWidth));
    const h = Math.max(1, Math.floor(canvas.clientHeight));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    console.log("[head3d] resize", { w, h });
  }

  window.addEventListener("resize", resize);
  resize();

  scene.add(new THREE.AmbientLight(0xffffff, 1.0));

  // ✅ Debug cube (si tu le vois: WebGL OK)
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.9, 0.9),
    new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    })
  );
  scene.add(cube);

  const geom = new THREE.SphereGeometry(1.15, 80, 80);
  const pointsMat = new THREE.PointsMaterial({
    color: 0x00d9ff,
    size: 0.03,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });

  const points = new THREE.Points(geom, pointsMat);
  scene.add(points);

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geom, 15),
    new THREE.LineBasicMaterial({ color: 0x00aee0, transparent: true, opacity: 0.18 })
  );
  scene.add(edges);

  let thinking = false;
  let pulse = 0;

  window.__head3d_setThinking = (v) => {
    thinking = v;
    edges.material.opacity = v ? 0.35 : 0.18;
    pointsMat.opacity = v ? 1.0 : 0.9;
  };

  window.__head3d_pulse = () => {
    pulse = 1;
  };

  window.__head3d_error = () => {
    const old = pointsMat.color.getHex();
    pointsMat.color.setHex(0xff3b3b);
    edges.material.color.setHex(0xff3b3b);
    setTimeout(() => {
      pointsMat.color.setHex(old);
      edges.material.color.setHex(0x00aee0);
    }, 450);
  };

  function loop() {
    const speed = thinking ? 0.01 : 0.004;

    cube.rotation.y += 0.003;
    cube.rotation.x += 0.002;

    points.rotation.y += speed;
    edges.rotation.y += speed;

    if (pulse > 0) {
      pulse -= 0.02;
      const s = 1 + Math.sin((1 - pulse) * Math.PI) * 0.08;
      points.scale.setScalar(s);
      edges.scale.setScalar(1 + (s - 1) * 0.7);
      pointsMat.size = 0.03 * (1 + (1 - pulse) * 0.5);
    } else {
      points.scale.setScalar(1);
      edges.scale.setScalar(1);
      pointsMat.size = 0.03;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }

  loop();
}
