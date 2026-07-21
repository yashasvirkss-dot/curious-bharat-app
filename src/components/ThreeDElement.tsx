import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import spriteImage from '../assets/images/kalu_and_buddhu_1784268211413.jpg';

// @ts-ignore
import hometownMascots from '../assets/images/hometown_mascots_1784615802739.jpg';
// @ts-ignore
import coins3dAcademic from '../assets/images/coins_3d_academic_1784615817300.jpg';
// @ts-ignore
import questionMark3d from '../assets/images/question_mark_3d_1784615830391.jpg';
// @ts-ignore
import booksBundle3d from '../assets/images/books_bundle_3d_1784615842764.jpg';
// @ts-ignore
import studentSolving3d from '../assets/images/student_solving_3d_1784615857660.jpg';
// @ts-ignore
import robot3dAssistant from '../assets/images/robot_3d_assistant_1784615870300.jpg';
// @ts-ignore
import trophy3dGold from '../assets/images/trophy_3d_gold_1784615885843.jpg';
// @ts-ignore
import priceTag3D from '../assets/images/price_tag_3d_1784616757364.jpg';

export type ThreeDElementType = 
  | 'priceTag' 
  | 'trophy' 
  | 'trophy2'
  | 'medal'
  | 'cap' 
  | 'questionMark' 
  | 'helpMan'
  | 'car' 
  | 'blueCar'
  | 'motorcycle'
  | 'tree' 
  | 'smallTree'
  | 'robot' 
  | 'boy'
  | 'runningBoy'
  | 'backpackBoy'
  | 'shortsBoy'
  | 'skirtGirl'
  | 'walkingGirl'
  | 'medalGirl'
  | 'bottleGirl'
  | 'hometown_mascots'
  | 'coins_3d_academic'
  | 'question_mark_3d'
  | 'books_bundle_3d'
  | 'student_solving_3d'
  | 'robot_3d_assistant'
  | 'trophy_3d_gold'
  | 'price_tag_3d';

interface ThreeDElementProps {
  type: ThreeDElementType;
  className?: string;
  autoRotate?: boolean;
  interactive?: boolean;
  colorOverride?: string;
}

const SPRITE_MAP: Record<ThreeDElementType, { x: string; y: string; zoom: string; label: string }> = {
  // Row 1: Students & Robots
  runningBoy: { x: '5.0%', y: '16.0%', zoom: '900%', label: 'Runner' },
  boy: { x: '18.2%', y: '15.5%', zoom: '900%', label: 'Pointer' },
  backpackBoy: { x: '29.0%', y: '15.5%', zoom: '900%', label: 'Student' },
  shortsBoy: { x: '39.0%', y: '15.5%', zoom: '900%', label: 'Scholar' },
  skirtGirl: { x: '48.5%', y: '15.5%', zoom: '900%', label: 'Waving' },
  walkingGirl: { x: '57.0%', y: '15.5%', zoom: '900%', label: 'Explorer' },
  medalGirl: { x: '67.0%', y: '15.5%', zoom: '900%', label: 'Achiever' },
  bottleGirl: { x: '77.0%', y: '15.5%', zoom: '900%', label: 'Study Buddy' },
  robot: { x: '88.5%', y: '15.5%', zoom: '900%', label: 'Bharat AI' },

  // Row 2: Questions, Cars, Motorcycles, Caps
  questionMark: { x: '6.5%', y: '49.5%', zoom: '950%', label: 'Query' },
  helpMan: { x: '19.5%', y: '49.5%', zoom: '950%', label: 'Guidance' },
  car: { x: '38.5%', y: '53.5%', zoom: '800%', label: 'Velocity' },
  motorcycle: { x: '57.5%', y: '53.5%', zoom: '800%', label: 'Acceleration' },
  blueCar: { x: '76.5%', y: '53.5%', zoom: '800%', label: 'Physics' },
  cap: { x: '89.5%', y: '44.5%', zoom: '850%', label: 'Graduate' },

  // Row 3: Trees, Tags, Stickers, Trophies, Medals
  tree: { x: '10.5%', y: '80.0%', zoom: '700%', label: 'Biology' },
  smallTree: { x: '24.5%', y: '80.0%', zoom: '700%', label: 'Plant Life' },
  priceTag: { x: '44.5%', y: '80.5%', zoom: '1000%', label: 'Premium' },
  trophy: { x: '94.5%', y: '74.5%', zoom: '850%', label: 'Grand Trophy' },
  trophy2: { x: '85.5%', y: '80.5%', zoom: '850%', label: 'Merit Trophy' },
  medal: { x: '76.0%', y: '80.5%', zoom: '850%', label: 'Top Medal' },

  // Custom 3D elements
  hometown_mascots: { x: '0%', y: '0%', zoom: '100%', label: 'Kalu & Buddhu Mascots' },
  coins_3d_academic: { x: '0%', y: '0%', zoom: '100%', label: 'Academic Coins' },
  question_mark_3d: { x: '0%', y: '0%', zoom: '100%', label: 'Doubt Resolved' },
  books_bundle_3d: { x: '0%', y: '0%', zoom: '100%', label: 'Books Bundle' },
  student_solving_3d: { x: '0%', y: '0%', zoom: '100%', label: 'Exam Practice' },
  robot_3d_assistant: { x: '0%', y: '0%', zoom: '100%', label: 'Bharat AI Robot' },
  trophy_3d_gold: { x: '0%', y: '0%', zoom: '100%', label: 'Championship Trophy' },
  price_tag_3d: { x: '0%', y: '0%', zoom: '100%', label: 'Special Discount Tag' }
};

