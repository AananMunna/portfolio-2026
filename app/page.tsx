'use client';

import { useEffect, useState } from 'react';
import CustomCursor from '@/components/CustomCursor';
import Hero from '@/components/Hero';
import About from '@/components/About';
import SystemPrefsDrawer from '@/components/SystemPrefsDrawer';
import Skills from '@/components/Skills';
import Experience from '@/components/Experience';
import Projects from '@/components/Projects';
import ProjectsGallery from '@/components/ProjectsGallery';
import ChatAssistant from '@/components/ChatAssistant';
import BootSequence from '@/components/BootSequence';
import TechMarquee from '@/components/TechMarquee';
import StackMatrix from '@/components/StackMatrix';
import Blog from '@/components/Blog';
import AvailabilityCTA from '@/components/AvailabilityCTA';

export default function Home() {
  const [bootComplete, setBootComplete] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {!bootComplete && <BootSequence onComplete={() => setBootComplete(true)} />}
      
      <main className={`relative bg-bg min-h-screen transition-opacity duration-1000 ease-in-out ${bootComplete ? 'opacity-100' : 'opacity-0 h-screen overflow-hidden'}`}>
        <CustomCursor />

        {/* <div className="hidden md:block">
          <SystemPrefsDrawer />
        </div> */}
        
        <Hero />
        <TechMarquee />
        <Experience />
        <div id="skills"><StackMatrix /></div>
        <div id="work"><Projects /></div>
        <div id="gallery"><ProjectsGallery /></div>
        <About />
        <Blog />
        <AvailabilityCTA />

        {/* <div className="hidden md:block">
          <ChatAssistant />
        </div> */}
      </main>
    </>
  );
}