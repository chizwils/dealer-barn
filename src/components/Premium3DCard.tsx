'use client';

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import AnimatedIcon from './AnimatedIcon';

interface Premium3DCardProps {
  title: string;
  description: string;
  iconType: 'inventory' | 'automation' | 'analytics' | 'management';
  index: number;
  gradient: string;
  features: string[];
}

const Premium3DCard = ({ title, description, iconType, gradient, features }: Premium3DCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-300, 300], [20, -20]);
  const rotateY = useTransform(x, [-300, 300], [-20, 20]);
  
  const springConfig = { stiffness: 300, damping: 30 };
  const springX = useSpring(rotateY, springConfig);
  const springY = useSpring(rotateX, springConfig);

  // Pre-define transforms to avoid conditional hook calls
  const hoverRotateX = useTransform(y, [-150, 150], [10, -10]);
  const hoverRotateY = useTransform(x, [-150, 150], [-10, 10]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current || !isHovered) return;

      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      setMousePosition({ x: mouseX, y: mouseY });
      x.set(mouseX);
      y.set(mouseY);
    };

    if (isHovered) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (!isHovered) {
        x.set(0);
        y.set(0);
      }
    };
  }, [isHovered, x, y]);


  return (
    <motion.div
      ref={cardRef}
      className="relative group cursor-pointer"
      initial={{ scale: 1, z: 0 }}
      whileHover={{ scale: 1.05, z: 100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        perspective: 1000,
        rotateX: springY,
        rotateY: springX,
      }}
    >
      {/* Main Card */}
      <motion.div
        className="relative p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/20 overflow-hidden"
        style={{
          background: isHovered 
            ? `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)`
            : `linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.6) 100%)`,
        }}
      >
        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
          style={{
            background: gradient,
          }}
        />

        {/* Floating particles background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={isHovered ? {
                scale: [0, 1.5, 0],
                opacity: [0, 0.6, 0],
                x: [0, (Math.random() - 0.5) * 100],
                y: [0, (Math.random() - 0.5) * 100],
              } : { scale: 0, opacity: 0 }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.1,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Icon Section */}
          <motion.div
            className="flex justify-center mb-6"
            animate={isHovered ? {
              y: [-5, 0, -5],
            } : { y: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <motion.div
              className="relative"
              style={{
                rotateX: isHovered ? hoverRotateX : 0,
                rotateY: isHovered ? hoverRotateY : 0,
              }}
            >
              {/* Glow ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(from 0deg, ${gradient.split(',')[0]}, ${gradient.split(',')[1] || gradient.split(',')[0]}, ${gradient.split(',')[0]})`,
                  filter: 'blur(10px)',
                }}
                animate={isHovered ? {
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                } : { rotate: 0, scale: 1, opacity: 0.2 }}
                transition={{
                  rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                  opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                }}
              />
              
              {/* Icon container with glass effect */}
              <motion.div
                className="relative w-28 h-28 rounded-full flex items-center justify-center glass-strong"
                whileHover={{
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                }}
              >
                <AnimatedIcon type={iconType} isHovered={isHovered} />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h3
            className={`text-2xl font-bold mb-4 text-center transition-all duration-300 ${
              isHovered 
                ? 'text-transparent bg-clip-text' 
                : 'text-gray-900'
            }`}
            style={{
              background: isHovered ? gradient : undefined,
              WebkitBackgroundClip: isHovered ? 'text' : undefined,
              WebkitTextFillColor: isHovered ? 'transparent' : undefined,
            }}
          >
            {title}
          </motion.h3>

          {/* Description */}
          <motion.p
            className="text-gray-600 text-center mb-6 leading-relaxed"
            animate={isHovered ? {
              color: '#374151'
            } : {
              color: '#6b7280'
            }}
          >
            {description}
          </motion.p>

          {/* Feature list with stagger animation */}
          <motion.div className="space-y-3">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 group/item"
                initial={{ opacity: 0, x: -20 }}
                animate={isHovered ? { 
                  opacity: 1, 
                  x: 0,
                  transition: { delay: i * 0.1 }
                } : { opacity: 0.7, x: 0 }}
              >
                <motion.div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: gradient,
                  }}
                  animate={isHovered ? {
                    scale: [1, 1.5, 1],
                    opacity: [0.6, 1, 0.6],
                  } : { scale: 1, opacity: 0.6 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut'
                  }}
                />
                <motion.span 
                  className="text-sm text-gray-700 group-hover/item:text-gray-900 transition-colors"
                  animate={isHovered ? {
                    x: [0, 5, 0]
                  } : { x: 0 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: 'easeInOut'
                  }}
                >
                  {feature}
                </motion.span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Magnetic corner indicators */}
        {[
          { position: 'top-4 left-4', delay: 0 },
          { position: 'top-4 right-4', delay: 0.5 },
          { position: 'bottom-4 left-4', delay: 1 },
          { position: 'bottom-4 right-4', delay: 1.5 }
        ].map((corner, i) => (
          <motion.div
            key={i}
            className={`absolute ${corner.position} w-3 h-3 rounded-full opacity-0 group-hover:opacity-60`}
            style={{
              background: gradient,
              filter: 'blur(1px)',
            }}
            animate={isHovered ? {
              scale: [0, 1, 0.8],
              opacity: [0, 0.8, 0.4],
              rotate: [0, 180, 360],
            } : { scale: 0, opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: corner.delay,
              ease: 'easeInOut'
            }}
          />
        ))}

        {/* Holographic edge effect */}
        <motion.div
          className="absolute inset-0 rounded-3xl border-2 border-transparent opacity-0 group-hover:opacity-100"
          style={{
            background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.8) 50%, transparent 70%)`,
            backgroundSize: '200% 200%',
          }}
          animate={isHovered ? {
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear'
          }}
        />

        {/* Interactive light ray following mouse */}
        {isHovered && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              left: mousePosition.x + 200,
              top: mousePosition.y + 200,
              width: '200px',
              height: '200px',
              background: `radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)`,
              transform: 'translate(-50%, -50%)',
              filter: 'blur(20px)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        )}
      </motion.div>

      {/* Floating shadow */}
      <motion.div
        className="absolute inset-0 -z-10 rounded-3xl"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%)',
          filter: 'blur(20px)',
        }}
        animate={isHovered ? {
          scale: 1.1,
          opacity: 0.3,
          y: 20,
        } : {
          scale: 1,
          opacity: 0.1,
          y: 10,
        }}
      />
    </motion.div>
  );
};

export default Premium3DCard;