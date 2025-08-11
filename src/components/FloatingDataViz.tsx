'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

const FloatingDataViz = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const parallaxX = useTransform(mouseX, [-500, 500], [-50, 50]);
  const parallaxY = useTransform(mouseY, [-400, 400], [-30, 30]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Floating Mini Chart 1 */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-20 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-3"
        style={{
          x: parallaxX,
          y: parallaxY,
        }}
        animate={{
          y: [0, -10, 0],
          rotate: [0, 1, 0, -1, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="flex items-end justify-between h-full gap-1">
          {[40, 60, 30, 80, 50].map((height, i) => (
            <motion.div
              key={i}
              className="bg-gradient-to-t from-blue-400 to-purple-500 rounded-sm flex-1"
              initial={{ height: 0 }}
              animate={{
                height: `${height}%`,
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                height: { delay: i * 0.1, duration: 1 },
                opacity: { duration: 2, repeat: Infinity, delay: i * 0.2 },
              }}
            />
          ))}
        </div>
        <motion.div
          className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-xs font-bold text-white"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          +23%
        </motion.div>
      </motion.div>

      {/* Floating Metrics Card */}
      <motion.div
        className="absolute top-32 right-16 w-40 h-24 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4"
        style={{
          x: useTransform(parallaxX, (x) => x * -0.5),
          y: useTransform(parallaxY, (y) => y * -0.3),
        }}
        animate={{
          y: [0, 8, 0],
          rotate: [0, -0.5, 0, 0.5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <motion.div
          className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            backgroundSize: '200% 200%',
          }}
        >
          2.4M
        </motion.div>
        <div className="text-xs text-white/70">Cars Processed</div>
        <motion.div
          className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"
          animate={{
            scaleX: [0.3, 1, 0.3],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
      </motion.div>

      {/* Floating Network Nodes */}
      <motion.div
        className="absolute bottom-32 left-20 w-36 h-36"
        style={{
          x: parallaxX,
          y: useTransform(parallaxY, (y) => y * 0.7),
        }}
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {/* Center node */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Orbiting nodes */}
        {[0, 72, 144, 216, 288].map((angle, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
            style={{
              left: `${50 + 40 * Math.cos((angle * Math.PI) / 180)}%`,
              top: `${50 + 40 * Math.sin((angle * Math.PI) / 180)}%`,
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.4, 0.9, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full">
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <motion.line
              key={i}
              x1="50%"
              y1="50%"
              x2={`${50 + 40 * Math.cos((angle * Math.PI) / 180)}%`}
              y2={`${50 + 40 * Math.sin((angle * Math.PI) / 180)}%`}
              stroke="rgba(139, 92, 246, 0.3)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{
                pathLength: [0, 1, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </svg>
      </motion.div>

      {/* Floating Progress Ring */}
      <motion.div
        className="absolute bottom-20 right-24 w-20 h-20"
        style={{
          x: useTransform(parallaxX, (x) => x * -0.3),
          y: useTransform(parallaxY, (y) => y * -0.4),
        }}
        animate={{
          y: [0, -12, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="3"
          />
          <motion.circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{
              pathLength: [0, 0.85, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              strokeDasharray: 220,
              strokeDashoffset: 220,
            }}
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
        </svg>
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          85%
        </motion.div>
      </motion.div>

      {/* Floating Code Snippet */}
      <motion.div
        className="absolute top-1/2 left-8 w-48 h-32 bg-gray-900/90 backdrop-blur-xl rounded-lg border border-gray-700/50 p-3 font-mono text-xs"
        style={{
          x: parallaxX,
          y: useTransform(parallaxY, (y) => y * 0.5),
        }}
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <motion.div
          className="text-green-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            times: [0, 0.1, 0.9, 1],
          }}
        >
          {/* Auto-sync inventory */}
          {`// Auto-sync inventory`}
        </motion.div>
        <motion.div
          className="text-blue-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.5,
            times: [0, 0.1, 0.9, 1],
          }}
        >
          updateInventory({'{'}
        </motion.div>
        <motion.div
          className="text-yellow-300 ml-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 1,
            times: [0, 0.1, 0.9, 1],
          }}
        >
          status: &apos;available&apos;
        </motion.div>
        <motion.div
          className="text-blue-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 1.5,
            times: [0, 0.1, 0.9, 1],
          }}
        >
          {'});'}
        </motion.div>

        {/* Typing cursor */}
        <motion.div
          className="inline-block w-2 h-4 bg-white ml-1"
          animate={{
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
        />
      </motion.div>

      {/* Floating Success Toast */}
      <motion.div
        className="absolute top-16 right-32 w-56 h-16 bg-green-500/90 backdrop-blur-xl rounded-lg border border-green-400/30 p-3 flex items-center gap-3"
        style={{
          x: useTransform(parallaxX, (x) => x * -0.2),
          y: useTransform(parallaxY, (y) => y * -0.1),
        }}
        initial={{ x: 300, opacity: 0 }}
        animate={{
          x: [300, 0, 0, 300],
          opacity: [0, 1, 1, 0],
          y: [0, -5, 0],
        }}
        transition={{
          x: { duration: 4, times: [0, 0.2, 0.8, 1] },
          opacity: { duration: 4, times: [0, 0.2, 0.8, 1] },
          y: { duration: 2, repeat: Infinity },
          repeat: Infinity,
          repeatDelay: 3,
        }}
      >
        <motion.div
          className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-green-500 font-bold"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1, repeat: Infinity },
          }}
        >
          ✓
        </motion.div>
        <div>
          <div className="text-white font-medium text-sm">Inventory Synced</div>
          <div className="text-green-100 text-xs">247 vehicles updated</div>
        </div>
      </motion.div>
    </div>
  );
};

export default FloatingDataViz;