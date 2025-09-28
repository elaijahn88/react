import React, { useEffect, useRef, useState } from "react";
import { View, Text, Slider, PanResponder, Button, Dimensions, ScrollView } from "react-native";
import { GLView } from "expo-gl";
import * as THREE from "three";
import { PanGestureHandler, PinchGestureHandler, State } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

// ----------- Chemistry 3D with flexible bonds + pinch-zoom + orbit pan --------------

function Chemistry3D({
  vibrationAmplitude,
  bondStiffness,
}: {
  vibrationAmplitude: number;
  bondStiffness: number;
}) {
  const glRef = useRef<any>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const requestIdRef = useRef<number>();
  const atomsRef = useRef<THREE.Mesh[]>([]);
  const bondsRef = useRef<THREE.Mesh[]>([]);
  const atomVelocities = useRef<THREE.Vector3[]>([]);
  const clock = useRef(new THREE.Clock());

  // Spherical camera coords
  const cameraSpherical = useRef({ theta: 0, phi: Math.PI / 4, radius: 3 });

  // Gesture refs for pan and pinch
  const lastPan = useRef({ x: 0, y: 0 });
  const lastPinchDistance = useRef<number | null>(null);

  // PanResponder for orbit and pinch zoom
  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, gestureState) => {
          lastPan.current = { x: gestureState.x0, y: gestureState.y0 };
          lastPinchDistance.current = null;
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.numberActiveTouches === 1) {
            // Orbit rotate
            const dx = gestureState.moveX - lastPan.current.x;
            const dy = gestureState.moveY - lastPan.current.y;
            lastPan.current = { x: gestureState.moveX, y: gestureState.moveY };

            cameraSpherical.current.theta -= dx * 0.005;
            cameraSpherical.current.phi -= dy * 0.005;
            cameraSpherical.current.phi = Math.min(Math.max(0.1, cameraSpherical.current.phi), Math.PI - 0.1);
          } else if (gestureState.numberActiveTouches === 2) {
            // Pinch zoom
            const touches = (gestureState as any).touches as { pageX: number; pageY: number }[];
            if (touches && touches.length >= 2) {
              const dx = touches[0].pageX - touches[1].pageX;
              const dy = touches[0].pageY - touches[1].pageY;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (lastPinchDistance.current != null) {
                const delta = distance - lastPinchDistance.current;
                cameraSpherical.current.radius -= delta * 0.01;
                cameraSpherical.current.radius = Math.min(Math.max(1.5, cameraSpherical.current.radius), 10);
              }
              lastPinchDistance.current = distance;
            }
          }
        },
        onPanResponderRelease: () => {
          lastPinchDistance.current = null;
        },
        onPanResponderTerminationRequest: () => false,
      }),
    []
  );

  // Create bond cylinder mesh helper
  function createBond(pos1: THREE.Vector3, pos2: THREE.Vector3, scene: THREE.Scene) {
    const dist = pos1.distanceTo(pos2);
    const geometry = new THREE.CylinderGeometry(0.05, 0.05, dist, 8);
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const bond = new THREE.Mesh(geometry, material);

    bond.position.copy(pos1).lerp(pos2, 0.5);
    bond.lookAt(pos2);
    bond.rotateX(Math.PI / 2);

    scene.add(bond);
    return bond;
  }

  useEffect(() => {
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let atoms: THREE.Mesh[] = [];
    let bonds: THREE.Mesh[] = [];
    let velocities: THREE.Vector3[] = [];

    async function onContextCreate(gl: any) {
      renderer = new THREE.WebGLRenderer({ canvas: gl.canvas, context: gl, antialias: true });
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      renderer.setClearColor(0x111111);
      rendererRef.current = renderer;

      scene = new THREE.Scene();
      sceneRef.current = scene;

      camera = new THREE.PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 100);
      cameraRef.current = camera;

      const ambient = new THREE.AmbientLight(0x404040);
      scene.add(ambient);
      const directional = new THREE.DirectionalLight(0xffffff, 0.8);
      directional.position.set(3, 5, 2);
      scene.add(directional);

      // Initial atom positions in triangle
      const positions = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.8, 0, 0),
        new THREE.Vector3(0.4, 0.7, 0),
      ];
      const colors = [0xff0000, 0x00ff00, 0x0000ff];

      atoms = positions.map((pos, i) => {
        const geometry = new THREE.SphereGeometry(0.2, 16, 16);
        const material = new THREE.MeshPhongMaterial({ color: colors[i] });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.copy(pos);
        scene.add(sphere);
        return sphere;
      });

      velocities = atoms.map(() => new THREE.Vector3(0, 0, 0));
      atomVelocities.current = velocities;
      atomsRef.current = atoms;

      // Bonds indices
      const bondsIndices = [
        [0, 1],
        [1, 2],
        [2, 0],
      ];

      bonds = bondsIndices.map(([i, j]) => createBond(atoms[i].position, atoms[j].position, scene));
      bondsRef.current = bonds;

      clock.current = new THREE.Clock();

      function animate() {
        const elapsed = clock.current.getElapsedTime();

        // Spring physics
        bondsIndices.forEach(([i, j]) => {
          const a = atoms[i];
          const b = atoms[j];
          const idealDistance = 0.9;

          const delta = new THREE.Vector3().subVectors(b.position, a.position);
          const dist = delta.length();
          const diff = dist - idealDistance;
          const force = delta.normalize().multiplyScalar(diff * bondStiffness);

          velocities[i].add(force);
          velocities[j].sub(force);
        });

        // Update atoms with vibration + velocity + damping
        atoms.forEach((atom, i) => {
          const vibForce = Math.sin(elapsed * 5 + i) * vibrationAmplitude * 0.1;
          velocities[i].z += vibForce;

          atom.position.add(velocities[i]);
          velocities[i].multiplyScalar(0.9); // damping
        });

        // Update bonds geometry
        for (let i = 0; i < bonds.length; i++) {
          const [aIdx, bIdx] = bondsIndices[i];
          const pos1 = atoms[aIdx].position;
          const pos2 = atoms[bIdx].position;
          const bond = bonds[i];

          const dist = pos1.distanceTo(pos2);
          bond.scale.set(1, dist, 1);
          bond.position.copy(pos1).lerp(pos2, 0.5);
          bond.lookAt(pos2);
          bond.rotateX(Math.PI / 2);
        }

        // Update camera from spherical coords
        const { theta, phi, radius } = cameraSpherical.current;
        camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
        camera.position.y = radius * Math.cos(phi);
        camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
        gl.endFrameEXP();

        requestIdRef.current = requestAnimationFrame(animate);
      }
      animate();
    }

    if (glRef.current) {
      onContextCreate(glRef.current);
    }

    return () => {
      if (requestIdRef.current) cancelAnimationFrame(requestIdRef.current);
      atomsRef.current.forEach((atom) => {
        sceneRef.current?.remove(atom);
      });
      bondsRef.current.forEach((bond) => {
        sceneRef.current?.remove(bond);
      });
    };
  }, [vibrationAmplitude, bondStiffness]);

  return <View {...panResponder.panHandlers} style={{ flex: 1 }}><GLView style={{ flex: 1 }} onContextCreate={(gl) => { glRef.current = gl; }} /></View>;
}

