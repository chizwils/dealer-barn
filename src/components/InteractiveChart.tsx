'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';

const InteractiveChart = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const data = [
    { period: 'Q1', value: 85, growth: '+12%', color: 'from-blue-500 to-blue-600' },
    { period: 'Q2', value: 92, growth: '+18%', color: 'from-purple-500 to-purple-600' },
    { period: 'Q3', value: 78, growth: '+8%', color: 'from-pink-500 to-pink-600' },
    { period: 'Q4', value: 96, growth: '+23%', color: 'from-indigo-500 to-indigo-600' },
  ];

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div ref={ref} className="relative p-8 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8"
      >
        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Revenue Growth
        </h3>
        <p className="text-gray-600 mt-2">Quarterly performance metrics</p>
      </motion.div>

      {/* Chart */}
      <div className="relative h-64 flex items-end justify-between gap-4 mb-6">
        {data.map((item, index) => (
          <motion.div
            key={item.period}
            className="relative flex-1 flex flex-col items-center cursor-pointer"
            onHoverStart={() => setHoveredBar(index)}
            onHoverEnd={() => setHoveredBar(null)}
            initial={{ opacity: 0, y: 100 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 + index * 0.1, ease: 'easeOut' }}
          >
            {/* Bar */}
            <motion.div
              className={`w-full rounded-t-lg bg-gradient-to-t ${item.color} shadow-lg relative overflow-hidden`}
              initial={{ height: 0 }}
              animate={isInView ? { height: `${(item.value / maxValue) * 200}px` } : {}}
              transition={{ duration: 1, delay: 0.6 + index * 0.1, ease: 'easeOut' }}
              whileHover={{ scale: 1.05 }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ 
                  duration: 2, 
                  delay: 0.8 + index * 0.2,
                  ease: 'easeInOut'
                }}
              />

              {/* Glow effect on hover */}
              {hoveredBar === index && (
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-t ${item.color} opacity-50 blur-sm`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </motion.div>

            {/* Value label */}
            <motion.div
              className={`mt-4 text-center transition-all duration-300 ${
                hoveredBar === index ? 'scale-110' : ''
              }`}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
            >
              <div className="text-sm font-medium text-gray-700">{item.period}</div>
              <div className="text-xs text-gray-500">{item.value}%</div>
            </motion.div>

            {/* Floating growth indicator */}
            {hoveredBar === index && (
              <motion.div
                className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black text-white px-3 py-1 rounded-lg text-sm font-medium shadow-lg"
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                {item.growth}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Animated metrics */}
      <motion.div
        className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <div className="text-center">
          <motion.div
            className="text-2xl font-bold text-green-600"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 1.4, type: 'spring' }}
          >
            +23%
          </motion.div>
          <div className="text-xs text-gray-500">Avg Growth</div>
        </div>
        <div className="text-center">
          <motion.div
            className="text-2xl font-bold text-blue-600"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 1.6, type: 'spring' }}
          >
            $2.4M
          </motion.div>
          <div className="text-xs text-gray-500">Total Revenue</div>
        </div>
        <div className="text-center">
          <motion.div
            className="text-2xl font-bold text-purple-600"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 1.8, type: 'spring' }}
          >
            96%
          </motion.div>
          <div className="text-xs text-gray-500">Peak Quarter</div>
        </div>
      </motion.div>
    </div>
  );
};

export default InteractiveChart;