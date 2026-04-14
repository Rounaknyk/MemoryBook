'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// ─── Starfield Background (twinkling stars) ────────────────────────────
function useStarfield(canvasRef: React.RefObject<HTMLCanvasElement | null>, active: boolean) {
  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    interface Star {
      x: number; y: number; size: number; opacity: number;
      twinkleSpeed: number; twinkleOffset: number; color: string;
    }

    const stars: Star[] = [];
    const starColors = ['#ffffff', '#FFD700', '#C084FC', '#81D4FA', '#F48FB1', '#B388FF', '#E0E7FF'];

    for (let i = 0; i < 250; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.5 + 0.3,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: 0.5 + Math.random() * 2,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }

    // Shooting stars
    interface ShootingStar {
      x: number; y: number; length: number; speed: number;
      angle: number; opacity: number; active: boolean;
    }
    const shootingStars: ShootingStar[] = [];

    const createShootingStar = () => {
      shootingStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.4,
        length: 60 + Math.random() * 100,
        speed: 8 + Math.random() * 12,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.5,
        opacity: 1,
        active: true,
      });
    };

    const shootingInterval = setInterval(createShootingStar, 2000);

    let frameId: number;
    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      stars.forEach((star) => {
        const twinkle = Math.sin(time * 0.001 * star.twinkleSpeed + star.twinkleOffset);
        const alpha = star.opacity * (0.5 + twinkle * 0.5);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = star.color;
        ctx.shadowBlur = star.size * 4;
        ctx.shadowColor = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Add cross sparkle for bigger stars
        if (star.size > 1.5 && twinkle > 0.3) {
          ctx.strokeStyle = star.color;
          ctx.lineWidth = 0.5;
          ctx.globalAlpha = alpha * 0.5;
          const sparkleLen = star.size * 3;
          ctx.beginPath();
          ctx.moveTo(star.x - sparkleLen, star.y);
          ctx.lineTo(star.x + sparkleLen, star.y);
          ctx.moveTo(star.x, star.y - sparkleLen);
          ctx.lineTo(star.x, star.y + sparkleLen);
          ctx.stroke();
        }
        ctx.restore();
      });

      // Draw shooting stars
      shootingStars.forEach((ss) => {
        if (!ss.active) return;
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.opacity -= 0.015;
        if (ss.opacity <= 0) { ss.active = false; return; }

        const tailX = ss.x - Math.cos(ss.angle) * ss.length;
        const tailY = ss.y - Math.sin(ss.angle) * ss.length;

        const gradient = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        gradient.addColorStop(0, `rgba(255,255,255,0)`);
        gradient.addColorStop(0.7, `rgba(200,200,255,${ss.opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(255,255,255,${ss.opacity})`);

        ctx.save();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(ss.x, ss.y);
        ctx.stroke();

        // Head glow
        ctx.fillStyle = `rgba(255,255,255,${ss.opacity})`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#C084FC';
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      clearInterval(shootingInterval);
      window.removeEventListener('resize', resize);
    };
  }, [active, canvasRef]);
}

// ─── Confetti System ───────────────────────────────────────────────────
function useConfetti(canvasRef: React.RefObject<HTMLCanvasElement | null>, active: boolean) {
  const particlesRef = useRef<any[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#FF69B4', '#C084FC', '#FFD700', '#FF4081', '#E040FB', '#FF80AB', '#EA80FC', '#B388FF', '#81D4FA', '#F48FB1'];

    const createBurst = (count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const speed = 2 + Math.random() * 6;
        particlesRef.current.push({
          x: canvas.width * (0.2 + Math.random() * 0.6),
          y: canvas.height * (0.1 + Math.random() * 0.3),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          size: 4 + Math.random() * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.3,
          opacity: 1,
          shape: Math.floor(Math.random() * 3), // 0=circle 1=rect 2=star
        });
      }
    };

    createBurst(80);
    const burstInterval = setInterval(() => createBurst(35), 1800);

    const drawStar5 = (ctx: CanvasRenderingContext2D, size: number) => {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const r = i % 2 === 0 ? size : size * 0.4;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.vx *= 0.99;
        p.rotation += p.rotationSpeed; p.opacity -= 0.004;
        if (p.opacity <= 0) return;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        if (p.shape === 0) { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
        else if (p.shape === 1) { ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); }
        else { drawStar5(ctx, p.size / 2); }
        ctx.restore();
      });
      particlesRef.current = particlesRef.current.filter((p) => p.opacity > 0 && p.y < canvas.height + 50);
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      clearInterval(burstInterval);
      window.removeEventListener('resize', resize);
    };
  }, [active, canvasRef]);
}

