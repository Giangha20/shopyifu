'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  depth?: number;
  maxRotate?: number;
  glareOpacity?: number;
  borderGlow?: boolean;
}

export function Card3D({
  children,
  className = '',
  maxRotate = 12,
  glareOpacity = 0.25,
  borderGlow = true,
}: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouchDevice(window.matchMedia('(hover: none)').matches || 'ontouchstart' in window);
    }
  }, []);

  // Mouse coordinate values normalized from -1 to 1
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring physics for smooth organic human-crafted motion damping
  const mouseXSpring = useSpring(x, { stiffness: 220, damping: 22 });
  const mouseYSpring = useSpring(y, { stiffness: 220, damping: 22 });

  // 3D rotations based on spring coordinates (0 on touch devices for fluid native scroll)
  const effectiveRotate = isTouchDevice ? 0 : maxRotate;
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [effectiveRotate, -effectiveRotate]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-effectiveRotate, effectiveRotate]);

  // Glare position percentage
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isTouchDevice || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const xPct = mouseX / rect.width - 0.5;
      const yPct = mouseY / rect.height - 0.5;

      x.set(xPct);
      y.set(yPct);
    },
    [x, y, isTouchDevice]
  );

  const handleMouseEnter = () => {
    if (!isTouchDevice) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div
      style={{ perspective: 1200, touchAction: 'pan-y' }}
      className="relative w-full h-full"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchEnd={handleMouseLeave}
    >
      <motion.div
        ref={cardRef}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`relative w-full h-full transition-shadow duration-500 ${
          isHovered && borderGlow
            ? 'shadow-[0_25px_50px_-12px_rgba(201,169,110,0.28)]'
            : 'shadow-md'
        } ${className}`}
      >
        {/* Render child elements */}
        <div style={{ transform: 'translateZ(0px)', transformStyle: 'preserve-3d' }}>
          {children}
        </div>

        {/* Dynamic Specular Light Glare Overlay */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden transition-opacity duration-300"
          style={{
            opacity: isHovered ? glareOpacity : 0,
            background: useTransform(
              [glareX, glareY],
              ([gx, gy]) =>
                `radial-gradient(circle 350px at ${gx} ${gy}, rgba(255,255,255,0.45) 0%, rgba(201,169,110,0.2) 40%, transparent 80%)`
            ),
          }}
        />

        {/* Subtle holographic border shine */}
        {borderGlow && (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 rounded-[inherit] border transition-opacity duration-500 ${
              isHovered ? 'border-luxury-gold/50 opacity-100' : 'border-transparent opacity-0'
            }`}
          />
        )}
      </motion.div>
    </div>
  );
}
