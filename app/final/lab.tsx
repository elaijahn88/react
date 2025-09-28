
// App.tsx
import React, { useRef, useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, Dimensions, PanResponder, Animated } from "react-native";
import { Slider } from "@react-native-community/slider";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const { width, height } = Dimensions.get("window");

// --- Chemistry 3D Molecule with expo-three ---
function Chemistry3D({ bondStiffness, vibrationAmplitude }: { bondStiffness: number; vibrationAmplitude: number }) {
  const glRef = useRef<any>(null);
  const controlsRef = useRef<OrbitControls>();
  const requestIdRef = useRef<number>();

  useEffect(() => {
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: Renderer;
    let controls: OrbitControls;

    let atoms: THREE.Mesh[] = [];
    let bonds: THREE.Mesh[] = [];
    let clock = new THREE.Clock();

    function createAtom(position: THREE.Vector3, color: number) {
      const geometry = new THREE.SphereGeometry(0.2, 16, 16);
      const material = new THREE.MeshPhongMaterial({ color });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.copy(position);
      scene.add(sphere);
      return sphere;
    }

    function createBond(pos1: THREE.Vector3, pos2: THREE.Vector3) {
      const dist = pos1.distanceTo(pos2);
      const geometry = new THREE.CylinderGeometry(0.05, 0.05, dist, 8);
      const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
      const bond = new THREE.Mesh(geometry, material);

      // Position between atoms
      bond.position.copy(pos1).lerp(pos2, 0.5);
      // Align bond orientation
      bond.lookAt(pos2);
      bond.rotateX(Math.PI / 2);

      scene.add(bond);
      return bond;
    }

    async function onContextCreate(gl: any) {
      renderer = new Renderer({ gl });
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x111111);

      camera = new THREE.PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 100);
      camera.position.set(1, 1, 3);

      // Lights
      const ambient = new THREE.AmbientLight(0x404040);
      scene.add(ambient);
      const directional = new THREE.DirectionalLight(0xffffff, 0.8);
      directional.position.set(3, 5, 2);
      scene.add(directional);

      // Atoms initial positions (triangle)
      const positions = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.8, 0, 0),
        new THREE.Vector3(0.4, 0.7, 0),
      ];
      const colors = [0xff0000, 0x00ff00, 0x0000ff];
      atoms = positions.map((pos, i) => createAtom(pos, colors[i]));

      // Bonds between atoms 0-1, 1-2, 2-0
      bonds = [
        createBond(positions[0], positions[1]),
        createBond(positions[1], positions[2]),
        createBond(positions[2], positions[0]),
      ];

      // Orbit Controls (needs to be recreated)
      controls = new OrbitControls(camera, glRef.current);
      controls.enableDamping = true;
      controlsRef.current = controls;

      const animate = () => {
        const elapsed = clock.getElapsedTime();

        // Animate atoms: vibration on bonds
        atoms.forEach((atom, i) => {
          // Simple vibration using sine wave
          atom.position.z = Math.sin(elapsed * 5 + i) * vibrationAmplitude;
        });

        // Update bonds positions and orientations dynamically
        for (let i = 0; i < bonds.length; i++) {
          const [aIdx, bIdx] = [
            i,
            (i + 1) % atoms.length,
          ];
          const pos1 = atoms[aIdx].position;
          const pos2 = atoms[bIdx].position;

          const bond = bonds[i];
          const dist = pos1.distanceTo(pos2);

          bond.scale.set(1, dist, 1);
          bond.position.copy(pos1).lerp(pos2, 0.5);

          bond.lookAt(pos2);
          bond.rotateX(Math.PI / 2);
        }

        controls.update();
        renderer.render(scene, camera);
        gl.endFrameEXP();

        requestIdRef.current = requestAnimationFrame(animate);
      };
      animate();
    }

    return () => {
      if (requestIdRef.current) cancelAnimationFrame(requestIdRef.current);
      controls?.dispose();
    };
  }, [bondStiffness, vibrationAmplitude]);

  return (
    <GLView
      style={{ flex: 1 }}
      onContextCreate={async (gl) => {
        glRef.current = gl;
        // The onContextCreate logic is inside useEffect, here just save ref
      }}
    />
  );
}

