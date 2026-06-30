"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

// Satellite orbits component
function SatelliteOrbits({ count = 3 }) {
  const orbitsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (orbitsRef.current) {
      // Rotate each orbit group at slightly different speeds
      orbitsRef.current.children.forEach((child, index) => {
        child.rotation.y = state.clock.getElapsedTime() * (0.15 + index * 0.05);
        child.rotation.x = state.clock.getElapsedTime() * (0.05 + index * 0.02);
      });
    }
  });

  return (
    <group ref={orbitsRef}>
      {Array.from({ length: count }).map((_, i) => {
        // Dynamic tilt for each orbit
        const tiltX = (i * Math.PI) / 6 + 0.2;
        const tiltZ = (i * Math.PI) / 4;
        const radius = 2.4 + i * 0.2;

        return (
          <group key={i} rotation={[tiltX, 0, tiltZ]}>
            {/* Orbit path line */}
            <line>
              <bufferGeometry>
                <float32BufferAttribute
                  attach="attributes-position"
                  args={[
                    new Float32Array(
                      Array.from({ length: 64 }).flatMap((_, j) => {
                        const angle = (j / 64) * Math.PI * 2;
                        return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
                      })
                    ),
                    3,
                  ]}
                />
              </bufferGeometry>
              <lineBasicMaterial
                color={i === 0 ? "#06b6d4" : i === 1 ? "#f97316" : "#10b981"}
                transparent
                opacity={0.25}
                linewidth={1}
              />
            </line>

            {/* Orbiting Satellite Node */}
            <mesh position={[radius, 0, 0]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial
                color={i === 0 ? "#22d3ee" : i === 1 ? "#fb923c" : "#34d399"}
                toneMapped={false}
              />
            </mesh>

            {/* Glowing signal rings from satellite */}
            <mesh position={[radius, 0, 0]} scale={[2, 2, 2]}>
              <ringGeometry args={[0.01, 0.08, 16]} />
              <meshBasicMaterial
                color={i === 0 ? "#06b6d4" : i === 1 ? "#f97316" : "#10b981"}
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// Procedural Earth mesh with custom grid lines and hotspot points
function Earth({ mouseX = 0, mouseY = 0 }) {
  const earthRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  // Draw points representing cities and thermal spots
  const [hotspots] = useState(() => {
    const spots = [];
    const count = 45;
    for (let i = 0; i < count; i++) {
      // Golden ratio layout for even distribution on sphere
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      const r = 2.0;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      // Randomize heat intensity for visual diversity
      const intensity = Math.random();
      spots.push({ pos: new THREE.Vector3(x, y, z), intensity });
    }
    return spots;
  });

  useFrame((state) => {
    if (earthRef.current) {
      // Base rotation
      earthRef.current.rotation.y = state.clock.getElapsedTime() * 0.08;
      
      // Mouse Parallax Effect
      const targetRotationX = mouseY * 0.15;
      const targetRotationY = mouseX * 0.15 + state.clock.getElapsedTime() * 0.08;
      
      earthRef.current.rotation.x = THREE.MathUtils.lerp(
        earthRef.current.rotation.x,
        targetRotationX,
        0.05
      );
      earthRef.current.rotation.y = THREE.MathUtils.lerp(
        earthRef.current.rotation.y,
        targetRotationY,
        0.05
      );
    }
  });

  return (
    <group ref={earthRef}>
      {/* Dark core sphere to block backing grid lines */}
      <mesh>
        <sphereGeometry args={[1.98, 32, 32]} />
        <meshBasicMaterial color="#02050f" transparent opacity={0.9} />
      </mesh>

      {/* Earth Wireframe Outline */}
      <mesh>
        <sphereGeometry args={[2.0, 30, 30]} />
        <meshBasicMaterial
          color="#1e293b"
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Cyber Grid Lines (latitudes & longitudes) */}
      <mesh>
        <sphereGeometry args={[2.01, 16, 16]} />
        <meshBasicMaterial
          color="#06b6d4"
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Glowing City Nodes & Thermal Hotspots */}
      {hotspots.map((spot, index) => {
        const isHot = spot.intensity > 0.65;
        const color = isHot ? "#ef4444" : spot.intensity > 0.35 ? "#f59e0b" : "#06b6d4";
        const scale = 0.02 + spot.intensity * 0.025;

        return (
          <group key={index} position={spot.pos}>
            <mesh>
              <sphereGeometry args={[scale, 8, 8]} />
              <meshBasicMaterial color={color} toneMapped={false} />
            </mesh>
            {/* Glowing atmosphere halo around hotspots */}
            <mesh scale={[3, 3, 3]}>
              <sphereGeometry args={[scale, 8, 8]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.15 * spot.intensity}
                wireframe
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// Fullscreen background stars
function Starfield() {
  const pointsRef = useRef<THREE.Points>(null);
  const [coords] = useState(() => {
    const data = new Float32Array(300 * 3);
    for (let i = 0; i < 300; i++) {
      const radius = 10 + Math.random() * 20;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      
      data[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      data[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      data[i * 3 + 2] = radius * Math.cos(phi);
    }
    return data;
  });

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.01;
    }
  });

  return (
    <Points ref={pointsRef} positions={coords} stride={3}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

// Primary Wrapper Component with Mouse Handlers
export default function GlobeCanvas() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates to [-1, 1]
      setMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#06b6d4" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ef4444" />
        
        <Earth mouseX={mouse.x} mouseY={mouse.y} />
        <SatelliteOrbits count={4} />
        <Starfield />
      </Canvas>
    </div>
  );
}