// ----------- Physics particles with adjustable gravity --------------

function PhysicsSimulation({ gravityStrength }: { gravityStrength: number }) {
  const glRef = useRef<any>(null);
  const requestIdRef = useRef<number>();
  const particlesRef = useRef<THREE.Mesh[]>([]);
  const velocitiesRef = useRef<THREE.Vector3[]>([]);
  const clock = useRef(new THREE.Clock());
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();

  useEffect(() => {
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;

    async function onContextCreate(gl: any) {
      renderer = new THREE.WebGLRenderer({ canvas: gl.canvas, context: gl, antialias: true });
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      renderer.setClearColor(0x000000);
      rendererRef.current = renderer;

      scene = new THREE.Scene();
      sceneRef.current = scene;

      camera = new THREE.PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 100);
      camera.position.z = 10;
      cameraRef.current = camera;

      // Lights
      const ambient = new THREE.AmbientLight(0x404040);
      scene.add(ambient);

      // Particles
      const particleCount = 50;
      const particles: THREE.Mesh[] = [];
      const velocities: THREE.Vector3[] = [];

      for (let i = 0; i < particleCount; i++) {
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
        particles.push(mesh);
        velocities.push(new THREE.Vector3((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1));
        scene.add(mesh);
      }
      particlesRef.current = particles;
      velocitiesRef.current = velocities;

      clock.current = new THREE.Clock();

      function animate() {
        const dt = clock.current.getDelta();

        particles.forEach((particle, i) => {
          const vel = velocities[i];

          // Apply gravity (down on Y axis)
          vel.y -= gravityStrength * dt;

          // Update position
          particle.position.addScaledVector(vel, dt);

          // Simple floor collision
          if (particle.position.y < -4) {
            particle.position.y = -4;
            vel.y *= -0.7; // bounce with damping
          }
        });

        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
        gl.endFrameEXP();

        requestIdRef.current = requestAnimationFrame(animate);
      }
      animate();
    }

    if (glRef.current) onContextCreate(glRef.current);

    return () => {
      if (requestIdRef.current) cancelAnimationFrame(requestIdRef.current);
    };
  }, [gravityStrength]);

  return <GLView style={{ flex: 1 }} onContextCreate={(gl) => { glRef.current = gl; }} />;
}

