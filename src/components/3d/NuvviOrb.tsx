import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import * as THREE from "three";
import { env } from "@/config/env";

function OrbMesh() {
  const meshRef = useRef<THREE.Mesh>(null!);

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float uTime;
    void main() {
      float dash = sin(vUv.y * 20.0 + uTime) * 0.5 + 0.5;
      float glow = smoothstep(0.4, 0.6, dash);
      vec3 color = mix(vec3(0.0, 0.18, 0.12), vec3(0.0, 1.0, 0.7), glow);
      float alpha = glow * 0.3 + 0.05;
      gl_FragColor = vec4(color, alpha);
    }
  `;

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
      meshRef.current.rotation.x += delta * 0.05;
      uniforms.uTime.value += delta;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.5, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
      <Sphere args={[1.55, 32, 32]}>
        <meshBasicMaterial color="#00ffb3" transparent opacity={0.04} wireframe />
      </Sphere>
    </mesh>
  );
}

export function NuvviOrb() {
  if (!env.ENABLE_3D) return null;

  return (
    <div className="w-full h-[320px] rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.2} />
        <OrbMesh />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>
    </div>
  );
}
