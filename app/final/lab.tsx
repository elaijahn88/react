// App.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Button, Dimensions, PanResponder } from "react-native";
import { GLView } from "expo-gl";
import * as THREE from "three";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from "react-native-reanimated";
import Slider from "@react-native-community/slider";

const { width, height } = Dimensions.get("window");

/* ---------------------- Chemistry3D ---------------------- */
function Chemistry3D({ vibrationAmplitude, bondStiffness }: { vibrationAmplitude: number; bondStiffness: number }) {
  const glRef = useRef<any>(null);
  const requestIdRef = useRef<number | null>(null);
  const atomsRef = useRef<THREE.Mesh[]>([]);
  const bondsRef = useRef<THREE.Mesh[]>([]);
  const velocitiesRef = useRef<THREE.Vector3[]>([]);
  const clock = useRef(new THREE.Clock());
  const cameraSpherical = useRef({ theta: 0, phi: Math.PI / 4, radius: 3 });

  const lastPan = useRef({ x: 0, y: 0 });
  const lastPinchDistance = useRef<number | null>(null);

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, g) => {
          lastPan.current = { x: g.x0, y: g.y0 };
          lastPinchDistance.current = null;
        },
        onPanResponderMove: (_, g) => {
          if (g.numberActiveTouches === 1) {
            const dx = g.moveX - lastPan.current.x;
            const dy = g.moveY - lastPan.current.y;
            lastPan.current = { x: g.moveX, y: g.moveY };

            cameraSpherical.current.theta -= dx * 0.005;
            cameraSpherical.current.phi -= dy * 0.005;
            cameraSpherical.current.phi = Math.min(Math.max(0.1, cameraSpherical.current.phi), Math.PI - 0.1);
          } else if (g.numberActiveTouches === 2) {
            const touches = (g as any)?.touches ?? [];
            if (touches.length >= 2) {
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
      }),
    []
  );

  const createBond = (pos1: THREE.Vector3, pos2: THREE.Vector3, scene: THREE.Scene) => {
    const dist = pos1.distanceTo(pos2);
    const geometry = new THREE.CylinderGeometry(0.05, 0.05, dist, 8);
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const bond = new THREE.Mesh(geometry, material);
    bond.position.copy(pos1).lerp(pos2, 0.5);
    bond.lookAt(pos2);
    bond.rotateX(Math.PI / 2);
    scene.add(bond);
    return bond;
  };

  useEffect(() => {
    let mounted = true;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let renderer: THREE.WebGLRenderer | null = null;

    const bondIndices = [
      [0, 1],
      [1, 2],
      [2, 0],
    ];

    const initThree = async (gl: any) => {
      if (!gl) return;

      renderer = new THREE.WebGLRenderer({ context: gl, antialias: true }); // SAFE
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight, false);
      renderer.setClearColor(0x111111);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 100);

      scene.add(new THREE.AmbientLight(0x404040));
      const dir = new THREE.DirectionalLight(0xffffff, 0.8);
      dir.position.set(3, 5, 2);
      scene.add(dir);

      // Atoms
      const positions = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.8, 0, 0), new THREE.Vector3(0.4, 0.7, 0)];
      const colors = [0xff0000, 0x00ff00, 0x0000ff];

      const atoms = positions.map((pos, i) => {
        const geo = new THREE.SphereGeometry(0.2, 16, 16);
        const mat = new THREE.MeshPhongMaterial({ color: colors[i] });
        const sph = new THREE.Mesh(geo, mat);
        sph.position.copy(pos);
        scene!.add(sph);
        return sph;
      });
      atomsRef.current = atoms;

      const velocities = atoms.map(() => new THREE.Vector3(0, 0, 0));
      velocitiesRef.current = velocities;
      clock.current = new THREE.Clock();

      const bonds = bondIndices.map(([i, j]) => createBond(atoms[i].position, atoms[j].position, scene!));
      bondsRef.current = bonds;

      const animate = () => {
        if (!mounted || !scene || !camera || !renderer || !gl) return;

        const elapsed = clock.current.getElapsedTime();

        // spring physics
        bondIndices.forEach(([i, j]) => {
          const a = atoms[i];
          const b = atoms[j];
          const ideal = 0.9;
          const delta = new THREE.Vector3().subVectors(b.position, a.position);
          const dist = delta.length();
          const diff = dist - ideal;
          const force = delta.normalize().multiplyScalar(diff * bondStiffness);
          velocitiesRef.current[i].add(force);
          velocitiesRef.current[j].sub(force);
        });

        atoms.forEach((atom, i) => {
          const vib = Math.sin(elapsed * 5 + i) * vibrationAmplitude * 0.1;
          velocitiesRef.current[i].z += vib;
          atom.position.add(velocitiesRef.current[i]);
          velocitiesRef.current[i].multiplyScalar(0.9);
        });

        // update bonds
        for (let k = 0; k < bonds.length; k++) {
          const [aIdx, bIdx] = bondIndices[k];
          const pos1 = atoms[aIdx].position;
          const pos2 = atoms[bIdx].position;
          const bond = bonds[k];
          const dist = pos1.distanceTo(pos2);
          bond.scale.set(1, dist, 1);
          bond.position.copy(pos1).lerp(pos2, 0.5);
          bond.lookAt(pos2);
          bond.rotateX(Math.PI / 2);
        }

        const { theta, phi, radius } = cameraSpherical.current;
        camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
        camera.position.y = radius * Math.cos(phi);
        camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
        gl.endFrameEXP();
        requestIdRef.current = requestAnimationFrame(animate);
      };
      animate();
    };

    if (glRef.current) initThree(glRef.current);

    return () => {
      mounted = false;
      if (requestIdRef.current != null) cancelAnimationFrame(requestIdRef.current);
      atomsRef.current.forEach((m) => { try { m.geometry?.dispose(); (m.material as any)?.dispose?.(); } catch {} });
      bondsRef.current.forEach((b) => { try { b.geometry?.dispose(); (b.material as any)?.dispose?.(); } catch {} });
      atomsRef.current = [];
      bondsRef.current = [];
      velocitiesRef.current = [];
    };
  }, [vibrationAmplitude, bondStiffness]);

  return <View {...panResponder.panHandlers} style={{ flex: 1 }}><GLView style={{ flex: 1 }} onContextCreate={(gl) => { glRef.current = gl; }} /></View>;
}

