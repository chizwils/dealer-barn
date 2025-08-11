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
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  
  // Scroll hijacking refs and state
  const roadmapSectionRef = useRef<HTMLDivElement | null>(null);
  const rightPanelRef = useRef<HTMLDivElement | null>(null);
  const [lockRoadmap, setLockRoadmap] = useState(false);

  // Detect enter/exit of the roadmap and toggle the lock
  useEffect(() => {
    const section = roadmapSectionRef.current;
    if (!section) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // Lock when roadmap is meaningfully in view
        if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
          setLockRoadmap(true);
        } else {
          setLockRoadmap(false);
        }
      },
      {
        root: null,
        threshold: [0, 0.4, 0.6, 1],
        rootMargin: '0px 0px 0px 0px',
      }
    );

    io.observe(section);
    return () => io.disconnect();
  }, []);

  // Route wheel events to the right panel while locked
  useEffect(() => {
    const right = rightPanelRef.current;
    if (!right) return;

    const onWheel = (e: WheelEvent) => {
      if (!lockRoadmap) return; // let the page handle it
      // We will handle this scroll; stop the page
      e.preventDefault();

      const atTop = right.scrollTop <= 0;
      const atBottom = right.scrollTop + right.clientHeight >= right.scrollHeight - 1;

      // Route scroll delta to the right panel
      right.scrollTop += e.deltaY;

      // If at edges and user keeps scrolling, release lock so page can continue
      if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
        setLockRoadmap(false);
        // let the next wheel tick go to the page
      }
    };

    // passive:false so we can preventDefault
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel as any);
  }, [lockRoadmap]);

  // Route touch (mobile) to the right panel while locked
  useEffect(() => {
    const right = rightPanelRef.current;
    if (!right) return;

    let startY = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (!lockRoadmap) return;
      startY = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!lockRoadmap) return;
      const currentY = e.touches[0].clientY;
      const delta = startY - currentY; // positive when swiping up (scroll down)

      const atTop = right.scrollTop <= 0;
      const atBottom = right.scrollTop + right.clientHeight >= right.scrollHeight - 1;

      // If we can scroll inside right panel, consume it
      const canScrollDown = !(atBottom && delta > 0);
      const canScrollUp = !(atTop && delta < 0);

      if (canScrollDown || canScrollUp) {
        e.preventDefault();
        right.scrollTop += delta;
        startY = currentY;
      } else {
        // Edge reached: unlock so the page can move
        setLockRoadmap(false);
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      window.removeEventListener('touchstart', onTouchStart as any);
      window.removeEventListener('touchmove', onTouchMove as any);
    };
  }, [lockRoadmap]);

  // Freeze body scroll while locked (prevents horizontal jitter)
  useEffect(() => {
    if (lockRoadmap) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lockRoadmap]);

  // Simple intersection observer for active step tracking
  useEffect(() => {
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
        threshold: 0.6,
        rootMargin: '-10% 0px -10% 0px'
      }
    );

    // Wait for component to mount, then observe sections
    const timer = setTimeout(() => {
      const sections = document.querySelectorAll('[data-step]');
      sections.forEach((section) => stepObserver.observe(section));
    }, 100);

    return () => {
      stepObserver.disconnect();
      clearTimeout(timer);
    };
  }, []);

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
              {['FEATURES', 'ROADMAP', 'TESTIMONIALS'].map((item, i) => (
                <motion.button
                  key={item}
                  className="text-gray-700 hover:text-gray-900 relative"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => {
                    const targetId = item === 'FEATURES' ? 'features' : 
                                   item === 'ROADMAP' ? 'roadmap' : 'testimonials';
                    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {item}
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600"
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
              className="bg-blue-800 hover:bg-blue-900 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(59, 130, 246, 0.2)" }}
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
                className="bg-blue-800 hover:bg-blue-900 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors relative overflow-hidden"
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.2)" }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700"
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
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
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

      {/* Problem Section - Adaline Metrics Style */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-4xl mx-auto">
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
          
          {/* Adaline-Style Metrics */}
          <div className="space-y-12">
            {[
              {
                stat: '15-20hrs',
                primary: 'Lost per week',
                secondary: 'on manual tasks'
              },
              {
                stat: '8+',
                primary: 'Systems & spreadsheets',
                secondary: 'per dealership'
              },
              {
                stat: '20-30%',
                primary: 'Profit opportunities',
                secondary: 'missed daily'
              },
              {
                stat: '99.9%',
                primary: 'Manual processes',
                secondary: 'that should be automated'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="grid lg:grid-cols-12 gap-8 items-center py-8">
                  {/* Large Statistic */}
                  <div className="lg:col-span-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 + 0.2, duration: 0.6 }}
                      viewport={{ once: true }}
                      className="text-6xl lg:text-7xl font-bold text-gray-900"
                    >
                      {item.stat}
                    </motion.div>
                  </div>
                  
                  {/* Description */}
                  <div className="lg:col-span-8">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 + 0.4, duration: 0.6 }}
                      viewport={{ once: true }}
                      className="space-y-1"
                    >
                      <div className="text-lg font-medium text-gray-900">
                        {item.primary}
                      </div>
                      <div className="text-lg text-gray-600">
                        {item.secondary}
                      </div>
                    </motion.div>
                  </div>
                </div>
                
                {/* Dotted line separator */}
                {i < 3 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ delay: i * 0.1 + 0.6, duration: 0.8 }}
                    viewport={{ once: true }}
                    className="h-px border-t-2 border-dotted border-gray-200 origin-left"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Clean Features Grid with Dotted Lines */}
      <section id="features" className="px-6 py-20 bg-white relative">
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

      {/* Adaline-Style Testimonials & Metrics Section */}
      <section id="testimonials" className="px-6 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-roc font-medium text-gray-900 mb-6">
              Join Dealerships Already Making 23% More Profit
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From small independent dealers to multi-location enterprises, DealerBarn helps dealerships streamline operations and scale confidently.
            </p>
          </motion.div>
          
          {/* Grid Layout with Testimonials and Metrics */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column - Testimonials */}
            <div className="lg:col-span-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  {
                    quote: "DealerBarn has become an invaluable tool for my team to streamline our inventory management...",
                    author: "Sarah M.",
                    title: "Operations Manager for Peterson Auto Group"
                  },
                  {
                    quote: "...DealerBarn is simply the best platform I've found that bridges the gap between manual processes & automation...",
                    author: "Mike R.",
                    title: "General Manager @ Metro Motors"
                  },
                  {
                    quote: "...DealerBarn is simply the best platform I've found that bridges the gap between manual processes & automation...",
                    author: "Lisa K.",
                    title: "Owner @ Valley Car Sales"
                  }
                ].map((testimonial, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                    className="bg-white p-6 rounded-lg border border-gray-200"
                  >
                    <blockquote className="text-gray-700 mb-4 leading-relaxed">
                      "{testimonial.quote}"
                    </blockquote>
                    <cite className="not-italic">
                      <div className="font-medium text-gray-900">{testimonial.author}</div>
                      <div className="text-sm text-gray-600">{testimonial.title}</div>
                    </cite>
                  </motion.div>
                ))}
              </div>
              
              {/* Company Logos Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                viewport={{ once: true }}
                className="grid grid-cols-4 gap-8 items-center py-8"
              >
                {[
                  { name: 'AutoMax', logo: 'AM' },
                  { name: 'CarHub', logo: 'CH' }, 
                  { name: 'DrivePoint', logo: 'DP' },
                  { name: 'MotorWorks', logo: 'MW' }
                ].map((company, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 font-bold text-lg mx-auto mb-2">
                      {company.logo}
                    </div>
                    <div className="text-sm text-gray-500 font-medium">{company.name}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            
            {/* Right Column - Scattered Metrics */}
            <div className="lg:col-span-4 space-y-16">
              
              {/* Metric 1 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-6xl font-bold text-gray-900 mb-2">90%</div>
                <div className="text-gray-600">Less manual work</div>
              </motion.div>
              
              {/* Metric 2 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center lg:text-right"
              >
                <div className="text-6xl font-bold text-gray-900 mb-2">50%</div>
                <div className="text-gray-600">Faster processing</div>
              </motion.div>
              
              {/* Bottom metric */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-lg border border-gray-200 text-center"
              >
                <div className="text-4xl font-bold text-gray-900 mb-2">23%</div>
                <div className="text-gray-600">Average profit increase</div>
              </motion.div>
              
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Roadmap with Sticky Navigation */}
      <section className="bg-white relative" id="roadmap" ref={roadmapSectionRef}>
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

          {/* Two-column layout: Sticky nav + Natural scrollable content */}
          <div className="flex min-h-screen">
            {/* Left Rail - Sticky Navigation */}
            <div className="w-1/3 px-6">
              <div className="sticky top-24">
                <div className="w-full space-y-2 py-8">
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

            {/* Right Panel - Scrollable Content with Hijacking */}
            <div className="flex-1 px-6">
              <div 
                id="roadmap-content"
                ref={rightPanelRef}
                className="space-y-12 py-8 h-[calc(100vh-8rem)] overflow-y-auto overscroll-contain scroll-smooth snap-y snap-mandatory"
              >
                {/* Beta Onboarding */}
                <motion.div
                  id="beta-onboarding"
                  data-step="0"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  viewport={{ once: true, margin: "-20%" }}
                  className="py-12 min-h-[80vh] snap-start"
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
                  className="py-12 min-h-[80vh] snap-start"
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
                  className="py-12 min-h-[80vh] snap-start"
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
                  className="py-12 min-h-[80vh] snap-start"
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
      </section>

      {/* Clean CTA Section */}
      <section className="px-6 py-20 bg-blue-800 text-white">
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
            <p className="text-xl text-blue-100 mb-8">
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
                <div className="text-blue-300 text-sm">✓</div>
                <span className="text-blue-100">{prop}</span>
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
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-gray-900"
            />
            <motion.button
              type="submit"
              className="bg-white hover:bg-gray-100 text-blue-800 px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Secure Your Spot
            </motion.button>
          </motion.form>
          
          <p className="text-blue-200 text-sm">
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
