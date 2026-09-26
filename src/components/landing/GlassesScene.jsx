import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// ---- Frame finishes ----
const FRAME_COLORS = [
  {
    name: "Gunmetal",
    rim: 0x3a3d40,
    arm: 0x2a2c2e,
  },
  {
    name: "Matte Black",
    rim: 0x1c1c1e,
    arm: 0x121213,
  },
  {
    name: "Brushed Gold",
    rim: 0x9c8354,
    arm: 0x6f5c3c,
  },
  {
    name: "Tortoise",
    rim: 0x5a4028,
    arm: 0x362413,
  },
];

export default function GlassesScene() {
  const mountRef = useRef(null);

  const [colorIndex, setColorIndex] = useState(0);
  const colorIndexRef = useRef(colorIndex);

  colorIndexRef.current = colorIndex;

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) return;

    const width = mount.clientWidth || 1;
    const height = mount.clientHeight || 1;

    // ------------------------------------------------------------
    // Scene
    // ------------------------------------------------------------

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      36,
      width / height,
      0.1,
      100
    );

    camera.position.set(0, 0.1, 7);
    camera.lookAt(0, 0, 0);

    // ------------------------------------------------------------
    // Renderer
    // ------------------------------------------------------------

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setSize(width, height);

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.cursor = "grab";

    mount.appendChild(renderer.domElement);

    // ------------------------------------------------------------
    // Environment
    // ------------------------------------------------------------

    const pmrem = new THREE.PMREMGenerator(renderer);

    const envTex = pmrem.fromScene(
      new RoomEnvironment(),
      0.06
    ).texture;

    scene.environment = envTex;
    scene.environmentIntensity = 0.75;

    // ------------------------------------------------------------
    // Lighting
    // ------------------------------------------------------------

    const ambient = new THREE.AmbientLight(
      0xffffff,
      0.55
    );

    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(
      0xfff6ec,
      1.5
    );

    keyLight.position.set(4, 5.5, 6);

    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(
      0xe8eef5,
      0.6
    );

    fillLight.position.set(-5, 1.5, 3);

    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(
      0xffffff,
      0.5
    );

    rimLight.position.set(-2, -3, -5);

    scene.add(rimLight);

    // ------------------------------------------------------------
    // Load GLTF glasses model
    // ------------------------------------------------------------

    const loader = new GLTFLoader();

    let glasses = null;

    let frameMaterials = [];
    let templeMaterials = [];

    let originalMaterials = [];

    loader.load(
      "/models/glasses/scene.gltf",

      (gltf) => {
        glasses = gltf.scene;

        // --------------------------------------------------------
        // Normalize model size
        // --------------------------------------------------------

        const box = new THREE.Box3().setFromObject(glasses);

        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const maxDimension = Math.max(
          size.x,
          size.y,
          size.z
        );

        const targetSize = 4.0;

        if (maxDimension > 0) {
          const scale =
            targetSize / maxDimension;

          glasses.scale.setScalar(scale);
        }

        // Recalculate bounds after scaling
        const scaledBox = new THREE.Box3().setFromObject(
          glasses
        );

        const scaledCenter =
          scaledBox.getCenter(new THREE.Vector3());

        glasses.position.sub(scaledCenter);

        // --------------------------------------------------------
        // Rotate model to match the previous presentation
        // --------------------------------------------------------

        glasses.rotation.order = "YXZ";

        glasses.rotation.x = 0.1;
        glasses.rotation.y = -0.32;

        // --------------------------------------------------------
        // Find materials from the GLTF model
        // --------------------------------------------------------

        glasses.traverse((object) => {
          if (!object.isMesh) return;

          object.castShadow = true;
          object.receiveShadow = true;

          const material = object.material;

          if (!material) return;

          // Save original material so we can restore properties
          originalMaterials.push({
            object,
            material,
          });

          // The supplied model uses material names:
          //
          // Frame
          // Lens
          // Nosepads
          // Temple
          // Temple_tips

          const materialName =
            material.name?.toLowerCase() || "";

          if (
            materialName.includes("frame")
          ) {
            frameMaterials.push(material);
          }

          if (
            materialName.includes("temple")
          ) {
            templeMaterials.push(material);
          }
        });

        // --------------------------------------------------------
        // Apply initial finish
        // --------------------------------------------------------

        applyFrameColor(
          FRAME_COLORS[0],
          frameMaterials,
          templeMaterials
        );

        scene.add(glasses);
      },

      undefined,

      (error) => {
        console.error(
          "Failed to load glasses model:",
          error
        );
      }
    );

    // ------------------------------------------------------------
    // Shadow
    // ------------------------------------------------------------

    const shadowGeo = new THREE.CircleGeometry(
      2.2,
      48
    );

    const shadowMat =
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.14,
      });

    const shadowMesh = new THREE.Mesh(
      shadowGeo,
      shadowMat
    );

    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.35;

    scene.add(shadowMesh);

    // ------------------------------------------------------------
    // Interaction
    // ------------------------------------------------------------

    let dragging = false;
    let idleTimer = 0;

    const prev = {
      x: 0,
      y: 0,
    };

    const velocity = {
      x: 0,
      y: 0,
    };

    const userRotation = {
      x: 0,
      y: 0,
    };

    const onPointerDown = (e) => {
      dragging = true;
      idleTimer = 0;

      prev.x = e.clientX;
      prev.y = e.clientY;

      renderer.domElement.style.cursor =
        "grabbing";
    };

    const onPointerMove = (e) => {
      if (!dragging) return;

      const dx =
        e.clientX - prev.x;

      const dy =
        e.clientY - prev.y;

      prev.x = e.clientX;
      prev.y = e.clientY;

      velocity.x = dx * 0.005;
      velocity.y = dy * 0.005;

      userRotation.y += velocity.x;

      userRotation.x =
        THREE.MathUtils.clamp(
          userRotation.x + velocity.y,
          -0.55,
          0.55
        );
    };

    const stopDrag = () => {
      dragging = false;

      renderer.domElement.style.cursor =
        "grab";
    };

    const onWheel = (e) => {
      e.preventDefault();

      idleTimer = 0;

      camera.position.z =
        THREE.MathUtils.clamp(
          camera.position.z +
            e.deltaY * 0.0025,
          4.8,
          9.5
        );
    };

    const el = renderer.domElement;

    el.addEventListener(
      "pointerdown",
      onPointerDown
    );

    window.addEventListener(
      "pointermove",
      onPointerMove
    );

    window.addEventListener(
      "pointerup",
      stopDrag
    );

    el.addEventListener(
      "wheel",
      onWheel,
      {
        passive: false,
      }
    );

    // ------------------------------------------------------------
    // Resize
    // ------------------------------------------------------------

    const onResize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;

      camera.aspect = w / h;

      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
    };

    window.addEventListener(
      "resize",
      onResize
    );

    // ------------------------------------------------------------
    // Color transition
    // ------------------------------------------------------------

    const currentRim = new THREE.Color(
      FRAME_COLORS[0].rim
    );

    const currentArm = new THREE.Color(
      FRAME_COLORS[0].arm
    );

    const targetRim = new THREE.Color(
      FRAME_COLORS[0].rim
    );

    const targetArm = new THREE.Color(
      FRAME_COLORS[0].arm
    );

    let lastColorIndex = 0;

    // ------------------------------------------------------------
    // Animation
    // ------------------------------------------------------------

    const clock = new THREE.Clock();

    let rafId = 0;

    const animate = () => {
      rafId = requestAnimationFrame(
        animate
      );

      const dt = Math.min(
        clock.getDelta(),
        0.05
      );

      const t = clock.getElapsedTime();

      // ----------------------------------------------------------
      // Inertia
      // ----------------------------------------------------------

      if (!dragging) {
        velocity.x *= 0.94;
        velocity.y *= 0.94;

        userRotation.y += velocity.x;

        userRotation.x =
          THREE.MathUtils.clamp(
            userRotation.x +
              velocity.y,
            -0.55,
            0.55
          );

        idleTimer += dt;
      }

      // ----------------------------------------------------------
      // Idle rotation
      // ----------------------------------------------------------

      const idleSpin =
        idleTimer > 1.4
          ? (idleTimer - 1.4) * 0.08
          : 0;

      if (glasses) {
        glasses.rotation.y =
          -0.32 +
          userRotation.y +
          Math.min(idleSpin, 6.28);

        glasses.rotation.x =
          0.1 +
          userRotation.x * 0.5 +
          Math.sin(t * 0.5) * 0.015;

        glasses.position.y =
          Math.sin(t * 0.8) * 0.05;
      }

      // ----------------------------------------------------------
      // Color switching
      // ----------------------------------------------------------

      if (
        colorIndexRef.current !==
        lastColorIndex
      ) {
        lastColorIndex =
          colorIndexRef.current;

        targetRim.set(
          FRAME_COLORS[
            lastColorIndex
          ].rim
        );

        targetArm.set(
          FRAME_COLORS[
            lastColorIndex
          ].arm
        );
      }

      currentRim.lerp(
        targetRim,
        0.08
      );

      currentArm.lerp(
        targetArm,
        0.08
      );

      // Apply colors to model materials
      frameMaterials.forEach(
        (material) => {
          material.color.copy(
            currentRim
          );
        }
      );

      templeMaterials.forEach(
        (material) => {
          material.color.copy(
            currentArm
          );
        }
      );

      renderer.render(
        scene,
        camera
      );
    };

    animate();

    // ------------------------------------------------------------
    // Cleanup
    // ------------------------------------------------------------

    return () => {
      cancelAnimationFrame(rafId);

      el.removeEventListener(
        "pointerdown",
        onPointerDown
      );

      window.removeEventListener(
        "pointermove",
        onPointerMove
      );

      window.removeEventListener(
        "pointerup",
        stopDrag
      );

      el.removeEventListener(
        "wheel",
        onWheel
      );

      window.removeEventListener(
        "resize",
        onResize
      );

      scene.traverse((object) => {
        if (!object.isMesh) return;

        object.geometry?.dispose();

        if (
          Array.isArray(object.material)
        ) {
          object.material.forEach(
            (material) =>
              material.dispose()
          );
        } else {
          object.material?.dispose();
        }
      });

      shadowGeo.dispose();
      shadowMat.dispose();

      envTex.dispose();
      pmrem.dispose();

      renderer.dispose();

      if (
        mount.contains(
          renderer.domElement
        )
      ) {
        mount.removeChild(
          renderer.domElement
        );
      }
    };
  }, []);

  // --------------------------------------------------------------
  // Change finish
  // --------------------------------------------------------------

  const handleSwatch = useCallback(
    (index) => {
      setColorIndex(index);
    },
    []
  );

  // --------------------------------------------------------------
  // UI
  // --------------------------------------------------------------

  return (
    <div className="w-full h-full absolute inset-0">
      <div
        ref={mountRef}
        className="w-full h-full absolute inset-0"
        aria-hidden="true"
      />

      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-white/15 bg-black/30 backdrop-blur-md px-5 py-3 pointer-events-auto select-none">
        {FRAME_COLORS.map((c, i) => (
          <button
            key={c.name}
            type="button"
            aria-label={`View ${c.name} finish`}
            title={c.name}
            onClick={() =>
              handleSwatch(i)
            }
            className="h-6 w-6 rounded-full transition-transform duration-200"
            style={{
              backgroundColor: `#${c.rim
                .toString(16)
                .padStart(6, "0")}`,

              transform:
                colorIndex === i
                  ? "scale(1.25)"
                  : "scale(1)",

              boxShadow:
                colorIndex === i
                  ? "0 0 0 2px rgba(255,255,255,0.85)"
                  : "0 0 0 1px rgba(255,255,255,0.25)",
            }}
          />
        ))}
      </div>

      <p className="absolute top-6 left-1/2 -translate-x-1/2 text-[11px] tracking-wide text-white/50 pointer-events-none">
        Drag to rotate · scroll to zoom
      </p>
    </div>
  );
}

// --------------------------------------------------------------
// Apply selected frame color
// --------------------------------------------------------------

function applyFrameColor(
  color,
  frameMaterials,
  templeMaterials
) {
  const rimColor = new THREE.Color(
    color.rim
  );

  const armColor = new THREE.Color(
    color.arm
  );

  frameMaterials.forEach(
    (material) => {
      material.color.copy(rimColor);

      material.metalness = 0.65;
      material.roughness = 0.38;
    }
  );

  templeMaterials.forEach(
    (material) => {
      material.color.copy(armColor);

      material.metalness = 0.7;
      material.roughness = 0.4;
    }
  );
}