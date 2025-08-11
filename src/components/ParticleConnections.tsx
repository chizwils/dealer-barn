'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface ParticleConnectionsProps {
  cardCount: number;
}

const ParticleConnections = ({ cardCount }: ParticleConnectionsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    color: string;
    targetCard: number;
  }>>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      const particleCount = Math.min(60, Math.floor((canvas.width * canvas.height) / 8000));
      
      const colors = [
        'rgba(102, 126, 234, 0.8)',
        'rgba(240, 147, 251, 0.8)',
        'rgba(79, 172, 254, 0.8)',
        'rgba(168, 237, 234, 0.8)',
      ];

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.3,
          color: colors[Math.floor(Math.random() * colors.length)],
          targetCard: Math.floor(Math.random() * cardCount),
        });
      }
    };

    initParticles();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate card positions (approximate grid layout)
      const cardPositions: { x: number; y: number }[] = [];
      const cardsPerRow = Math.min(cardCount, 2);
      const cardWidth = canvas.width / cardsPerRow;
      const cardHeight = canvas.height / Math.ceil(cardCount / cardsPerRow);

      for (let i = 0; i < cardCount; i++) {
        const row = Math.floor(i / cardsPerRow);
        const col = i % cardsPerRow;
        cardPositions.push({
          x: col * cardWidth + cardWidth / 2,
          y: row * cardHeight + cardHeight / 2,
        });
      }

      particlesRef.current.forEach((particle, index) => {
        // Apply gentle attraction to target card
        const targetPos = cardPositions[particle.targetCard];
        if (targetPos) {
          const dx = targetPos.x - particle.x;
          const dy = targetPos.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          const attraction = 0.0001;
          particle.vx += (dx / distance) * attraction;
          particle.vy += (dy / distance) * attraction;
          
          // Add some randomness
          particle.vx += (Math.random() - 0.5) * 0.01;
          particle.vy += (Math.random() - 0.5) * 0.01;
          
          // Limit velocity
          const maxVel = 1;
          const vel = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
          if (vel > maxVel) {
            particle.vx = (particle.vx / vel) * maxVel;
            particle.vy = (particle.vy / vel) * maxVel;
          }
        }

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -0.8;
          particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -0.8;
          particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        }

        // Draw particle with glow
        ctx.beginPath();
        ctx.globalAlpha = particle.opacity;
        
        // Outer glow
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 4
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core particle
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Connect particles within same target card
        particlesRef.current.forEach((otherParticle, otherIndex) => {
          if (index !== otherIndex && particle.targetCard === otherParticle.targetCard) {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              ctx.beginPath();
              ctx.globalAlpha = ((100 - distance) / 100) * 0.2;
              ctx.strokeStyle = particle.color;
              ctx.lineWidth = 1;
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.stroke();
            }
          }
        });

        // Connect between different card groups occasionally
        if (Math.random() < 0.05) {
          const nearbyDifferentCard = particlesRef.current.find(p => {
            const dx = p.x - particle.x;
            const dy = p.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return p.targetCard !== particle.targetCard && distance < 80;
          });

          if (nearbyDifferentCard) {
            ctx.beginPath();
            ctx.globalAlpha = 0.1;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 4]);
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(nearbyDifferentCard.x, nearbyDifferentCard.y);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [cardCount]);

  return (
    <motion.canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      style={{
        mixBlendMode: 'screen',
        filter: 'blur(0.5px)',
      }}
    />
  );
};

export default ParticleConnections;