// -------------- Biology DNA Animated (2.5D) -------------------

function BiologyDNA() {
  const NUM_PAIRS = 40;
  const radius = 2;
  const pitch = 0.3;
  const turns = 5;

  const phase = useSharedValue(0);

  useEffect(() => {
    phase.value = withRepeat(withTiming(2 * Math.PI, { duration: 4000 }), -1, false);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
      {[...Array(NUM_PAIRS)].map((_, i) => {
        const angle = (i / NUM_PAIRS) * turns * 2 * Math.PI;

        const leftX = radius * Math.cos(angle);
        const leftY = pitch * i;
        const leftZ = radius * Math.sin(angle);

        const rightX = -leftX;
        const rightY = leftY;
        const rightZ = -leftZ;

        const animatedStyleLeft = useAnimatedStyle(() => {
          const offsetZ = Math.sin(phase.value + i * 0.3) * 0.3;
          return {
            position: "absolute",
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: "#4caf50",
            left: 150 + leftX * 30,
            top: 400 - leftY * 20,
            opacity: 0.9,
            transform: [{ translateZ: offsetZ * 30 }],
          };
        });

        const animatedStyleRight = useAnimatedStyle(() => {
          const offsetZ = Math.sin(phase.value + i * 0.3 + Math.PI) * 0.3;
          return {
            position: "absolute",
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: "#e91e63",
            left: 150 + rightX * 30,
            top: 400 - rightY * 20,
            opacity: 0.9,
            transform: [{ translateZ: offsetZ * 30 }],
          };
        });

        return (
          <React.Fragment key={i}>
            <Animated.View style={animatedStyleLeft} />
            <Animated.View style={animatedStyleRight} />
          </React.Fragment>
        );
      })}
    </View>
  );
}

// ------------- Main merged app with UI controls -----------------

export default function App() {
  const [vibrationAmplitude, setVibrationAmplitude] = useState(0.2);
  const [bondStiffness, setBondStiffness] = useState(5);
  const [gravityStrength, setGravityStrength] = useState(9.8);
  const [tab, setTab] = useState<"chemistry" | "physics" | "biology">("chemistry");

  return (
    <View style={{ flex: 1, backgroundColor: "#222" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-around", paddingVertical: 8 }}>
        <Button title="Chemistry" onPress={() => setTab("chemistry")} />
        <Button title="Physics" onPress={() => setTab("physics")} />
        <Button title="Biology" onPress={() => setTab("biology")} />
      </View>

      <View style={{ flex: 1 }}>
        {tab === "chemistry" && (
          <>
            <Chemistry3D vibrationAmplitude={vibrationAmplitude} bondStiffness={bondStiffness} />
            <View style={{ padding: 10, backgroundColor: "#333" }}>
              <Text style={{ color: "#fff" }}>Vibration Amplitude: {vibrationAmplitude.toFixed(2)}</Text>
              <Slider
                minimumValue={0}
                maximumValue={1}
                value={vibrationAmplitude}
                onValueChange={setVibrationAmplitude}
              />
              <Text style={{ color: "#fff" }}>Bond Stiffness: {bondStiffness.toFixed(1)}</Text>
              <Slider
                minimumValue={1}
                maximumValue={20}
                value={bondStiffness}
                onValueChange={setBondStiffness}
              />
            </View>
          </>
        )}

        {tab === "physics" && (
          <>
            <PhysicsSimulation gravityStrength={gravityStrength} />
            <View style={{ padding: 10, backgroundColor: "#333" }}>
              <Text style={{ color: "#fff" }}>Gravity Strength: {gravityStrength.toFixed(1)}</Text>
              <Slider
                minimumValue={0}
                maximumValue={20}
                value={gravityStrength}
                onValueChange={setGravityStrength}
              />
            </View>
          </>
        )}

        {tab === "biology" && <BiologyDNA />}
      </View>
    </View>
  );
}
