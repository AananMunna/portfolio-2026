'use client';

import { AnimatePresence, motion, useSpring, useMotionValue } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ExternalLink, Github, ArrowRight } from 'lucide-react';

const projects = [
  {
    id: 1,
    title: 'TripTale',
    category: 'Travel Platform',
    image: '/images/trip.png',
    year: '2024',
    description: 'Built for travelers who want to share stories, not just photos. Full auth, maps, community — shipped solo.',
    link: 'https://peppy-youtiao-479900.netlify.app/',
    github: 'https://github.com/AananMunna/trip-tale-client',
    tags: ['react', 'express', 'mongodb', 'tailwind']
  },
  {
    id: 2,
    title: 'StudySync',
    category: 'Study Platform',
    image: '/images/study.png',
    year: '2024',
    description: 'Turned the chaos of group assignments into a structured, gamified experience. Leaderboards included.',
    link: 'https://studysync-d270a.web.app/',
    github: 'https://github.com/AananMunna/studySync',
    tags: ['react', 'tailwind', 'express', 'mongodb']
  },
  {
    id: 3,
    title: 'Garden',
    category: 'E-Commerce / Social',
    image: '/images/garden.png',
    year: '2024',
    description: "A modern gardening-themed website featuring Swiper sliders, Lottie animations, and a custom 'Featured Gardeners' section styled like social media profiles. Built with React and Tailwind for clean, responsive design.",
    link: 'https://gardening-hub-a68ec.web.app/',
    github: 'https://github.com/AananMunna/gardening-hub',
    tags: ['tailwind', 'react', 'mongodb', 'express']
  },
  {
    id: 4,
    title: 'Othoba',
    category: 'E-Commerce',
    image: '/images/othoba.png',
    year: '2024',
    description: 'Pixel-perfect clone of a real BD e-commerce site. Proved I can match production-level UI standards.',
    link: 'https://clone-othoba.vercel.app/',
    github: 'https://github.com/AananMunna/othoba.com',
    tags: ['react', 'tailwind']
  },
  {
    id: 5,
    title: 'ValoDeal',
    category: 'E-Commerce Deal Platform',
    image: '/images/valodeal.png',
    year: '2024',
    description: 'An eCommerce deal platform offering exclusive products at discounted prices. Built using the MERN stack with features like product filtering, detail modals, and smooth animations using Framer Motion.',
    link: 'https://valo-deal.vercel.app/',
    github: 'https://github.com/AananMunna/ValoDeal',
    tags: ['react', 'tailwind']
  }
];

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);
  const [hoveredProject, setHoveredProject] = useState<typeof projects[0] | null>(null);

  // Mouse tracking for floating image
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const savedScrollY = useRef(0);

