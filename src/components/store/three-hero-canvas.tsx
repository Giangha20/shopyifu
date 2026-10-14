'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export function ThreeHeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animId: number;

    try {
      // 1. Scene setup
      const scene = new THREE.Scene();

      // 2. Camera setup
      const width = container.clientWidth || 400;
      const height = container.clientHeight || 400;
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.z = 6;

      // 3. Renderer setup
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;

      container.appendChild(renderer.domElement);
      setHasWebGL(true);

      // 4. Lighting - Luxury Warm Gold & Champagne Lighting
      const ambientLight = new THREE.AmbientLight(0xfff6e5, 1.2);
      scene.add(ambientLight);

      const goldPointLight1 = new THREE.PointLight(0xd4af37, 3.5, 20);
      goldPointLight1.position.set(4, 5, 4);
      scene.add(goldPointLight1);

      const goldPointLight2 = new THREE.PointLight(0xffd700, 2.5, 20);
      goldPointLight2.position.set(-4, -3, 3);
      scene.add(goldPointLight2);

      const rimLight = new THREE.DirectionalLight(0xffffff, 2.0);
      rimLight.position.set(0, 6, -2);
      scene.add(rimLight);

      // 5. Geometry: Luxury Faceted Jewel (Icosahedron) + Delicate Wireframe Cage
      const jewelGroup = new THREE.Group();

      // Inner solid faceted jewel
      const jewelGeo = new THREE.IcosahedronGeometry(1.65, 0);
      const jewelMat = new THREE.MeshPhysicalMaterial({
        color: 0xc9a96e,
        metalness: 0.88,
        roughness: 0.18,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        reflectivity: 0.95,
        wireframe: false,
        flatShading: true,
      });
      const jewelMesh = new THREE.Mesh(jewelGeo, jewelMat);
      jewelGroup.add(jewelMesh);

      // Outer delicate golden wireframe halo
      const outerGeo = new THREE.IcosahedronGeometry(2.1, 1);
      const outerMat = new THREE.MeshStandardMaterial({
        color: 0xf3e5ab,
        metalness: 0.95,
        roughness: 0.2,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      });
      const outerMesh = new THREE.Mesh(outerGeo, outerMat);
      jewelGroup.add(outerMesh);

      // Orbiting Gold Torus Ring (Symbolizing Luxury Wedding & Jewelry Ring)
      const ringGeo = new THREE.TorusGeometry(2.4, 0.035, 16, 100);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xffdf9e,
        metalness: 0.9,
        roughness: 0.15,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 3;
      jewelGroup.add(ringMesh);

      scene.add(jewelGroup);

      // 6. Floating Golden Stardust Particles
      const particleCount = 180;
      const particleGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 12;
        positions[i + 1] = (Math.random() - 0.5) * 12;
        positions[i + 2] = (Math.random() - 0.5) * 8;
      }

      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const particleMat = new THREE.PointsMaterial({
        color: 0xffe082,
        size: 0.045,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      });

      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      // 7. Interactive Mouse Tracking
      let mouseX = 0;
      let mouseY = 0;
      let targetRotationX = 0;
      let targetRotationY = 0;

      const onPointerMove = (e: MouseEvent) => {
        const { innerWidth, innerHeight } = window;
        mouseX = (e.clientX / innerWidth) * 2 - 1;
        mouseY = -(e.clientY / innerHeight) * 2 + 1;

        targetRotationY = mouseX * 0.75;
        targetRotationX = -mouseY * 0.5;
      };

      window.addEventListener('pointermove', onPointerMove, { passive: true });

      // 8. Resize Handler
      const handleResize = () => {
        if (!container || !renderer) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener('resize', handleResize);

      // 9. Animation Loop
      let clock = new THREE.Clock();

      const animate = () => {
        animId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Idle floating & rotation
        jewelMesh.rotation.y = elapsedTime * 0.22;
        jewelMesh.rotation.x = Math.sin(elapsedTime * 0.3) * 0.2;

        outerMesh.rotation.y = -elapsedTime * 0.15;
        outerMesh.rotation.z = Math.cos(elapsedTime * 0.25) * 0.15;

        ringMesh.rotation.z = elapsedTime * 0.35;
        ringMesh.rotation.y = Math.sin(elapsedTime * 0.4) * 0.25;

        particles.rotation.y = elapsedTime * 0.05;

        // Smooth Lerp tracking to mouse coordinates
        jewelGroup.rotation.y += (targetRotationY - jewelGroup.rotation.y) * 0.05;
        jewelGroup.rotation.x += (targetRotationX - jewelGroup.rotation.x) * 0.05;

        // Floating subtle bobbing
        jewelGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.12;

        if (renderer) {
          renderer.render(scene, camera);
        }
      };

      animate();

      // Cleanup
      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('resize', handleResize);

        jewelGeo.dispose();
        jewelMat.dispose();
        outerGeo.dispose();
        outerMat.dispose();
        ringGeo.dispose();
        ringMat.dispose();
        particleGeo.dispose();
        particleMat.dispose();

        if (renderer && renderer.domElement && container) {
          container.removeChild(renderer.domElement);
          renderer.dispose();
        }
      };
    } catch (err) {
      console.warn('WebGL initialization skipped:', err);
      setHasWebGL(false);
      return;
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[380px] sm:min-h-[460px] pointer-events-none select-none flex items-center justify-center"
      aria-hidden="true"
    >
      {hasWebGL === false && (
        <div className="text-luxury-gold/40 text-xs italic">
          [YIFU Haute Couture 3D Showcase]
        </div>
      )}
    </div>
  );
}