// ─── Three.js Space Scene ──────────────────────────────────────────────
function useThreeScene(containerRef: React.RefObject<HTMLDivElement | null>, active: boolean) {
  useEffect(() => {
    if (!active || !containerRef.current) return;
    const container = containerRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const moonLight = new THREE.PointLight(0xc4b5fd, 2, 60);
    moonLight.position.set(8, 6, 5);
    scene.add(moonLight);
    const pinkLight = new THREE.PointLight(0xff69b4, 1.2, 50);
    pinkLight.position.set(-5, -3, 5);
    scene.add(pinkLight);
    const blueLight = new THREE.PointLight(0x81d4fa, 0.8, 40);
    blueLight.position.set(0, -5, 8);
    scene.add(blueLight);

    const meshes: THREE.Object3D[] = [];

    // ── Moon (glowing sphere) ──
    const moonGeo = new THREE.SphereGeometry(2.2, 64, 64);
    const moonMat = new THREE.MeshPhysicalMaterial({
      color: 0xf5f0e8,
      emissive: 0xddd6c8,
      emissiveIntensity: 0.4,
      metalness: 0.0,
      roughness: 0.8,
      transparent: true,
      opacity: 0.95,
    });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(9, 5.5, -8);

    // Moon glow
    const glowGeo = new THREE.SphereGeometry(2.8, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xc4b5fd,
      transparent: true,
      opacity: 0.12,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    moon.add(glow);

    // Moon craters
    for (let i = 0; i < 5; i++) {
      const craterGeo = new THREE.SphereGeometry(0.15 + Math.random() * 0.2, 16, 16);
      const craterMat = new THREE.MeshPhysicalMaterial({
        color: 0xd4cfc2,
        roughness: 1.0,
        metalness: 0,
      });
      const crater = new THREE.Mesh(craterGeo, craterMat);
      const theta = Math.random() * Math.PI;
      const phi = Math.random() * Math.PI * 2;
      crater.position.set(
        2.1 * Math.sin(theta) * Math.cos(phi),
        2.1 * Math.sin(theta) * Math.sin(phi),
        2.1 * Math.cos(theta)
      );
      moon.add(crater);
    }

    scene.add(moon);
    moon.userData = { speed: 0.1, floatOffset: 0, rotSpeed: { x: 0.001, y: 0.003, z: 0 } };
    meshes.push(moon);

    // ── Saturn-like planet ──
    const saturnGroup = new THREE.Group();
    const saturnGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const saturnMat = new THREE.MeshPhysicalMaterial({
      color: 0xc084fc,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.2,
      metalness: 0.3,
      roughness: 0.5,
      transparent: true,
      opacity: 0.85,
    });
    const saturn = new THREE.Mesh(saturnGeo, saturnMat);
    saturnGroup.add(saturn);

    // Saturn ring
    const ringGeo = new THREE.RingGeometry(1.6, 2.3, 64);
    const ringMat = new THREE.MeshPhysicalMaterial({
      color: 0xe9d5ff,
      emissive: 0xc084fc,
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      metalness: 0.4,
      roughness: 0.2,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI * 0.4;
    saturnGroup.add(ring);

    saturnGroup.position.set(-10, 3, -10);
    saturnGroup.userData = { speed: 0.15, floatOffset: 1.5, rotSpeed: { x: 0.002, y: 0.005, z: 0.001 } };
    scene.add(saturnGroup);
    meshes.push(saturnGroup);

    // ── 3D Heart shapes ──
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0.3);
    heartShape.bezierCurveTo(0, 0.6, -0.5, 0.8, -0.5, 0.5);
    heartShape.bezierCurveTo(-0.5, 0.2, 0, 0.1, 0, -0.3);
    heartShape.bezierCurveTo(0, 0.1, 0.5, 0.2, 0.5, 0.5);
    heartShape.bezierCurveTo(0.5, 0.8, 0, 0.6, 0, 0.3);
    const heartExtrude = { depth: 0.15, bevelEnabled: true, bevelSegments: 4, bevelSize: 0.06, bevelThickness: 0.06 };
    const heartColors = [0xff69b4, 0xff4081, 0xe040fb, 0xff80ab, 0xf48fb1, 0xce93d8];

    for (let i = 0; i < 14; i++) {
      const geo = new THREE.ExtrudeGeometry(heartShape, heartExtrude);
      const mat = new THREE.MeshPhysicalMaterial({
        color: heartColors[Math.floor(Math.random() * heartColors.length)],
        metalness: 0.3, roughness: 0.2, transparent: true, opacity: 0.85,
        emissive: heartColors[Math.floor(Math.random() * heartColors.length)],
        emissiveIntensity: 0.15,
      });
      const mesh = new THREE.Mesh(geo, mat);
      const scale = 0.4 + Math.random() * 1;
      mesh.scale.set(scale, scale, scale);
      mesh.position.set((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 22, (Math.random() - 0.5) * 10 - 5);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      mesh.userData = {
        speed: 0.3 + Math.random() * 0.7, floatOffset: Math.random() * Math.PI * 2,
        rotSpeed: { x: (Math.random() - 0.5) * 0.02, y: (Math.random() - 0.5) * 0.02, z: (Math.random() - 0.5) * 0.02 },
      };
      scene.add(mesh);
      meshes.push(mesh);
    }

    // ── 3D Stars (golden) ──
    const starShape = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const radius = i % 2 === 0 ? 0.5 : 0.2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) starShape.moveTo(x, y); else starShape.lineTo(x, y);
    }
    starShape.closePath();

    for (let i = 0; i < 12; i++) {
      const geo = new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.03, bevelThickness: 0.03 });
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0xffd700, metalness: 0.6, roughness: 0.1,
        emissive: 0xffa000, emissiveIntensity: 0.3, transparent: true, opacity: 0.9,
      });
      const mesh = new THREE.Mesh(geo, mat);
      const scale = 0.3 + Math.random() * 0.7;
      mesh.scale.set(scale, scale, scale);
      mesh.position.set((Math.random() - 0.5) * 32, (Math.random() - 0.5) * 24, (Math.random() - 0.5) * 8 - 6);
      mesh.userData = {
        speed: 0.2 + Math.random() * 0.5, floatOffset: Math.random() * Math.PI * 2,
        rotSpeed: { x: (Math.random() - 0.5) * 0.03, y: (Math.random() - 0.5) * 0.04, z: (Math.random() - 0.5) * 0.02 },
      };
      scene.add(mesh);
      meshes.push(mesh);
    }

    // ── Gift boxes ──
    for (let i = 0; i < 6; i++) {
      const group = new THREE.Group();
      const boxColors = [0xff69b4, 0xc084fc, 0xff4081, 0xffd700, 0xe040fb];
      const boxColor = boxColors[Math.floor(Math.random() * boxColors.length)];
      const boxGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
      const boxMat = new THREE.MeshPhysicalMaterial({ color: boxColor, metalness: 0.2, roughness: 0.3, transparent: true, opacity: 0.9 });
      group.add(new THREE.Mesh(boxGeo, boxMat));
      const ribbonMat = new THREE.MeshPhysicalMaterial({ color: 0xffd700, metalness: 0.5, roughness: 0.1 });
      const r1 = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.12, 0.85), ribbonMat);
      r1.position.y = 0.05;
      group.add(r1);
      group.add(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.85, 0.85), ribbonMat.clone()));
      const scale = 0.5 + Math.random() * 0.7;
      group.scale.set(scale, scale, scale);
      group.position.set((Math.random() - 0.5) * 28, (Math.random() - 0.5) * 18, (Math.random() - 0.5) * 6 - 5);
      group.userData = {
        speed: 0.15 + Math.random() * 0.4, floatOffset: Math.random() * Math.PI * 2,
        rotSpeed: { x: (Math.random() - 0.5) * 0.01, y: (Math.random() - 0.5) * 0.02, z: (Math.random() - 0.5) * 0.01 },
      };
      scene.add(group);
      meshes.push(group);
    }

    // ── Floating spheres (cosmic orbs) ──
    for (let i = 0; i < 10; i++) {
      const geo = new THREE.SphereGeometry(0.3 + Math.random() * 0.25, 32, 32);
      const orbColors = [0xc084fc, 0x81d4fa, 0xb388ff, 0xea80fc, 0xff69b4, 0x7c3aed];
      const mat = new THREE.MeshPhysicalMaterial({
        color: orbColors[Math.floor(Math.random() * orbColors.length)],
        metalness: 0.1, roughness: 0.15, transparent: true, opacity: 0.7,
        clearcoat: 0.8, clearcoatRoughness: 0.1,
        emissive: orbColors[Math.floor(Math.random() * orbColors.length)],
        emissiveIntensity: 0.1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 8 - 4);
      mesh.userData = {
        speed: 0.4 + Math.random() * 0.8, floatOffset: Math.random() * Math.PI * 2,
        rotSpeed: { x: 0, y: 0, z: 0 },
      };
      scene.add(mesh);
      meshes.push(mesh);
    }

    // Animation loop
    const clock = new THREE.Clock();
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      meshes.forEach((obj) => {
        const { speed, floatOffset, rotSpeed } = obj.userData;
        obj.position.y += Math.sin(t * speed + floatOffset) * 0.005;
        obj.position.x += Math.cos(t * speed * 0.5 + floatOffset) * 0.003;
        obj.rotation.x += rotSpeed.x;
        obj.rotation.y += rotSpeed.y;
        obj.rotation.z += rotSpeed.z;
      });

      camera.position.x = Math.sin(t * 0.12) * 2;
      camera.position.y = Math.cos(t * 0.08) * 1;
      camera.lookAt(0, 0, 0);

      moonLight.position.x = 8 + Math.sin(t * 0.3) * 2;
      moonLight.position.y = 6 + Math.cos(t * 0.2) * 1.5;
      pinkLight.position.x = Math.sin(t * 0.5) * 8;
      blueLight.position.y = Math.sin(t * 0.4) * 5;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [active, containerRef]);
}

