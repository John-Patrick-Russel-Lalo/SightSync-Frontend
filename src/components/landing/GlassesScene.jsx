import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const FRAME_MAROON = 0x8b1e42;
const FRAME_DARK = 0x2b241f;
const GOLD = 0xc08a3e;

export default function GlassesScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 1;
    const height = mount.clientHeight || 1;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    // Env map for realistic metal / glass reflections
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    scene.environmentIntensity = 0.85;

    // Lights for drama
    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(4, 6, 6);
    scene.add(keyLight);

    const maroonLight = new THREE.PointLight(FRAME_MAROON, 1.6, 30);
    maroonLight.position.set(-4, 2, 3);
    scene.add(maroonLight);

    const goldLight = new THREE.PointLight(GOLD, 1.2, 30);
    goldLight.position.set(4, -2, 2);
    scene.add(goldLight);

    // ---------------- Build eyeglasses ----------------
    const glasses = new THREE.Group();

    const lensRadius = 1.08;
    const lensCenterX = 1.26;
    const rimTube = 0.1;

    const rimGeo = new THREE.TorusGeometry(lensRadius, rimTube, 24, 96);
    const rimMat = new THREE.MeshStandardMaterial({
      color: FRAME_MAROON,
      metalness: 0.9,
      roughness: 0.28,
      envMapIntensity: 1.2,
    });

    const lensMat = new THREE.MeshPhysicalMaterial({
      transmission: 1,
      roughness: 0.05,
      thickness: 0.6,
      ior: 1.5,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.1,
    });
    const lensGeo = new THREE.CircleGeometry(lensRadius - rimTube * 0.4, 64);

    const leftLens = new THREE.Mesh(lensGeo, lensMat);
    leftLens.position.set(-lensCenterX, 0, 0);
    const rightLens = leftLens.clone();
    rightLens.position.x = lensCenterX;

    const leftRim = new THREE.Mesh(rimGeo, rimMat);
    leftRim.position.set(-lensCenterX, 0, 0);
    const rightRim = leftRim.clone();
    rightRim.position.x = lensCenterX;

    // Bridge
    const bridgeMat = new THREE.MeshStandardMaterial({
      color: FRAME_DARK,
      metalness: 0.9,
      roughness: 0.3,
      envMapIntensity: 1.2,
    });
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.16, 0.16), bridgeMat);
    bridge.position.set(0, 0.55, 0.02);

    // Temple arms
    const armMat = new THREE.MeshStandardMaterial({
      color: FRAME_DARK,
      metalness: 0.9,
      roughness: 0.34,
      envMapIntensity: 1.2,
    });
    const armGeo = new THREE.BoxGeometry(0.14, 0.18, 1.7);

    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-(lensCenterX + rimTube + 0.06), 0.35, -0.85);
    leftArm.rotation.y = 0.22;

    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(lensCenterX + rimTube + 0.06, 0.35, -0.85);
    rightArm.rotation.y = -0.22;

    glasses.add(leftRim, rightRim, leftLens, rightLens, bridge, leftArm, rightArm);
    glasses.rotation.order = "YXZ";
    scene.add(glasses);

    // Decorative back ring
    const ringMat = new THREE.MeshStandardMaterial({
      color: GOLD,
      metalness: 0.85,
      roughness: 0.4,
      transparent: true,
      opacity: 0.35,
      wireframe: false,
      envMapIntensity: 1.2,
    });
    const backRing = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.02, 12, 96), ringMat);
    backRing.position.set(0, 0, -1.6);
    backRing.rotation.x = Math.PI / 2.2;
    scene.add(backRing);

    // Floating particles
    const particleCount = 160;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 3 + Math.random() * 2.4;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4.2;
      positions[i * 3 + 2] = Math.sin(angle) * radius - 1;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: GOLD,
      size: 0.05,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ---------------- Animation ----------------
    const clock = new THREE.Clock();
    let rafId = 0;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    const onPointerMove = (e) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointerMove);

    const onResize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      current.x += (target.x - current.x) * 0.04;
      current.y += (target.y - current.y) * 0.04;

      glasses.rotation.y = t * 0.3 + current.x * 0.35;
      glasses.rotation.x = 0.16 + Math.sin(t * 0.55) * 0.05 + current.y * 0.2;
      glasses.rotation.z = Math.sin(t * 0.4) * 0.03;
      glasses.position.y = Math.sin(t * 0.9) * 0.14;

      backRing.rotation.y = t * 0.12;
      backRing.rotation.x = Math.PI / 2.2 + Math.sin(t * 0.3) * 0.08;

      particles.rotation.y = t * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);

      scene.traverse((obj) => {
        if (obj.isMesh || obj.isPoints) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material?.dispose();
        }
      });
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full absolute inset-0" aria-hidden="true" />;
}