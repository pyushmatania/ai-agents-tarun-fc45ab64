import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

const AnimatedSphere = ({ position, color, speed, distort, scale }: any) => {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * speed * 0.3;
      mesh.current.rotation.y = state.clock.elapsedTime * speed * 0.2;
    }
  });

  return (
    <Float speed={speed * 2} rotationIntensity={0.4} floatIntensity={1.5}>
      <mesh ref={mesh} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial
          color={color}
          roughness={0.2}
          metalness={0.8}
          distort={distort}
          speed={2}
          transparent
          opacity={0.7}
        />
      </mesh>
    </Float>
  );
};

const Particles = ({ count = 60 }: { count?: number }) => {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.03;
      points.current.rotation.x = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#E8935A" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
};

const Scene = () => (
  <>
    <ambientLight intensity={0.3} />
    <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffeedd" />
    <pointLight position={[-3, 2, -2]} intensity={0.5} color="#9B87F5" />
    <pointLight position={[3, -2, 2]} intensity={0.4} color="#E8935A" />

    <AnimatedSphere position={[-2.5, 1.5, -2]} color="#9B87F5" speed={0.5} distort={0.4} scale={1.2} />
    <AnimatedSphere position={[2.8, -1, -3]} color="#E8935A" speed={0.7} distort={0.3} scale={0.9} />
    <AnimatedSphere position={[0, 2.5, -4]} color="#7C6BC4" speed={0.3} distort={0.5} scale={1.5} />
    <AnimatedSphere position={[-1.5, -2, -1]} color="#F0A868" speed={0.6} distort={0.35} scale={0.7} />
    <AnimatedSphere position={[1.5, 0.5, -2.5]} color="#B8A5E8" speed={0.4} distort={0.45} scale={0.6} />

    <Particles count={80} />
  </>
);

const FloatingParticles = () => (
  <div className="absolute inset-0 z-0">
    <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 2]}>
      <Scene />
    </Canvas>
  </div>
);

export default FloatingParticles;