useEffect(() => {
  const lenis = (window as any).lenis;
  if (selectedProject) {
    savedScrollY.current = window.scrollY;
    lenis?.stop();
  } else {
    lenis?.start();
    lenis?.scrollTo(savedScrollY.current, { immediate: true, force: true });
  }
  return () => {
    lenis?.start();
  };
}, [selectedProject]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <>
      <section className="py-32 px-4 sm:px-8 max-w-7xl mx-auto relative z-20 bg-bg" id="work">
        <div className="mb-16 md:mb-24 flex justify-between items-end border-b border-border pb-8">
          <h2 className="font-display text-4xl sm:text-6xl uppercase font-bold tracking-tighter">
            Selected <span className="text-accent italic">Works</span>
          </h2>
          <span className="font-mono text-xs uppercase tracking-widest text-muted hidden sm:block">(05 Projects)</span>
        </div>

        <div className="relative w-full flex flex-col" onMouseLeave={() => setHoveredProject(null)}>
          {projects.map((project) => (
            <motion.div
              key={project.id}
              onMouseEnter={() => setHoveredProject(project)}
              onClick={() => setSelectedProject(project)}
              className="group relative flex flex-col sm:flex-row sm:items-center justify-between py-8 sm:py-12 border-b border-border cursor-pointer hover-target"
            >
              {/* Background hover effect */}
              <div className="absolute inset-0 bg-surface/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 rounded-xl" />

              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 z-10 px-4 sm:px-0">
                <span className="font-mono text-xs text-muted group-hover:text-accent transition-colors">0{project.id}</span>
                <motion.h3 layoutId={`project-title-${project.id}`} className="font-display text-4xl sm:text-6xl uppercase font-bold tracking-tighter text-fg group-hover:translate-x-4 transition-transform duration-500">
                  {project.title}
                </motion.h3>
              </div>

              <div className="flex items-center gap-6 mt-4 sm:mt-0 z-10 px-4 sm:px-0">
                <motion.p layoutId={`project-category-${project.id}`} className="font-mono text-xs uppercase tracking-widest text-muted group-hover:text-fg transition-colors">
                  {project.category}
                </motion.p>
                <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:text-bg transition-all duration-500">
                  <ArrowRight size={16} className="-rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Floating Image Reveal (Desktop Only) */}
      <motion.div
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          visibility: hoveredProject && !selectedProject ? 'visible' : 'hidden'
        }}
        className="fixed top-0 left-0 w-[400px] h-[250px] pointer-events-none z-50 hidden md:block overflow-hidden rounded-2xl shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {hoveredProject && !selectedProject && (
            <motion.div
              key={hoveredProject.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <Image
                src={hoveredProject.image}
                alt={hoveredProject.title}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Cinematic Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex flex-col bg-bg overflow-hidden"
          >
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-6 right-6 z-[100] p-4 bg-black/50 backdrop-blur-md hover:bg-accent hover:text-bg rounded-full text-white transition-all duration-300 hover-target group"
            >
              <X size={32} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            <motion.div
              initial={{ y: '-20%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={{ y: '-20%', opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] shrink-0"
            >
              <Image
                src={selectedProject.image}
                alt={selectedProject.title}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-10" />
            </motion.div>

            <div className="relative z-10 px-6 sm:px-16 -mt-20 sm:-mt-32 pb-12 flex flex-col flex-grow max-w-screen-2xl mx-auto w-full overflow-y-auto" data-lenis-prevent="true">
              <motion.div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8">
                <div>
                  <motion.p layoutId={`project-category-${selectedProject.id}`} className="font-mono text-xs sm:text-sm md:text-lg uppercase tracking-widest text-accent mb-2 sm:mb-4">
                    {selectedProject.category}
                  </motion.p>
                  <motion.h3 layoutId={`project-title-${selectedProject.id}`} className="font-display text-5xl sm:text-7xl md:text-[9rem] leading-none uppercase font-bold tracking-tighter text-fg drop-shadow-2xl">
                    {selectedProject.title}
                  </motion.h3>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="flex flex-col sm:flex-row gap-4 pb-4 w-full md:w-auto"
                >
                  <a 
                    href={selectedProject.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 bg-accent text-bg py-3 sm:py-4 px-6 sm:px-8 rounded-full font-mono text-xs sm:text-sm uppercase tracking-widest font-bold hover:bg-white transition-colors hover-target w-full sm:w-auto"
                  >
                    Live Site <ExternalLink size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </a>
                  <a 
                    href={selectedProject.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 bg-transparent border border-border text-fg py-3 sm:py-4 px-6 sm:px-8 rounded-full font-mono text-xs sm:text-sm uppercase tracking-widest hover:bg-border transition-colors hover-target w-full sm:w-auto"
                  >
                    GitHub <Github size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </a>
                </motion.div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mt-8 sm:mt-12 md:mt-20 grid grid-cols-1 md:grid-cols-12 gap-8"
              >
                <div className="md:col-span-8">
                  <h4 className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-muted mb-4 sm:mb-6 border-b border-border pb-4">About The Project</h4>
                  <p className="text-lg sm:text-xl md:text-3xl text-fg/80 leading-relaxed font-medium">
                    {selectedProject.description}
                  </p>
                </div>
                <div className="md:col-span-4">
                  <h4 className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-muted mb-4 sm:mb-6 border-b border-border pb-4">Details</h4>
                  <ul className="space-y-3 sm:space-y-4 font-mono text-xs sm:text-sm">
                    <li className="flex justify-between"><span className="text-muted">Year</span> <span>{selectedProject.year}</span></li>
                    <li className="flex justify-between"><span className="text-muted">Role</span> <span>Sole Developer</span></li>
                  </ul>
                  
                  <h4 className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-muted mt-8 mb-4 sm:mb-6 border-b border-border pb-4">Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tags?.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-surface border border-border rounded-full font-mono text-[10px] uppercase tracking-widest text-fg/80">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