/* ---------------------- PhysicsSimulation ---------------------- */
function PhysicsSimulation({ gravityStrength }: { gravityStrength: number }) {
  const glRef = useRef<any>(null);
  const requestIdRef = useRef<number | null>(null);
  const particlesRef = useRef<THREE.Mesh[]>([]);
  const velocitiesRef = useRef<THREE.Vector3[]>([]);
  const clock = useRef(new THREE.Clock());

  useEffect(() => {
    let mounted = true;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let renderer: THREE.WebGLRenderer | null = null;

    const initThree = async (gl: any) => {
      if (!gl) return;

      renderer = new THREE.WebGLRenderer({ context: gl, antialias: true });
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight, false);
      renderer.setClearColor(0x000000);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 100);
      camera.position.z = 10;
      scene.add(new THREE.AmbientLight(0x404040));

      const particleCount = 50;
      const particles: THREE.Mesh[] = [];
      const velocities: THREE.Vector3[] = [];
      for (let i = 0; i < particleCount; i++) {
        const geo = new THREE.SphereGeometry(0.1, 8, 8);
        const mat = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
        particles.push(mesh);
        velocities.push(new THREE.Vector3((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1));
        scene.add(mesh);
      }
      particlesRef.current = particles;
      velocitiesRef.current = velocities;
      clock.current = new THREE.Clock();

      const animate = () => {
        if (!mounted || !scene || !camera || !renderer || !gl) return;
        const dt = clock.current.getDelta();
        particlesRef.current.forEach((p, i) => {
          const v = velocitiesRef.current[i];
          v.y -= gravityStrength * dt;
          p.position.addScaledVector(v, dt);
          if (p.position.y < -4) { p.position.y = -4; v.y *= -0.7; }
        });

        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
        gl.endFrameEXP();
        requestIdRef.current = requestAnimationFrame(animate);
      };
      animate();
    };

    if (glRef.current) initThree(glRef.current);

    return () => {
      mounted = false;
      if (requestIdRef.current != null) cancelAnimationFrame(requestIdRef.current);
      particlesRef.current.forEach((m) => { try { m.geometry?.dispose(); (m.material as any)?.dispose?.(); } catch {} });
      particlesRef.current = [];
      velocitiesRef.current = [];
    };
  }, [gravityStrength]);

  return <GLView style={{ flex: 1 }} onContextCreate={(gl) => { glRef.current = gl; }} />;
}

/* ---------------------- BiologyDNA ---------------------- */
const NUM_PAIRS = 40;
const radius = 2;
const pitch = 0.3;
const turns = 5;

function DNAPair({ i, phase }: { i: number; phase: Animated.SharedValue<number> }) {
  const angle = (i / NUM_PAIRS) * turns * 2 * Math.PI;
  const leftX = radius * Math.cos(angle);
  const leftY = pitch * i;
  const rightX = -leftX;
  const rightY = leftY;

  const leftStyle = useAnimatedStyle(() => {
    const offsetZ = Math.sin(phase.value + i * 0.3) * 0.3;
    return {
      position: "absolute",
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: "#4caf50",
      left: 150 + leftX * 30,
      top: 400 - leftY * 20,
      opacity: 0.95,
      transform: [{ translateZ: offsetZ * 30 }],
    } as any;
  });

  const rightStyle = useAnimatedStyle(() => {
    const offsetZ = Math.sin(phase.value + i * 0.3 + Math.PI) * 0.3;
    return {
      position: "absolute",
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: "#e91e63",
      left: 150 + rightX * 30,
      top: 400 - rightY * 20,
      opacity: 0.95,
      transform: [{ translateZ: offsetZ * 30 }],
    } as any;
  });

  return (
    <>
      <Animated.View style={leftStyle} />
      <Animated.View style={rightStyle} />
    </>
  );
}

function BiologyDNA() {
  const phase = useSharedValue(0);
  useEffect(() => {
    phase.value = withRepeat(withTiming(2 * Math.PI, { duration: 4000 }), -1, false);
    return () => { phase.value = 0; }; // cleanup
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {Array.from({ length: NUM_PAIRS }).map((_, i) => <DNAPair key={i} i={i} phase={phase} />)}
    </View>
  );
}

/* ---------------------- Main App ---------------------- */
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
              <Slider minimumValue={0} maximumValue={1} value={vibrationAmplitude} onValueChange={setVibrationAmplitude} />
              <Text style={{ color: "#fff" }}>Bond Stiffness: {bondStiffness.toFixed(1)}</Text>
              <Slider minimumValue={1} maximumValue={20} value={bondStiffness} onValueChange={setBondStiffness} />
            </View>
          </>
        )}

        {tab === "physics" && (
          <>
            <PhysicsSimulation gravityStrength={gravityStrength} />
            <View style={{ padding: 10, backgroundColor: "#333" }}>
              <Text style={{ color: "#fff" }}>Gravity Strength: {gravityStrength.toFixed(1)}</Text>
              <Slider minimumValue={0} maximumValue={20} value={gravityStrength} onValueChange={setGravityStrength} />
            </View>
          </>
        )}

        {tab === "biology" && <BiologyDNA />}
      </View>
    </View>
  );
}