const CUSTOM_IMAGES_MAP: Record<string, string> = {
  hometown_mascots: hometownMascots,
  coins_3d_academic: coins3dAcademic,
  question_mark_3d: questionMark3d,
  books_bundle_3d: booksBundle3d,
  student_solving_3d: studentSolving3d,
  robot_3d_assistant: robot3dAssistant,
  trophy_3d_gold: trophy3dGold,
  price_tag_3d: priceTag3D
};

// Global transparent asset cache to prevent recalculating textures on every state render
const TRANSPARENT_PNG_CACHE: Record<string, string> = {};

/**
 * Programmatically crops the requested element from the sprite sheet/custom image
 * and filters out any black pixels (RGB near 0) to make them completely transparent.
 */
function extractAndKeySprite(
  imageUrl: string,
  xPercent: string,
  yPercent: string,
  zoomPercent: string,
  isCustomImage: boolean,
  cacheKey: string
): Promise<string> {
  if (TRANSPARENT_PNG_CACHE[cacheKey]) {
    return Promise.resolve(TRANSPARENT_PNG_CACHE[cacheKey]);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageUrl);
        return;
      }

      if (isCustomImage) {
        ctx.drawImage(img, 0, 0, 512, 512);
      } else {
        const xVal = parseFloat(xPercent) / 100;
        const yVal = parseFloat(yPercent) / 100;
        const zoomVal = parseFloat(zoomPercent) / 100;

        const imgWidth = 512 * zoomVal;
        const imgHeight = 512 * zoomVal;

        const offsetX = - (imgWidth - 512) * xVal;
        const offsetY = - (imgHeight - 512) * yVal;

        ctx.drawImage(img, offsetX, offsetY, imgWidth, imgHeight);
      }

      // Chroma-keying out the solid black background
      const imgData = ctx.getImageData(0, 0, 512, 512);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Match pure black or dark grey compression artifacts
        if (r < 45 && g < 45 && b < 45) {
          data[i + 3] = 0; // Alpha = 0 (completely transparent)
        }
      }
      ctx.putImageData(imgData, 0, 0);

      const resultUrl = canvas.toDataURL('image/png');
      TRANSPARENT_PNG_CACHE[cacheKey] = resultUrl;
      resolve(resultUrl);
    };
    img.onerror = () => {
      resolve(imageUrl);
    };
  });
}

export default function ThreeDElement({
  type,
  className = 'w-full h-full',
  autoRotate = true,
  interactive = true,
  colorOverride
}: ThreeDElementProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [transparentSrc, setTransparentSrc] = useState<string | null>(null);

  // Load and cache transparent sprite cutout
  useEffect(() => {
    const isCustom = type in CUSTOM_IMAGES_MAP;
    const srcImage = isCustom ? CUSTOM_IMAGES_MAP[type] : spriteImage;
    const coords = SPRITE_MAP[type] || SPRITE_MAP.boy;
    
    extractAndKeySprite(srcImage, coords.x, coords.y, coords.zoom, isCustom, type)
      .then((url) => {
        setTransparentSrc(url);
      });
  }, [type]);

  // Set up the Three.js 3D Interactive WebGL Scene
  useEffect(() => {
    if (!transparentSrc || !canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    // Get current dimensions
    const rect = container.getBoundingClientRect();
    const width = rect.width || 128;
    const height = rect.height || 128;

    // 1. Create Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.2;

    // 2. Create WebGL Renderer with Alpha transparent channel
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 3. Load transparent keyed texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(transparentSrc);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    // 4. Create Flat 3D Plane Mesh centered in the world
    const geometry = new THREE.PlaneGeometry(2.6, 2.6);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 5. Ambient state for gentle floating oscillations
    let animationFrameId: number;
    let clock = new THREE.Clock();

    // Mouse movement state
    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;

    // Pointer move listener for interactive 3D parallax tilt
    const handlePointerMove = (e: PointerEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      targetRotationY = x * 0.7; // Maximum tilt angle
      targetRotationX = y * 0.7;
    };

    const handlePointerLeave = () => {
      targetRotationX = 0;
      targetRotationY = 0;
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerleave', handlePointerLeave);

    // 6. Animation Render Loop
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Gentle floating up and down
      if (autoRotate) {
        mesh.position.y = Math.sin(elapsedTime * 2.2) * 0.12;
        // Slow continuous rotation around Y axis
        mesh.rotation.y = elapsedTime * 0.4;
      }

      // Smooth interpolation (lerp) for cursor tilt physics
      currentRotationX += (targetRotationX - currentRotationX) * 0.12;
      currentRotationY += (targetRotationY - currentRotationY) * 0.12;

      mesh.rotation.x = -currentRotationX;
      // Combine manual continuous spin with mouse movement displacement
      mesh.rotation.y = (autoRotate ? elapsedTime * 0.4 : 0) + currentRotationY;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 7. Handle dynamic parent layout resizing
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width: newW, height: newH } = entries[0].contentRect;
      if (newW > 0 && newH > 0) {
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    });
    resizeObserver.observe(container);

    // 8. Cleanup WebGL components on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      resizeObserver.disconnect();
      
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, [transparentSrc, autoRotate, interactive]);

  return (
    <div 
      ref={containerRef} 
      className={`${className} relative flex items-center justify-center select-none overflow-visible`}
    >
      {/* 3D Glowing Aura underlay to make the floating element look absolutely magnificent */}
      <div 
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/10 to-transparent blur-lg opacity-40 pointer-events-none scale-90" 
      />
      
      {/* Three.js canvas container. Absolutely no black background blocks, 100% transparent. */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full max-w-full max-h-full cursor-grab active:cursor-grabbing outline-none block"
      />
    </div>
  );
}