// --- Physics particle simulation with Animated Views ---
function Physics({ gravity }: { gravity: number }) {
  const [particles, setParticles] = useState(() =>
    new Array(30).fill(null).map(() => ({
      id: Math.random().toString(36).slice(2),
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      radius: 15,
    }))
  );

  const animatedPositions = useRef(
    particles.map(() => new Animated.ValueXY({ x: 0, y: 0 }))
  ).current;

  useEffect(() => {
    let animationFrame: number;
    let lastTime = Date.now();

    const update = () => {
      const now = Date.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      setParticles((oldParticles) => {
        const newParticles = oldParticles.map((p) => {
          let x = p.x + p.vx;
          let y = p.y + p.vy + gravity;

          let vx = p.vx;
          let vy = p.vy + gravity;

          // Bounce on walls
          if (x + p.radius > width) {
            x = width - p.radius;
            vx = -vx * 0.8;
          } else if (x - p.radius < 0) {
            x = p.radius;
            vx = -vx * 0.8;
          }
          if (y + p.radius > height) {
            y = height - p.radius;
            vy = -vy * 0.7;
          } else if (y - p.radius < 0) {
            y = p.radius;
            vy = -vy * 0.7;
          }

          return { ...p, x, y, vx, vy };
        });

        return newParticles;
      });

      animationFrame = requestAnimationFrame(update);
    };

    update();

    return () => cancelAnimationFrame(animationFrame);
  }, [gravity]);

  // Update animated positions
  useEffect(() => {
    particles.forEach((p, i) => {
      animatedPositions[i].setValue({ x: p.x - p.radius, y: p.y - p.radius });
    });
  }, [particles]);

  return (
    <View style={{ flex: 1, backgroundColor: "#111" }}>
      {particles.map((p, i) => (
        <Animated.View
          key={p.id}
          style={[
            styles.particle,
            {
              width: p.radius * 2,
              height: p.radius * 2,
              borderRadius: p.radius,
              backgroundColor: `hsl(${(p.x / width) * 360}, 70%, 60%)`,
              transform: animatedPositions[i].getTranslateTransform(),
            },
          ]}
        />
      ))}
    </View>
  );
}

// --- Biology DNA strand animation ---
function Biology({ animationSpeed }: { animationSpeed: number }) {
  const animatedValues = useRef(new Array(20).fill(null).map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = animatedValues.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 1000 / animationSpeed,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 1000 / animationSpeed,
            useNativeDriver: true,
          }),
        ])
      )
    );
    Animated.stagger(50, animations).start();
  }, [animationSpeed]);

  return (
    <View style={[styles.dnaContainer]}>
      {animatedValues.map((anim, i) => {
        const translateY = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 10],
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.dnaPair,
              {
                left: (i / 20) * width,
                backgroundColor: i % 2 === 0 ? "#6f9" : "#4a6",
                transform: [{ translateY }],
              },
            ]}
          />
        );
      })}
      <Text style={styles.dnaLabel}>DNA Strand Animation</Text>
    </View>
  );
}

// --- Main App with tabs and controls ---
export default function App() {
  const [tab, setTab] = useState<"chemistry" | "physics" | "biology">("chemistry");
  const [gravity, setGravity] = useState(0.2);
  const [bondStiffness, setBondStiffness] = useState(0.1);
  const [vibrationAmplitude, setVibrationAmplitude] = useState(0.05);
  const [animationSpeed, setAnimationSpeed] = useState(1);

  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <View style={styles.tabBar}>
        {["chemistry", "physics", "biology"].map((t) => (
          <Button
            key={t}
            title={t.charAt(0).toUpperCase() + t.slice(1)}
            onPress={() => setTab(t as any)}
            color={tab === t ? "#4caf50" : "#888"}
          />
        ))}
      </View>
      <View style={{ flex: 1 }}>
        {tab === "chemistry" && (
          <>
            <Chemistry3D bondStiffness={bondStiffness} vibrationAmplitude={vibrationAmplitude} />
            <View style={styles.controls}>
              <Text style={styles.label}>Bond stiffness</Text>
              <Slider
                style={{ flex: 1 }}
                minimumValue={0}
                maximumValue={0.5}
                value={bondStiffness}
                onValueChange={setBondStiffness}
                minimumTrackTintColor="#4caf50"
                thumbTintColor="#4caf50"
              />
              <Text style={styles.label}>Vibration amplitude</Text>
              <Slider
                style={{ flex: 1 }}
                minimumValue={0}
                maximumValue={0.2}
                value={vibrationAmplitude}
                onValueChange={setVibrationAmplitude}
                minimumTrackTintColor="#4caf50"
                thumbTintColor="#4caf50"
              />
            </View>
          </>
        )}
        {tab === "physics" && (
          <>
            <Physics gravity={gravity} />
            <View style={styles.controls}>
              <Text style={styles.label}>Gravity</Text>
              <Slider
                style={{ flex: 1 }}
                minimumValue={0}
                maximumValue={1}
                value={gravity}
                onValueChange={setGravity}
                minimumTrackTintColor="#4caf50"
                thumbTintColor="#4caf50"
              />
            </View>
          </>
        )}
        {tab === "biology" && (
          <>
            <Biology animationSpeed={animationSpeed} />
            <View style={styles.controls}>
              <Text style={styles.label}>Animation speed</Text>
              <Slider
                style={{ flex: 1 }}
                minimumValue={0.1}
                maximumValue={3}
                value={animationSpeed}
                onValueChange={setAnimationSpeed}
                minimumTrackTintColor="#4caf50"
                thumbTintColor="#4caf50"
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#222",
    paddingVertical: 8,
  },
  controls: {
    padding: 12,
    backgroundColor: "#222",
  },
  label: {
    color: "#aaa",
    fontWeight: "600",
    marginBottom: 4,
  },
  particle: {
    position: "absolute",
  },
  dnaContainer: {
    flex: 1,
    backgroundColor: "#001100",
  },
  dnaPair: {
    position: "absolute",
    width: 10,
    height: 50,
    borderRadius: 5,
    opacity: 0.8,
  },
  dnaLabel: {
    position: "absolute",
    bottom: 8,
    left: 8,
    color: "#4caf50",
    fontWeight: "bold",
    fontFamily: "monospace",
    userSelect: "none",
    textShadowColor: "#0f0",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
