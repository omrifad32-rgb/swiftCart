import React, { useRef, useEffect } from 'react';

const InteractiveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    const numParticles = 120; // more particles for a nicer network
    
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    let mouse = { x: -1000, y: -1000, radius: 200, lastMoveTime: Date.now() };

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      init();
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      mouse.lastMoveTime = Date.now();
      if ('touches' in e) {
        if (e.touches.length > 0) {
          mouse.x = e.touches[0].clientX;
          mouse.y = e.touches[0].clientY;
        }
      } else {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      }
    };

    window.addEventListener('mousemove', handleMouseMove as any);
    window.addEventListener('touchmove', handleMouseMove as any, { passive: true });
    window.addEventListener('touchstart', handleMouseMove as any, { passive: true });

    const handleMouseOut = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('touchend', handleMouseOut);

    class Particle {
      x: number;
      y: number;
      size: number;
      baseX: number;
      baseY: number;
      density: number;
      vx: number;
      vy: number;
      color: string;

      constructor(x?: number, y?: number) {
        this.x = x || Math.random() * w;
        this.y = y || Math.random() * h;
        this.baseX = this.x;
        this.baseY = this.y;
        this.size = Math.random() * 1.5 + 0.5;
        this.density = (Math.random() * 15) + 1;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
      }

      draw(isLight: boolean) {
        if (!ctx) return;
        ctx.fillStyle = isLight ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }

      update() {
        // normal drifting
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;

        // mouse interaction
        const isStill = Date.now() - mouse.lastMoveTime > 4000;
        
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius && !isStill) {
          let forceDirectionX = dx / distance;
          let forceDirectionY = dy / distance;
          let force = (mouse.radius - distance) / mouse.radius;
          // Subtle attraction instead of repel, pulling them towards the mouse slightly
          // but letting them resist via their base positions
          this.x += forceDirectionX * force * 0.8;
          this.y += forceDirectionY * force * 0.8;
        }
        
        // Always try to return to base positions gently
        if (this.x !== this.baseX) {
          this.x += (this.baseX - this.x) * 0.02;
        }
        if (this.y !== this.baseY) {
          this.y += (this.baseY - this.y) * 0.02;
        }
      }
    }

    function init() {
      particles = [];
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    }

    let animationFrameId: number;
    let resetTimeoutTriggered = false;

    function animate() {
      if (!ctx) return;
      
      const isLight = document.body.classList.contains('light-theme');
      
      // If still for 4 seconds and we haven't triggered reset yet
      const isStill = Date.now() - mouse.lastMoveTime > 4000;
      if (isStill && mouse.x !== -1000 && !resetTimeoutTriggered) {
        resetTimeoutTriggered = true;
        
        // Randomize base positions to make them explode/reset beautifully
        for (let i = 0; i < particles.length; i++) {
           particles[i].baseX = Math.random() * w;
           particles[i].baseY = Math.random() * h;
           particles[i].vx = (Math.random() - 0.5) * 3;
           particles[i].vy = (Math.random() - 0.5) * 3;
        }
        
        // Let it "forget" the mouse momentarily so it floats back naturally
        mouse.x = -1000;
        mouse.y = -1000;
      } else if (!isStill) {
        resetTimeoutTriggered = false;
      }
      
      ctx.clearRect(0, 0, w, h);
      
      // Keep a dark background in dark mode since we removed the inline style
      if (!isLight) {
        ctx.fillStyle = '#050508'; // very dark color
        ctx.fillRect(0, 0, w, h);
        
        // Add subtle radial gradient like we had
        const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h)/1.5);
        gradient.addColorStop(0, '#0a0a0f');
        gradient.addColorStop(1, '#000000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0,0,w,h);
      }

      for (let i = 0; i < particles.length; i++) {
        particles[i].draw(isLight);
        particles[i].update();
      }
      connect(isLight, isStill);
      animationFrameId = requestAnimationFrame(animate);
    }

    function connect(isLight: boolean, isStill: boolean) {
      if (!ctx) return;
      let opacityValue = 1;
      const rgb = isLight ? '0, 0, 0' : '255, 255, 255';
      
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          let dx = particles[a].x - particles[b].x;
          let dy = particles[a].y - particles[b].y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          // Add a dynamic connection to the mouse
          let mouseDx = mouse.x - particles[a].x;
          let mouseDy = mouse.y - particles[a].y;
          let mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);

          if (distance < 150) {
            opacityValue = 1 - (distance / 150);
            
            // Highlight lines near the mouse
            if (mouseDistance < mouse.radius && !isStill) {
                ctx.strokeStyle = `rgba(${rgb}, ${opacityValue * 0.8})`;
                ctx.lineWidth = 1.5;
            } else {
                const baseOpacity = isLight ? 0.08 : 0.15;
                ctx.strokeStyle = `rgba(${rgb}, ${opacityValue * baseOpacity})`;
                ctx.lineWidth = 0.5;
            }
            
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    init();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove as any);
      window.removeEventListener('touchmove', handleMouseMove as any);
      window.removeEventListener('touchstart', handleMouseMove as any);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('touchend', handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-[-1] pointer-events-none"
    />
  );
};

export default InteractiveBackground;
