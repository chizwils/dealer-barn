'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const HeroBg3D = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 gradient-mesh" />
      
      {/* Floating 3D Orbs */}
      <motion.div
        className="absolute w-96 h-96 gradient-orb -top-20 -left-20"
        animate={{
          x: mousePosition.x * 50,
          y: mousePosition.y * 30,
        }}
        transition={{ type: 'spring', damping: 10, stiffness: 100 }}
      />
      
      <motion.div
        className="absolute w-72 h-72 gradient-orb top-1/2 right-0 opacity-70"
        animate={{
          x: mousePosition.x * -30,
          y: mousePosition.y * 40,
        }}
        transition={{ type: 'spring', damping: 15, stiffness: 80 }}
      />
      
      <motion.div
        className="absolute w-64 h-64 gradient-orb bottom-0 left-1/3 opacity-50"
        animate={{
          x: mousePosition.x * 40,
          y: mousePosition.y * -25,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 60 }}
      />

      {/* Geometric Shapes */}
      <motion.div
        className="absolute top-20 right-20 w-32 h-32"
        animate={{
          rotate: mousePosition.x * 45,
          scale: 1 + mousePosition.y * 0.1,
        }}
        transition={{ type: 'spring', damping: 10, stiffness: 100 }}
      >
        <div className="w-full h-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 rounded-3xl shadow-2xl transform rotate-12" />
      </motion.div>

      <motion.div
        className="absolute bottom-40 left-10 w-24 h-24"
        animate={{
          rotate: mousePosition.x * -30,
          y: mousePosition.y * 20,
        }}
        transition={{ type: 'spring', damping: 15, stiffness: 80 }}
      >
        <div className="w-full h-full bg-gradient-to-br from-pink-500/20 to-blue-500/20 backdrop-blur-sm border border-white/20 rounded-full shadow-2xl" />
      </motion.div>

      {/* Floating Elements */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/40 rounded-full"
          style={{
            left: `${20 + i * 10}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.2,
          }}
        />
      ))}

      {/* Premium Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(102, 126, 234, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(102, 126, 234, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>
    </div>
  );
};

export default HeroBg3D;