// ─── Birthday Photos ───────────────────────────────────────────────────
// 📸 Replace these paths with actual photos of Sarika in public/birthday/
const BIRTHDAY_PHOTOS = [
  '/birthday/photo1.jpg',
  '/birthday/photo2.JPG',
  '/birthday/photo3.PNG',
];

// ─── Zodiac / Astro facts ──────────────────────────────────────────────
const ASTRO_FACTS = [
  { icon: '🌙', text: 'You always say you love the space...but I know u love me (hehe)' },
  { icon: '⭐', text: 'If I could name a star after you, oh nvm you are already my moon' },
  { icon: '🪐', text: 'My whole universe literally revolves around you, Starika' },
];//..

// ─── Main Component ────────────────────────────────────────────────────
export default function BirthdayCelebration({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const starCanvasRef = useRef<HTMLCanvasElement>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const threeRef = useRef<HTMLDivElement>(null);

  useStarfield(starCanvasRef, visible);
  useConfetti(confettiCanvasRef, visible);
  useThreeScene(threeRef, visible);

  useEffect(() => {
    const totalDuration = 34000;
    const timers = [
      setTimeout(() => setPhase(1), 8000),     // 8s: Main birthday text
      setTimeout(() => setPhase(2), 16000),    // 16s: Photos gallery
      setTimeout(() => setPhase(3), 24000),    // 24s: Astro + closing
      setTimeout(() => {
        setVisible(false);
        setTimeout(onComplete, 700);
      }, totalDuration),
    ];

    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      setProgress(Math.min(((Date.now() - startTime) / totalDuration) * 100, 100));
    }, 50);

    return () => { timers.forEach(clearTimeout); clearInterval(progressInterval); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, overflow: 'hidden' }}
        >
          {/* Deep space background */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 70% 20%, #1a0a3e 0%, #0d0020 35%, #050010 65%, #000005 100%)',
          }} />

          {/* Nebula glow */}
          <motion.div
            animate={{
              background: [
                'radial-gradient(circle at 25% 40%, rgba(192,132,252,0.12) 0%, transparent 45%), radial-gradient(circle at 75% 60%, rgba(255,105,180,0.08) 0%, transparent 40%)',
                'radial-gradient(circle at 75% 30%, rgba(129,212,250,0.10) 0%, transparent 45%), radial-gradient(circle at 25% 70%, rgba(192,132,252,0.10) 0%, transparent 40%)',
                'radial-gradient(circle at 50% 50%, rgba(255,105,180,0.10) 0%, transparent 45%), radial-gradient(circle at 30% 20%, rgba(124,58,237,0.08) 0%, transparent 40%)',
                'radial-gradient(circle at 25% 40%, rgba(192,132,252,0.12) 0%, transparent 45%), radial-gradient(circle at 75% 60%, rgba(255,105,180,0.08) 0%, transparent 40%)',
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute', inset: 0 }}
          />

          {/* Starfield canvas */}
          <canvas ref={starCanvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

          {/* Three.js layer */}
          <div ref={threeRef} style={{ position: 'absolute', inset: 0 }} />

          {/* Confetti canvas */}
          <canvas ref={confettiCanvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

          {/* Content */}
          <div style={{
            position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', height: '100%', padding: '1rem',
            pointerEvents: 'none',
          }}>
            <AnimatePresence mode="wait">
              {/* ═══ Phase 0: Opening — Moon & Stars ═══ */}
              {phase === 0 && (
                <motion.div
                  key="opening"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, opacity: 0, y: -80 }}
                  transition={{ type: 'spring', stiffness: 180, damping: 14 }}
                  style={{ textAlign: 'center' }}
                >
                  <motion.div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginBottom: '0.8rem' }}>
                    {['🌙', '✨', '🎂', '✨', '⭐'].map((e, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.15, type: 'spring' }}
                        style={{ fontSize: '2.5rem' }}
                      >
                        <motion.span
                          animate={{ y: [0, -8, 0], rotate: [0, i % 2 === 0 ? 10 : -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                          style={{ display: 'inline-block' }}
                        >
                          {e}
                        </motion.span>
                      </motion.span>
                    ))}
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    style={{
                      color: '#c4b5fd', fontSize: '1.1rem', fontWeight: 300,
                      letterSpacing: '0.35em', textTransform: 'uppercase',
                      textShadow: '0 0 30px rgba(196,181,253,0.5)',
                    }}
                  >
                    The stars align for someone special...
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 }}
                    style={{
                      color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '0.5rem',
                      fontStyle: 'italic',
                    }}
                  >
                    🌌 a cosmic celebration awaits...
                  </motion.p>
                </motion.div>
              )}

              {/* ═══ Phase 1: Main Birthday Message ═══ */}
              {phase === 1 && (
                <motion.div
                  key="main"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                  style={{ textAlign: 'center', maxWidth: '750px' }}
                >
                  <motion.div
                    initial={{ y: -40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginBottom: '0.5rem', fontSize: '2rem' }}
                  >
                    {'🎉🌙🎊⭐🥳🎁✨'.split('').filter(c => c.trim()).map((emoji, i) => (
                      <motion.span
                        key={i}
                        animate={{ y: [0, -12, 0] }}
                        transition={{ delay: i * 0.12, duration: 0.8, repeat: Infinity, repeatDelay: 2 }}
                      >
                        {emoji}
                      </motion.span>
                    ))}
                  </motion.div>

                  <motion.h1
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 140 }}
                    style={{
                      fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: 800,
                      background: 'linear-gradient(135deg, #c4b5fd, #FFD700, #FF69B4, #81D4FA, #c4b5fd)',
                      backgroundSize: '300% 300%',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      animation: 'gradientShift 3s ease infinite',
                      lineHeight: 1.2, marginBottom: '0.3rem',
                    }}
                  >
                    Happy Birthday
                  </motion.h1>

                  <motion.h2
                    initial={{ x: -80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6, type: 'spring' }}
                    style={{
                      fontSize: 'clamp(2.8rem, 9vw, 5.5rem)', fontWeight: 900,
                      color: '#fff',
                      textShadow: '0 0 40px rgba(196,181,253,0.6), 0 0 80px rgba(129,212,250,0.3), 0 4px 20px rgba(0,0,0,0.5)',
                      letterSpacing: '-0.02em', lineHeight: 1.1,
                    }}
                  >
                    Starika! 💖
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    style={{
                      color: 'rgba(255,255,255,0.75)', fontSize: 'clamp(0.9rem, 2vw, 1.15rem)',
                      marginTop: '1rem', fontWeight: 300, lineHeight: 1.7,
                    }}
                  >
                    You light up the universe brighter than all the stars combined 🌟
                    <br />
                    <span style={{ color: '#c4b5fd' }}>The cosmos celebrate you today ✨</span>
                  </motion.p>
                </motion.div>
              )}

              {/* ═══ Phase 2: Photo Gallery — Enhanced ═══ */}
              {phase === 2 && (
                <motion.div
                  key="photos"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ textAlign: 'center', maxWidth: '900px' }}
                >
                  {/* Section heading */}
                  <motion.p
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      color: '#c4b5fd', fontSize: '0.85rem', letterSpacing: '0.3em',
                      textTransform: 'uppercase', marginBottom: '1.2rem',
                      textShadow: '0 0 20px rgba(196,181,253,0.4)',
                    }}
                  >
                    ✦ Memories written in the stars ✦
                  </motion.p>

                  {/* Photo cards */}
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 100 }}
                    style={{
                      display: 'flex', justifyContent: 'center', gap: 'clamp(0.8rem, 2vw, 1.5rem)',
                      marginBottom: '1.5rem', flexWrap: 'wrap', perspective: '1000px',
                    }}
                  >
                    {BIRTHDAY_PHOTOS.map((photo, i) => (
                      <motion.div
                        key={i}
                        initial={{ rotate: (i - 1) * 12, y: 80, opacity: 0, scale: 0.7 }}
                        animate={{ rotate: (i - 1) * 4, y: 0, opacity: 1, scale: 1 }}
                        transition={{ delay: 0.15 + i * 0.25, type: 'spring', stiffness: 100, damping: 12 }}
                        style={{ position: 'relative' }}
                      >
                        {/* Glow behind photo */}
                        <motion.div
                          animate={{
                            boxShadow: [
                              '0 0 30px rgba(196,181,253,0.4), 0 0 60px rgba(192,132,252,0.2)',
                              '0 0 40px rgba(255,105,180,0.4), 0 0 80px rgba(129,212,250,0.2)',
                              '0 0 30px rgba(196,181,253,0.4), 0 0 60px rgba(192,132,252,0.2)',
                            ],
                          }}
                          transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                          style={{
                            width: 'clamp(120px, 22vw, 180px)',
                            height: 'clamp(160px, 28vw, 230px)',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            border: '3px solid rgba(196,181,253,0.4)',
                            background: '#0d0020',
                            position: 'relative',
                          }}
                        >
                          <img
                            src={photo}
                            alt={`Starika memory ${i + 1}`}
                            style={{
                              width: '100%', height: '100%',
                              objectFit: 'cover', display: 'block',
                            }}
                          />

                          {/* Shimmering overlay */}
                          <motion.div
                            animate={{ opacity: [0, 0.15, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.7 }}
                            style={{
                              position: 'absolute', inset: 0,
                              background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                              pointerEvents: 'none',
                            }}
                          />
                        </motion.div>

                        {/* Decorative star under each photo */}
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                          style={{
                            position: 'absolute', bottom: '-8px', right: '-8px',
                            fontSize: '1.2rem',
                          }}
                        >
                          {['⭐', '🌙', '✨'][i]}
                        </motion.div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Love message */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    style={{
                      fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', fontWeight: 600,
                      background: 'linear-gradient(90deg, #c4b5fd, #FFD700, #FF69B4)',
                      backgroundSize: '200% 200%',
                      animation: 'gradientShift 3s ease infinite',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Every moment with you is stardust and magic 💫
                  </motion.p>
                </motion.div>
              )}

              {/* ═══ Phase 3: Astro + Closing ═══ */}
              {phase === 3 && (
                <motion.div
                  key="closing"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  transition={{ type: 'spring', stiffness: 120 }}
                  style={{ textAlign: 'center', maxWidth: '600px' }}
                >
                  {/* Zodiac cards */}
                  <motion.div
                    style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}
                  >
                    {ASTRO_FACTS.map((fact, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: i * 0.2, type: 'spring' }}
                        style={{
                          background: 'rgba(196,181,253,0.08)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(196,181,253,0.2)',
                          borderRadius: '12px',
                          padding: '0.6rem 1rem',
                          minWidth: '140px',
                          maxWidth: '180px',
                        }}
                      >
                        <div style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>{fact.icon}</div>
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem', lineHeight: 1.4 }}>{fact.text}</div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Heart pulse */}
                  <motion.div
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{ fontSize: '3.5rem', marginBottom: '0.8rem' }}
                  >
                    💖
                  </motion.div>

                  <motion.h2
                    style={{
                      fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)', fontWeight: 700,
                      color: '#fff',
                      textShadow: '0 0 30px rgba(196,181,253,0.5)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    To the moon and back, Starika! 🌙
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{
                      color: 'rgba(196,181,253,0.8)', fontSize: '1rem', fontWeight: 300,
                      fontStyle: 'italic',
                    }}
                  >
                    Have the most stellar birthday ever ✨
                    <br />
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                      — With all my love 🥰
                    </span>
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
            background: 'rgba(255,255,255,0.05)', zIndex: 20,
          }}>
            <motion.div style={{
              height: '100%', width: `${progress}%`,
              background: 'linear-gradient(90deg, #7c3aed, #c4b5fd, #FFD700, #FF69B4)',
              borderRadius: '0 2px 2px 0',
            }} />
          </div>

          {/* Skip button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            onClick={() => { setVisible(false); setTimeout(onComplete, 700); }}
            style={{
              position: 'absolute', bottom: '1.5rem', right: '1.5rem', zIndex: 20,
              background: 'rgba(196,181,253,0.1)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(196,181,253,0.2)', color: 'rgba(196,181,253,0.6)',
              padding: '0.5rem 1.2rem', borderRadius: '9999px', fontSize: '0.8rem',
              cursor: 'pointer', transition: 'all 0.3s', pointerEvents: 'auto',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(196,181,253,0.2)'; e.currentTarget.style.color = '#c4b5fd'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(196,181,253,0.1)'; e.currentTarget.style.color = 'rgba(196,181,253,0.6)'; }}
          >
            Skip →
          </motion.button>

          <style jsx global>{`
            @keyframes gradientShift {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
