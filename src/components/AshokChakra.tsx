import React from 'react';
import { motion } from 'motion/react';

interface AshokChakraProps {
  size?: number;
  className?: string;
  animateRotation?: boolean;
  glow?: boolean;
}

export default function AshokChakra({
  size = 48,
  className = '',
  animateRotation = true,
  glow = true
}: AshokChakraProps) {
  // Generates the 24 spokes of the Ashok Chakra at 15-degree intervals
  const spokes = Array.from({ length: 24 }, (_, i) => {
    const angle = i * 15;
    return (
      <g key={i} transform={`rotate(${angle} 100 100)`}>
        {/* Main sharp triangular spoke */}
        <path
          d="M 100 100 L 98 25 L 100 15 L 102 25 Z"
          fill="#06038D"
          stroke="#06038D"
          strokeWidth="0.5"
        />
        {/* Little diamond-shaped bulb/drop on the inner rim between spokes */}
        <circle cx="100" cy="18" r="1.5" fill="#06038D" />
      </g>
    );
  });

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {glow && (
        <div 
          className="absolute inset-0 rounded-full bg-blue-600/20 blur-md animate-pulse"
          style={{ width: size, height: size }}
        />
      )}
      <motion.svg
        width="100%"
        height="100%"
        viewBox="0 0 200 200"
        animate={
          animateRotation
            ? { rotate: 360 }
            : {}
        }
        transition={
          animateRotation
            ? { repeat: Infinity, duration: 40, ease: 'linear' }
            : {}
        }
        className="relative z-10 drop-shadow-[0_2px_8px_rgba(6,3,141,0.4)]"
      >
        {/* Outer Circular Rim */}
        <circle
          cx="100"
          cy="100"
          r="92"
          fill="none"
          stroke="#06038D"
          strokeWidth="6"
        />
        
        {/* Inner Thin Circular Ring */}
        <circle
          cx="100"
          cy="100"
          r="82"
          fill="none"
          stroke="#06038D"
          strokeWidth="2"
        />

        {/* 24 Semicircular arches on the inner side of outer ring */}
        {Array.from({ length: 24 }).map((_, i) => (
          <path
            key={`arch-${i}`}
            d="M 96 11 A 4 4 0 0 1 104 11"
            fill="none"
            stroke="#06038D"
            strokeWidth="2.5"
            transform={`rotate(${i * 15} 100 100)`}
          />
        ))}

        {/* 24 spokes */}
        {spokes}

        {/* Central Circular Hub */}
        <circle
          cx="100"
          cy="100"
          r="16"
          fill="#06038D"
        />
        
        {/* Central Hub Core Eye */}
        <circle
          cx="100"
          cy="100"
          r="6"
          fill="#FFFFFF"
        />
      </motion.svg>
    </div>
  );
}
