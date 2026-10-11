"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export default function ParticleOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let mouseX = 0;
    let mouseY = 0;
    let isMouseMoving = false;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Create particles
    const createParticle = (x: number, y: number, boost = 1): Particle => {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 0.5 + 0.2) * boost;
      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        life: 0,
        maxLife: Math.random() * 120 + 60,
      };
    };

    // Initialize particles
    const initParticles = () => {
      particles = [];
      for (let i = 0; i < 80; i++) {
        particles.push(
          createParticle(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            0.5
          )
        );
      }
    };
    initParticles();

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMouseMoving = true;

      // Create particles on mouse move
      if (Math.random() < 0.3) {
        particles.push(createParticle(mouseX, mouseY, 2));
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles = particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        // Fade out at end of life
        const lifeFactor = 1 - p.life / p.maxLife;
        const currentOpacity = p.opacity * lifeFactor;

        // Mouse interaction
        if (isMouseMoving) {
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) / 150;
            p.vx += (dx / dist) * force * 0.1;
            p.vy += (dy / dist) * force * 0.1;
          }
        }

        // Damping
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${currentOpacity})`;
        ctx.fill();

        // Draw glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        gradient.addColorStop(0, `rgba(59, 130, 246, ${currentOpacity * 0.4})`);
        gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
        ctx.fillStyle = gradient;
        ctx.fill();

        return p.life < p.maxLife;
      });

      // Connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const opacity = (1 - dist / 120) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Add new particles if below threshold
      if (particles.length < 100 && Math.random() < 0.05) {
        particles.push(
          createParticle(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            0.5
          )
        );
      }

      isMouseMoving = false;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", setCanvasSize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 4,
        mixBlendMode: "screen",
        opacity: 0.6,
      }}
    />
  );
}
