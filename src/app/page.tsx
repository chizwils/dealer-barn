'use client';

import Logo from '@/components/Logo';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const AnimatedCounter = ({ end, duration = 2 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}</span>;
};

const FloatingCard = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: "easeOut" }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    viewport={{ once: true }}
  >
    {children}
  </motion.div>
);

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [isRoadmapActive, setIsRoadmapActive] = useState(false);
  const [canScrollPast, setCanScrollPast] = useState(false);
  const heroRef = useRef(null);
  const roadmapRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  // Smoother scroll hijacking for roadmap section
  useEffect(() => {
    let isScrolling = false;
    
    const handleWheel = (e: WheelEvent) => {
      if (!isRoadmapActive) return;
      
      const roadmapContent = document.getElementById('roadmap-content');
      if (!roadmapContent) return;
      
      const { scrollTop, scrollHeight, clientHeight } = roadmapContent;
      const isAtTop = scrollTop <= 10;
      const isAtBottom = scrollTop >= scrollHeight - clientHeight - 10;
      
      // More lenient exit conditions
      if (e.deltaY > 0 && isAtBottom && activeStep >= 3) {
        // Scrolling down and at bottom of last step - allow page scroll to continue
        setCanScrollPast(true);
        setIsRoadmapActive(false);
        return;
      }
      
      if (e.deltaY < 0 && isAtTop && activeStep === 0) {
        // Scrolling up and at top of first step - allow page scroll to continue up
        setIsRoadmapActive(false);
        return;
      }
      
      // Prevent default and smooth scroll
      e.preventDefault();
      
      if (!isScrolling) {
        isScrolling = true;
        
        // Smoother scroll with momentum
        const scrollAmount = e.deltaY * 0.8; // Reduce scroll sensitivity
        roadmapContent.scrollTo({
          top: roadmapContent.scrollTop + scrollAmount,
          behavior: 'auto' // Instant for better control
        });
        
        // Throttle scroll events
        setTimeout(() => {
          isScrolling = false;
        }, 16); // ~60fps
      }
    };

    // Observer for when roadmap section enters/exits viewport
    const roadmapObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            setIsRoadmapActive(true);
            setCanScrollPast(false);
          } else if (!entry.isIntersecting && entry.boundingClientRect.top > 0) {
            setIsRoadmapActive(false);
          }
        });
      },
      {
        threshold: [0, 0.3, 0.7, 1],
        rootMargin: '-5% 0px -5% 0px'  // Less aggressive margins
      }
    );

    // Observer for roadmap steps
    const stepObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepIndex = parseInt(entry.target.getAttribute('data-step') || '0');
            setActiveStep(stepIndex);
          }
        });
      },
      {
        root: document.getElementById('roadmap-content'),
        threshold: 0.5,
        rootMargin: '-20% 0px -20% 0px'
      }
    );

    // Set up observers
    if (roadmapRef.current) {
      roadmapObserver.observe(roadmapRef.current);
    }

    const sections = document.querySelectorAll('[data-step]');
    sections.forEach((section) => stepObserver.observe(section));

    // Add wheel event listener
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      roadmapObserver.disconnect();
      stepObserver.disconnect();
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isRoadmapActive, activeStep]);

  return (
    <div className="min-h-screen bg-neutral-50 overflow-x-hidden">
      {/* Animated Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-white/90 backdrop-blur-lg border-b border-gray-100"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-8"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Logo height={32} width={160} />
            <div className="hidden md:flex items-center gap-6 text-sm">
              {['PRODUCTS', 'PRICING', 'BLOG'].map((item, i) => (
                <motion.button
                  key={item}
                  className="text-gray-700 hover:text-gray-900 relative"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  {item}
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-green-600"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>
          <div className="flex items-center gap-4">
            <motion.button 
              className="text-sm text-gray-700 hover:text-gray-900"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              WATCH DEMO
            </motion.button>
            <motion.button 
              className="bg-green-800 hover:bg-green-900 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(34, 197, 94, 0.2)" }}
              whileTap={{ scale: 0.95 }}
            >
              START FOR FREE
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative px-6 pt-32 pb-20 min-h-screen flex items-center bg-white">
        {/* Subtle Background Animation */}
        <motion.div 
          className="absolute inset-0 opacity-5"
          style={{ y }}
        >
          <div className="absolute top-20 left-10 w-72 h-72 bg-gray-200 rounded-full blur-3xl" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-gray-300 rounded-full blur-3xl" />
        </motion.div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-block border border-gray-200 rounded-full px-4 py-2 mb-6"
            >
              <span className="text-sm font-medium text-gray-700">{/* ICON: Sparkle/Star icon */}✨ Limited Beta Launch - Q2 2025</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              className="text-5xl sm:text-6xl font-roc font-medium text-gray-900 mb-6 leading-tight"
            >
              Stop Juggling
              <motion.span
                className="block text-gray-900"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Spreadsheets.
              </motion.span>
              Start Growing Your Dealership.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl leading-relaxed"
            >
              DealerBarn eliminates inventory chaos, automates manual processes, and scales with your business—so you can focus on selling cars, not managing data disasters.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <motion.button 
                className="bg-green-800 hover:bg-green-900 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors relative overflow-hidden"
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(34, 197, 94, 0.2)" }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '0%' }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10">Join 500+ Dealers in Beta</span>
              </motion.button>
              <motion.button 
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-lg font-medium text-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                See 3-Minute Demo
              </motion.button>
            </motion.div>
            
            {/* Animated Stats */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="grid grid-cols-3 gap-8"
            >
              {[
                { value: 90, suffix: '%', label: 'Less Manual Work' },
                { value: 50, suffix: '%', label: 'Faster Processing' },
                { value: 24, suffix: '/7', label: 'Real-time Updates' }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  className="text-center"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    <AnimatedCounter end={stat.value} />
                    <span>{stat.suffix}</span>
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          {/* Interactive Demo Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="flex-1 text-center text-sm text-gray-600">DealerBarn Dashboard</div>
              </div>
              <div className="p-6 h-80">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  className="space-y-4"
                >
                  {/* Animated Chart Bars */}
                  <div className="space-y-2">
                    {[85, 65, 90, 45, 75].map((width, i) => (
                      <motion.div
                        key={i}
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.4 + i * 0.1, duration: 0.6 }}
                      >
                        <div className="w-16 text-xs text-gray-500">Q{i + 1} 2024</div>
                        <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-gray-400 to-gray-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${width}%` }}
                            transition={{ delay: 1.6 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                        <div className="text-xs text-gray-700 w-8">{width}%</div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Floating metrics */}
                  <motion.div
                    className="absolute top-20 right-4 bg-white rounded-lg shadow-lg p-3 border border-gray-100"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 2, duration: 0.6 }}
                  >
                    <div className="text-xs text-gray-500">Revenue Growth</div>
                    <div className="text-lg font-bold text-gray-700">+23%</div>
                  </motion.div>
                  
                  <motion.div
                    className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border border-gray-100"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 2.2, duration: 0.6 }}
                  >
                    <div className="text-xs text-gray-500">Cars Processed</div>
                    <div className="text-lg font-bold text-gray-700">
                      <AnimatedCounter end={247} duration={1.5} />
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
            
            {/* Floating elements */}
            <motion.div
              className="absolute -top-4 -right-4 w-8 h-8 bg-gray-400 rounded-full"
              animate={{ y: [0, -10, 0], rotate: [0, 180, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-4 -left-4 w-6 h-6 bg-gray-300 rounded-full"
              animate={{ x: [0, 10, 0], rotate: [0, -180, -360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
      </section>

      {/* Problem Section - Enhanced with Grid & Dotted Lines */}
      <section className="px-6 py-20 bg-neutral-50 relative overflow-hidden">
        {/* Dotted Grid Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="h-full w-full" style={{
            backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }} />
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-roc font-medium mb-6 text-gray-900">
              Every Day You Don't Automate, You're Losing Money
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Most dealerships lose 15-20 hours per week on manual tasks that should take minutes.
            </p>
          </motion.div>
          
          {/* Enhanced Grid Layout with Dotted Connections */}
          <div className="relative">
            {/* Connecting dotted lines */}
            <div className="hidden lg:block absolute top-1/2 left-1/3 w-1/3 h-px border-t-2 border-dotted border-gray-300 -translate-y-1/2" />
            <div className="hidden lg:block absolute top-1/2 right-1/3 w-1/3 h-px border-t-2 border-dotted border-gray-300 -translate-y-1/2" />
            
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-16">
              {[
                { 
                  stat: '15-20hrs', 
                  description: 'Lost per week on manual tasks',
                  icon: '⏰'
                },
                { 
                  stat: '8+', 
                  description: 'Systems & spreadsheets per dealership',
                  icon: '📊'
                },
                { 
                  stat: '20-30%', 
                  description: 'Profit opportunities missed',
                  icon: '💸'
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.2, duration: 0.8, ease: "easeOut" }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative"
                >
                  {/* Card with dotted border */}
                  <div className="bg-white rounded-2xl p-8 text-center relative border-2 border-dashed border-gray-200 hover:border-gray-300 transition-all duration-300">
                    {/* Animated pulse background */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent rounded-2xl opacity-0"
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    <div className="relative z-10">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ delay: i * 0.2 + 0.3, duration: 0.5, type: "spring" }}
                        className="text-3xl mb-4"
                      >
                        {item.icon}
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: i * 0.2 + 0.5, duration: 0.6 }}
                        className="text-5xl font-bold text-gray-900 mb-4"
                      >
                        {item.stat}
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: i * 0.2 + 0.7, duration: 0.6 }}
                        className="text-gray-600 leading-relaxed"
                      >
                        {item.description}
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Floating dot indicator */}
                  <motion.div
                    className="absolute -top-2 -right-2 w-4 h-4 bg-red-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Bottom section with dotted accent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-4 px-6 py-3 bg-white rounded-full border border-dashed border-gray-300">
              <span className="text-sm text-gray-600">The cost of doing nothing keeps growing</span>
              <motion.div
                className="w-2 h-2 bg-red-400 rounded-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Clean Features Grid with Dotted Lines */}
      <section className="px-6 py-20 bg-white relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-roc font-medium text-gray-900 mb-6">
              Everything You Need. Nothing You Don't.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              DealerBarn replaces 6+ tools with one intelligent platform designed specifically for modern dealerships.
            </p>
          </motion.div>
          
          {/* Features Grid with Dotted Connections */}
          <div className="relative">
            {/* Horizontal dotted lines connecting features */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px border-t-2 border-dotted border-gray-300 -translate-y-1/2" />
            <div className="hidden lg:block absolute top-1/2 left-1/3 w-1/3 h-px border-t-2 border-dotted border-gray-300 -translate-y-1/2" />
            <div className="hidden lg:block absolute top-1/2 right-1/3 w-1/3 h-px border-t-2 border-dotted border-gray-300 -translate-y-1/2" />
            
            <div className="grid lg:grid-cols-4 gap-8 lg:gap-16">
              {[
                {
                  title: 'Smart Inventory Hub',
                  description: 'Track every vehicle and part across all locations in real-time',
                  icon: '🚗'
                },
                {
                  title: 'Automated Workflows',
                  description: 'From acquisition to sale—automate the boring stuff',
                  icon: '⚡'
                },
                {
                  title: 'Predictive Analytics',
                  description: 'Know which cars will sell before they hit the lot',
                  icon: '📊'
                },
                {
                  title: 'Multi-Location Management',
                  description: 'Manage 1 or 100 locations from one dashboard',
                  icon: '🌟'
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.15, duration: 0.7, ease: "easeOut" }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  className="relative text-center group"
                >
                  {/* Dotted circle background */}
                  <div className="absolute inset-0 border-2 border-dashed border-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-150" />
                  
                  {/* Feature content */}
                  <div className="relative z-10">
                    {/* Icon with animated background */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ delay: i * 0.15 + 0.3, duration: 0.6, type: "spring" }}
                      viewport={{ once: true }}
                      className="relative inline-block mb-6"
                    >
                      <div className="w-20 h-20 bg-gray-50 border-2 border-gray-200 rounded-full flex items-center justify-center text-3xl mx-auto group-hover:border-gray-300 transition-colors duration-300">
                        {feature.icon}
                      </div>
                      {/* Pulsing dot indicator */}
                      <motion.div
                        className="absolute -top-1 -right-1 w-3 h-3 bg-gray-400 rounded-full"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                      />
                    </motion.div>
                    
                    {/* Title */}
                    <motion.h3
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: i * 0.15 + 0.5, duration: 0.6 }}
                      viewport={{ once: true }}
                      className="text-xl font-medium text-gray-900 mb-4"
                    >
                      {feature.title}
                    </motion.h3>
                    
                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: i * 0.15 + 0.7, duration: 0.6 }}
                      viewport={{ once: true }}
                      className="text-gray-600 leading-relaxed"
                    >
                      {feature.description}
                    </motion.p>
                  </div>
                  
                  {/* Connection dot (visible on desktop) */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.15 + 0.8, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="hidden lg:block absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-300 border-2 border-white rounded-full shadow-sm -left-2"
                  />
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Bottom connecting element */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="inline-block relative">
              <div className="h-px w-32 bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto mb-4" />
              <div className="text-sm text-gray-500">Integrated Platform</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Simple Benefits Section */}
      <section className="px-6 py-20 bg-neutral-50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-4xl font-roc font-medium text-gray-900 mb-6">
              Join Dealerships Already Making 23% More Profit
            </h2>
            <p className="text-xl text-gray-600">
              See why 500+ dealers are ditching their old systems.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-3xl mx-auto">
            {[
              'Eliminate 90% of manual spreadsheet work',
              'Cut inventory tracking errors to near-zero', 
              'Process vehicles 50% faster',
              'Never lose another sale to poor communication',
              'Scale to new locations in days, not months',
              'Integrate with your existing DMS seamlessly'
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 text-left"
              >
                <div className="text-green-600 text-sm">✓</div>
                <span className="text-gray-700">{benefit}</span>
              </motion.div>
            ))}
          </div>
          
          {/* Simple Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl p-8 border border-gray-200"
          >
            <blockquote className="text-xl italic text-gray-700 mb-4">
              "Finally, a system built by people who actually understand dealerships."
            </blockquote>
            <cite className="text-gray-900 font-medium">— Mike Patterson, Patterson Auto Group</cite>
          </motion.div>
        </div>
      </section>

      {/* Interactive Roadmap with Sticky Navigation */}
      <section className="bg-white relative" id="roadmap" ref={roadmapRef}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center py-20 px-6"
          >
            <h2 className="text-4xl font-roc font-medium text-gray-900 mb-6">
              Your Beta Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're building the future of dealership management, and we want you to be part of the journey.
            </p>
          </motion.div>

          {/* Two-column layout: Sticky nav + Scrollable content */}
          <div className="flex h-screen">
            {/* Left Rail - Sticky Navigation */}
            <div className="w-1/3 px-6">
              <div className="sticky top-24 h-full flex items-center">
                <div className="w-full space-y-2">
                  {[
                    { id: 'beta-onboarding', title: 'Beta Onboarding', date: 'Q2 2025', status: 'active' },
                    { id: 'automation-rollout', title: 'Automation Rollout', date: 'Q3 2025', status: 'upcoming' },
                    { id: 'advanced-analytics', title: 'Advanced Analytics', date: 'Q4 2025', status: 'future' },
                    { id: 'scale-expand', title: 'Scale & Expand', date: 'Q1 2026', status: 'future' }
                  ].map((step, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        viewport={{ once: true }}
                        onClick={() => {
                          setActiveStep(i);
                          const targetElement = document.getElementById(step.id);
                          const rightPanel = document.getElementById('roadmap-content');
                          if (targetElement && rightPanel) {
                            const elementTop = targetElement.offsetTop - rightPanel.offsetTop;
                            rightPanel.scrollTo({
                              top: elementTop,
                              behavior: 'smooth'
                            });
                          }
                        }}
                        className={`w-full text-left p-4 rounded-lg transition-all duration-300 border-l-4 ${
                          activeStep === i 
                            ? 'bg-gray-100 text-gray-900 border-l-gray-400' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-transparent'
                        }`}
                      >
                        <div className="text-sm font-medium mb-1">
                          {step.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {step.date}
                        </div>
                      </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel - Scrollable Content with Independent Scroll */}
            <div className="flex-1 px-6">
              <div 
                id="roadmap-content"
                className="h-screen overflow-y-auto scrollbar-hide"
                style={{
                  scrollBehavior: 'smooth',
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none'
                }}
              >
                <div className="space-y-8 py-8">
                  {/* Beta Onboarding */}
                  <motion.div
                    id="beta-onboarding"
                    data-step="0"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    viewport={{ once: true, margin: "-20%" }}
                    className="min-h-screen flex items-center"
                  >
                    <div className="w-full">
                      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                        <div className="mb-8">
                          <div className="text-gray-500 font-medium text-sm mb-2">Q2 2025</div>
                          <h3 className="text-3xl font-medium text-gray-900 mb-4">Beta Onboarding</h3>
                          <p className="text-xl text-gray-600 leading-relaxed">
                            Get your dealership set up with our core inventory management system and start experiencing the future of dealership operations.
                          </p>
                        </div>
                        
                        <div className="space-y-4">
                          {[
                            'Complete system setup & configuration',
                            'Import your existing inventory data',
                            'Team onboarding & training sessions',
                            'Custom workflow configuration',
                            'Integration with your current DMS',
                            'Performance baseline establishment'
                          ].map((item, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05, duration: 0.4 }}
                              viewport={{ once: true }}
                              className="flex items-center gap-3 py-2"
                            >
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                              <span className="text-gray-700">{item}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Automation Rollout */}
                  <motion.div
                    id="automation-rollout"
                    data-step="1"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    viewport={{ once: true, margin: "-20%" }}
                    className="min-h-screen flex items-center"
                  >
                    <div className="w-full">
                      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                        <div className="mb-8">
                          <div className="text-gray-500 font-medium text-sm mb-2">Q3 2025</div>
                          <h3 className="text-3xl font-medium text-gray-900 mb-4">Automation Rollout</h3>
                          <p className="text-xl text-gray-600 leading-relaxed">
                            Activate automated workflows and eliminate manual processes that have been slowing down your operations.
                          </p>
                        </div>
                        
                        <div className="space-y-4">
                          {[
                            'Automated vehicle intake processes',
                            'Smart pricing optimization',
                            'Workflow automation deployment',
                            'Intelligent task routing',
                            'Automated reporting systems',
                            'Process optimization analysis'
                          ].map((item, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05, duration: 0.4 }}
                              viewport={{ once: true }}
                              className="flex items-center gap-3 py-2"
                            >
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                              <span className="text-gray-700">{item}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Advanced Analytics */}
                  <motion.div
                    id="advanced-analytics"
                    data-step="2"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    viewport={{ once: true, margin: "-20%" }}
                    className="min-h-screen flex items-center"
                  >
                    <div className="w-full">
                      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                        <div className="mb-8">
                          <div className="text-gray-500 font-medium text-sm mb-2">Q4 2025</div>
                          <h3 className="text-3xl font-medium text-gray-900 mb-4">Advanced Analytics</h3>
                          <p className="text-xl text-gray-600 leading-relaxed">
                            Unlock predictive insights and advanced reporting capabilities to make data-driven decisions.
                          </p>
                        </div>
                        
                        <div className="space-y-4">
                          {[
                            'Predictive sales forecasting',
                            'Market trend analysis',
                            'Profit optimization insights',
                            'Customer behavior analytics',
                            'Inventory performance metrics',
                            'Advanced dashboard customization'
                          ].map((item, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05, duration: 0.4 }}
                              viewport={{ once: true }}
                              className="flex items-center gap-3 py-2"
                            >
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                              <span className="text-gray-700">{item}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Scale & Expand */}
                  <motion.div
                    id="scale-expand"
                    data-step="3"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    viewport={{ once: true, margin: "-20%" }}
                    className="min-h-screen flex items-center"
                  >
                    <div className="w-full">
                      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                        <div className="mb-8">
                          <div className="text-gray-500 font-medium text-sm mb-2">Q1 2026</div>
                          <h3 className="text-3xl font-medium text-gray-900 mb-4">Scale & Expand</h3>
                          <p className="text-xl text-gray-600 leading-relaxed">
                            Add new locations and scale your operations seamlessly across multiple dealership sites.
                          </p>
                        </div>
                        
                        <div className="space-y-4">
                          {[
                            'Multi-location management tools',
                            'Franchise-ready scaling features',
                            'Enterprise-grade security',
                            'Advanced user permission systems',
                            'Cross-location reporting',
                            'Strategic growth planning tools'
                          ].map((item, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05, duration: 0.4 }}
                              viewport={{ once: true }}
                              className="flex items-center gap-3 py-2"
                            >
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                              <span className="text-gray-700">{item}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clean CTA Section */}
      <section className="px-6 py-20 bg-green-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-4xl font-roc font-medium mb-6">
              Join 500+ Dealerships Already Transforming Their Operations
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Get VIP early access to DealerBarn and be among the first to eliminate spreadsheet chaos forever.
            </p>
          </motion.div>
          
          {/* Simple value props */}
          <div className="grid sm:grid-cols-2 gap-6 mb-12 max-w-2xl mx-auto">
            {[
              'First 90 days free (worth $2,400)',
              'White-glove onboarding included', 
              'Direct line to our product team',
              'Lock in founding member pricing'
            ].map((prop, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 text-left"
              >
                <div className="text-green-300 text-sm">✓</div>
                <span className="text-green-100">{prop}</span>
              </motion.div>
            ))}
          </div>
          
          {/* Simple form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-6"
          >
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white text-gray-900"
            />
            <motion.button
              type="submit"
              className="bg-white hover:bg-gray-100 text-green-800 px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Secure Your Spot
            </motion.button>
          </motion.form>
          
          <p className="text-green-200 text-sm">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500">&copy; 2024 DealerBarn. All rights reserved.</p>
          <div className="flex justify-center gap-8 mt-4 text-sm">
            <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
