import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import boyPracticingQuestions from '../assets/images/boy_practicing_questions_1784813608667.jpg';
// @ts-ignore
import boyGirlCuriousBharat from '../assets/images/boy_girl_curious_bharat_1784813567963.jpg';
import { Sparkles, Atom, Zap, Brain, BookOpen } from 'lucide-react';

interface ChildScientistCanvasProps {
  appLanguage?: 'en' | 'hi';
}

export default function ChildScientistCanvas({ appLanguage = 'en' }: ChildScientistCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const width = container.clientWidth || 320;
    const height = 220;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x38bdf8, 3, 20); // Cyan glow
    pointLight1.position.set(3, 3, 4);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xf59e0b, 2.5, 20); // Amber glow
    pointLight2.position.set(-3, -2, 3);
    scene.add(pointLight2);

    // 5. Texture loading and transparent keying for Child Scientist
    const textureLoader = new THREE.TextureLoader();
    const group = new THREE.Group();
    scene.add(group);

    // Load image texture
    textureLoader.load(
      boyPracticingQuestions || boyGirlCuriousBharat,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;

        // Create main 3D Card Mesh for Child Scientist
        const cardGeometry = new THREE.PlaneGeometry(3.2, 2.4);
        const cardMaterial = new THREE.MeshStandardMaterial({
          map: texture,
          transparent: true,
          side: THREE.DoubleSide,
          roughness: 0.2,
          metalness: 0.1
        });

        const scientistMesh = new THREE.Mesh(cardGeometry, cardMaterial);
        scientistMesh.position.set(0, 0, 0);
        group.add(scientistMesh);

        // Add 3D Glowing Frame behind Card
        const frameGeo = new THREE.RingGeometry(1.8, 1.9, 32);
        const frameMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.6
        });
        const frameMesh = new THREE.Mesh(frameGeo, frameMat);
        frameMesh.position.set(0, 0, -0.1);
        group.add(frameMesh);
      }
    );

    // 6. Orbiting Science Atom Rings in Three.js
    const ringGroup = new THREE.Group();
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });

    const atomRing1 = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.02, 16, 64), ringMat);
    atomRing1.rotation.x = Math.PI / 3;
    ringGroup.add(atomRing1);

    const atomRing2 = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.02, 16, 64), new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    }));
    atomRing2.rotation.y = Math.PI / 3;
    ringGroup.add(atomRing2);

    scene.add(ringGroup);

    // 7. Particle System (Floating Glowing Electrons / Starfield)
    const particleCount = 80;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;

      // Alternating cyan and amber particles
      if (i % 2 === 0) {
        colors[i * 3] = 0.22;  // R
        colors[i * 3 + 1] = 0.74; // G
        colors[i * 3 + 2] = 0.97; // B
      } else {
        colors[i * 3] = 0.96;  // R
        colors[i * 3 + 1] = 0.62; // G
        colors[i * 3 + 2] = 0.04; // B
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });

    const particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);

    // 8. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Floating bobbing & rotation
      group.position.y = Math.sin(elapsedTime * 1.5) * 0.12;
      group.rotation.y = Math.sin(elapsedTime * 0.8) * 0.15;
      group.rotation.x = Math.cos(elapsedTime * 0.6) * 0.05;

      // Atom rings spinning
      ringGroup.rotation.y = elapsedTime * 0.5;
      ringGroup.rotation.x = elapsedTime * 0.3;

      // Particles gentle drift
      particles.rotation.y = elapsedTime * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Listener
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const w = containerRef.current.clientWidth || 320;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full relative bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800/80 rounded-3xl p-4 sm:p-6 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-500 via-amber-500 to-emerald-500"></div>
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Left Text & Badge Info */}
      <div className="flex-1 text-center md:text-left z-10 space-y-2">
        <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
          <span className="text-[10px] bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 px-3 py-1 rounded-full font-mono font-bold tracking-widest uppercase flex items-center gap-1.5 shadow-sm">
            <Atom className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            {appLanguage === 'hi' ? '3D बाल वैज्ञानिक सिमुलेशन' : '3D CHILD SCIENTIST LAB'}
          </span>
          <span className="text-[10px] bg-amber-950/80 border border-amber-800/60 text-amber-400 px-2.5 py-1 rounded-full font-mono font-bold uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {appLanguage === 'hi' ? 'इंटरएक्टिव' : 'Interactive'}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
          {appLanguage === 'hi' 
            ? 'जिज्ञासु भारत 3D बाल वैज्ञानिक शिक्षण केंद्र' 
            : 'Curious Bharat 3D Child Scientist Innovation Hub'}
        </h2>

        <p className="text-xs text-zinc-400 max-w-lg leading-relaxed">
          {appLanguage === 'hi'
            ? 'वैज्ञानिक अन्वेषण, वास्तविक 3D भौतिकी प्रयोगों, NCERT पाठ्यक्रम अवधारणाओं, और इंटरएक्टिव परीक्षा तैयारी का अन्वेषण करें।'
            : 'Explore scientific inquiry, active 3D physics experiments, NCERT syllabus concepts, and interactive exam preparation.'}
        </p>

        <div className="flex items-center justify-center md:justify-start gap-4 pt-1 text-[11px] font-mono text-zinc-300">
          <div className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>{appLanguage === 'hi' ? 'स्मार्ट विजुअलाइज़र' : 'Smart Visualizer'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            <span>{appLanguage === 'hi' ? 'एनसीईआरटी प्रयोगशाला' : 'NCERT Lab'}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>{appLanguage === 'hi' ? '100% नि:शुल्क नोट्स' : 'Free Notes'}</span>
          </div>
        </div>
      </div>

      {/* Right Three.js Interactive Canvas Container */}
      <div className="relative w-full md:w-72 h-48 flex items-center justify-center z-10 shrink-0">
        <canvas ref={canvasRef} className="w-full h-full rounded-2xl cursor-grab active:cursor-grabbing" />
      </div>
    </div>
  );
}
