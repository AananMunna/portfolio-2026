import Hero from '@/components/Hero';
import TechMarquee from '@/components/TechMarquee';
import Experience from '@/components/Experience';
import StackMatrix from '@/components/StackMatrix';
import Projects from '@/components/Projects';
import AboutTeaser from '@/components/AboutTeaser';
import Blog from '@/components/Blog';
import AvailabilityCTA from '@/components/AvailabilityCTA';

export default function Home() {
  return (
    <main className="relative min-h-screen bg-bg">
      <Hero />
      <TechMarquee />
      <Experience />
      <div id="skills">
        <StackMatrix />
      </div>
      <div id="work">
        <Projects />
      </div>
      <AboutTeaser />
      <Blog />
      <AvailabilityCTA />
    </main>
  );
}
