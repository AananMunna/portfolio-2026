'use client';

import { useEffect, useState } from 'react';
import CustomCursor from '@/components/CustomCursor';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import SystemPrefsDrawer from '@/components/SystemPrefsDrawer';
import Skills from '@/components/Skills';
import TechSkills from '@/components/TechSkills';
import Experience from '@/components/Experience';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import ChatAssistant from '@/components/ChatAssistant';
import BootSequence from '@/components/BootSequence';

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
        <Navbar />

        <div className="hidden md:block">
          <SystemPrefsDrawer />
        </div>
        
        <Hero />
        <div id="work"><Projects /></div>
        <div id="experience"><Experience /></div>
        <div id="skills"><TechSkills /></div>
        {/* <div id="skills"><Skills /></div> */}
        <div id="about"><About /></div>
        <div id="contact"><Contact /></div>
        
        <div className="hidden md:block">
          <ChatAssistant />
        </div>
      </main>
    </>
  );
}