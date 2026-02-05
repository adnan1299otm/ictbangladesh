
import React, { useEffect, useRef } from 'react';
import { Theme } from '@/types';

interface FluidBackgroundProps {
  theme: Theme;
}

const FluidBackground: React.FC<FluidBackgroundProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, lastSpawn: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    let particles: Particle[] = [];
    const isDark = theme === Theme.DARK;
    
    // Performance profile based on screen size
    const screenFactor = Math.min(w * h / (1920 * 1080), 1.2);
    const MAX_PARTICLES = Math.floor((isDark ? 600 : 400) * screenFactor);
    
    let animationFrameId: number;

    const colors = isDark 
      ? [
          { r: 0, g: 166, b: 81 },   // ICT Green
          { r: 237, g: 28, b: 36 },  // BD Red
          { r: 255, g: 255, b: 255 },// Tech White
          { r: 0, g: 255, b: 200 }   // Neon Teal
        ] 
      : [
          { r: 0, g: 130, b: 60 },   // Deep Green
          { r: 200, g: 20, b: 40 },  // Deep Red
          { r: 0, g: 80, b: 200 },   // Azure
          { r: 120, g: 120, b: 130 } // Muted Slate
        ];

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      maxSize: number;
      color: { r: number, g: number, b: number };
      life: number;
      maxLife: number;
      friction: number;

      constructor(x: number, y: number, mvx: number, mvy: number) {
        this.x = x;
        this.y = y;
        // Dampen velocity for fluid effect
        this.vx = mvx * 0.15 + (Math.random() - 0.5) * 1.8;
        this.vy = mvy * 0.15 + (Math.random() - 0.5) * 1.8;
        this.maxSize = isDark ? (Math.random() * 20 + 6) : (Math.random() * 14 + 4);
        this.size = 2.0; 
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.maxLife = Math.random() * 80 + 50;
        this.life = this.maxLife;
        this.friction = 0.96;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.size += (this.maxSize - this.size) * 0.08;
        this.life--;
      }

      draw() {
        if (!ctx) return;
        const progress = this.life / this.maxLife;
        // Smooth sine fade-in/out
        const alpha = Math.sin(progress * Math.PI) * (isDark ? 0.25 : 0.35);
        
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0, 
          this.x, this.y, this.size
        );
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha})`);
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const spawnParticles = (clientX: number, clientY: number) => {
      const now = Date.now();
      const dx = clientX - mouseRef.current.x;
      const dy = clientY - mouseRef.current.y;
      
      mouseRef.current.x = clientX;
      mouseRef.current.y = clientY;

      // Throttle spawn rate to maintain consistency and performance
      if (now - mouseRef.current.lastSpawn > 16) {
        const speed = Math.sqrt(dx * dx + dy * dy);
        const spawnCount = Math.min(Math.floor(speed / 3) + 1, 6);
        
        for (let i = 0; i < spawnCount; i++) {
          if (particles.length < MAX_PARTICLES) {
            particles.push(new Particle(clientX, clientY, dx, dy));
          }
        }
        mouseRef.current.lastSpawn = now;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      spawnParticles(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        spawnParticles(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchMove, { passive: true });
    window.addEventListener('resize', handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      
      // Better blending for a "glow" effect in dark mode
      ctx.globalCompositeOperation = isDark ? 'screen' : 'multiply';
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update();
        p.draw();
      }
      
      // Efficient filtering
      if (particles.length > 0) {
        particles = particles.filter(p => p.life > 0);
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas 
      id="fluid" 
      ref={canvasRef} 
      style={{ 
        filter: theme === Theme.DARK ? 'blur(1px)' : 'blur(2px) opacity(0.7)',
        pointerEvents: 'none',
        position: 'fixed',
        inset: 0,
        zIndex: 1
      }} 
    />
  );
};

export default FluidBackground;
