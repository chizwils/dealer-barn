'use client';

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

interface AnimatedIconProps {
  type: 'inventory' | 'automation' | 'analytics' | 'management';
  isHovered: boolean;
}

const AnimatedIcon = ({ type, isHovered }: AnimatedIconProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const iconRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);

  const springConfig = { stiffness: 300, damping: 30 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!iconRef.current) return;
      const rect = iconRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      setMousePosition({
        x: e.clientX - centerX,
        y: e.clientY - centerY
      });

      x.set(e.clientX - centerX);
      y.set(e.clientY - centerY);
    };

    if (isHovered) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      x.set(0);
      y.set(0);
    };
  }, [isHovered, x, y]);

  const iconVariants = {
    initial: { scale: 1, rotateZ: 0 },
    hover: { 
      scale: 1.1, 
      rotateZ: [0, -5, 5, 0],
      transition: { 
        rotateZ: { duration: 0.6, repeat: Infinity, repeatType: 'reverse' as const },
        scale: { duration: 0.3 }
      }
    }
  };

  const renderIcon = () => {
    switch (type) {
      case 'inventory':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="inventoryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#764ba2" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Car silhouettes with stagger animation */}
            {[0, 1, 2].map((i) => (
              <motion.g 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={isHovered ? { 
                  opacity: [0.3, 1, 0.3], 
                  y: [10, 0, 10],
                  scale: [0.9, 1.1, 0.9]
                } : { opacity: 0.7, y: 0, scale: 1 }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  delay: i * 0.3,
                  ease: 'easeInOut'
                }}
              >
                <rect 
                  x={15 + i * 25} 
                  y={30 + i * 5} 
                  width="20" 
                  height="12" 
                  rx="6" 
                  fill="url(#inventoryGrad)"
                  filter="url(#glow)"
                />
                <circle cx={20 + i * 25} cy={45 + i * 5} r="3" fill="url(#inventoryGrad)" />
                <circle cx={30 + i * 25} cy={45 + i * 5} r="3" fill="url(#inventoryGrad)" />
              </motion.g>
            ))}

            {/* Floating data points */}
            {[...Array(8)].map((_, i) => (
              <motion.circle
                key={i}
                cx={20 + (i % 4) * 20}
                cy={60 + Math.floor(i / 4) * 15}
                r="2"
                fill="url(#inventoryGrad)"
                initial={{ opacity: 0, scale: 0 }}
                animate={isHovered ? {
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                } : { opacity: 0.3, scale: 1 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </svg>
        );

      case 'automation':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="autoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f093fb" />
                <stop offset="100%" stopColor="#f5576c" />
              </linearGradient>
              <filter id="pulse">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Central automation hub */}
            <motion.circle
              cx="50"
              cy="50"
              r="15"
              fill="url(#autoGrad)"
              filter="url(#pulse)"
              animate={isHovered ? {
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              } : { scale: 1, opacity: 0.8 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />

            {/* Rotating gears */}
            {[0, 120, 240].map((angle, i) => (
              <motion.g
                key={i}
                style={{ originX: 50, originY: 50 }}
                animate={{
                  rotate: isHovered ? [0, 360] : 0
                }}
                transition={{ 
                  duration: 3 + i, 
                  repeat: Infinity, 
                  ease: 'linear' 
                }}
              >
                <motion.circle
                  cx={50 + 25 * Math.cos((angle * Math.PI) / 180)}
                  cy={50 + 25 * Math.sin((angle * Math.PI) / 180)}
                  r="8"
                  fill="none"
                  stroke="url(#autoGrad)"
                  strokeWidth="3"
                  opacity="0.6"
                />
                {/* Gear teeth */}
                {[0, 90, 180, 270].map((toothAngle) => (
                  <motion.rect
                    key={toothAngle}
                    x={50 + 25 * Math.cos((angle * Math.PI) / 180) + 6 * Math.cos(((angle + toothAngle) * Math.PI) / 180)}
                    y={50 + 25 * Math.sin((angle * Math.PI) / 180) + 6 * Math.sin(((angle + toothAngle) * Math.PI) / 180)}
                    width="2"
                    height="4"
                    fill="url(#autoGrad)"
                    style={{ 
                      transformOrigin: `${50 + 25 * Math.cos((angle * Math.PI) / 180)}px ${50 + 25 * Math.sin((angle * Math.PI) / 180)}px`,
                      transform: `rotate(${angle + toothAngle}deg)`
                    }}
                  />
                ))}
              </motion.g>
            ))}

            {/* Energy pulses */}
            {[0, 1, 2].map((i) => (
              <motion.circle
                key={i}
                cx="50"
                cy="50"
                r="0"
                fill="none"
                stroke="url(#autoGrad)"
                strokeWidth="2"
                opacity="0"
                animate={isHovered ? {
                  r: [0, 40],
                  opacity: [0.8, 0],
                  strokeWidth: [3, 1]
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.7,
                  ease: 'easeOut'
                }}
              />
            ))}
          </svg>
        );

      case 'analytics':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="analyticsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4facfe" />
                <stop offset="100%" stopColor="#00f2fe" />
              </linearGradient>
            </defs>

            {/* Animated chart bars */}
            {[20, 40, 30, 60, 45].map((height, i) => (
              <motion.rect
                key={i}
                x={15 + i * 14}
                y={70 - height}
                width="10"
                height={height}
                fill="url(#analyticsGrad)"
                rx="2"
                initial={{ height: 0, y: 70 }}
                animate={isHovered ? {
                  height: [0, height, height * 1.2, height],
                  y: [70, 70 - height, 70 - height * 1.2, 70 - height]
                } : { height, y: 70 - height }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeInOut'
                }}
              />
            ))}

            {/* Floating data points */}
            <motion.circle
              cx="80"
              cy="30"
              r="3"
              fill="url(#analyticsGrad)"
              animate={isHovered ? {
                scale: [1, 1.5, 1],
                opacity: [0.6, 1, 0.6]
              } : { scale: 1, opacity: 0.7 }}
              transition={{ duration: 1, repeat: Infinity }}
            />

            {/* Trend line */}
            <motion.path
              d="M15,60 Q35,40 50,45 T85,25"
              fill="none"
              stroke="url(#analyticsGrad)"
              strokeWidth="2"
              opacity="0.8"
              initial={{ pathLength: 0 }}
              animate={isHovered ? { pathLength: [0, 1, 0] } : { pathLength: 0.7 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </svg>
        );

      case 'management':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="mgmtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a8edea" />
                <stop offset="100%" stopColor="#fed6e3" />
              </linearGradient>
            </defs>

            {/* Central node */}
            <motion.circle
              cx="50"
              cy="50"
              r="8"
              fill="url(#mgmtGrad)"
              animate={isHovered ? {
                scale: [1, 1.3, 1],
                opacity: [0.8, 1, 0.8]
              } : { scale: 1, opacity: 0.9 }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />

            {/* Connected nodes */}
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <motion.g key={i}>
                <motion.line
                  x1="50"
                  y1="50"
                  x2={50 + 30 * Math.cos((angle * Math.PI) / 180)}
                  y2={50 + 30 * Math.sin((angle * Math.PI) / 180)}
                  stroke="url(#mgmtGrad)"
                  strokeWidth="2"
                  opacity="0.6"
                  initial={{ pathLength: 0 }}
                  animate={isHovered ? {
                    pathLength: [0, 1, 0],
                    opacity: [0.3, 0.8, 0.3]
                  } : { pathLength: 0.7, opacity: 0.5 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut'
                  }}
                />
                <motion.circle
                  cx={50 + 30 * Math.cos((angle * Math.PI) / 180)}
                  cy={50 + 30 * Math.sin((angle * Math.PI) / 180)}
                  r="5"
                  fill="url(#mgmtGrad)"
                  animate={isHovered ? {
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0.6, 1, 0.6]
                  } : { scale: 1, opacity: 0.7 }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: 'easeInOut'
                  }}
                />
              </motion.g>
            ))}
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      ref={iconRef}
      className="w-24 h-24 relative"
      variants={iconVariants}
      initial="initial"
      animate={isHovered ? "hover" : "initial"}
      style={{
        perspective: 1000,
        rotateX,
        rotateY,
      }}
    >
      <motion.div
        className="w-full h-full relative"
        style={{
          x: springX,
          y: springY,
        }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full blur-xl opacity-30"
          style={{
            background: type === 'inventory' ? '#667eea' : 
                       type === 'automation' ? '#f093fb' :
                       type === 'analytics' ? '#4facfe' : '#a8edea'
          }}
          animate={isHovered ? {
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3]
          } : { scale: 1, opacity: 0.2 }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Icon container */}
        <div className="relative z-10 w-full h-full">
          {renderIcon()}
        </div>

        {/* Floating particles around icon */}
        {isHovered && [...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: type === 'inventory' ? '#667eea' : 
                         type === 'automation' ? '#f093fb' :
                         type === 'analytics' ? '#4facfe' : '#a8edea',
              left: `${50 + 40 * Math.cos((i * 60 * Math.PI) / 180)}%`,
              top: `${50 + 40 * Math.sin((i * 60 * Math.PI) / 180)}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 0.8, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut'
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default AnimatedIcon;