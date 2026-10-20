'use client';

import { AnimatePresence } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { projects } from './Projectsdata';
import ProjectDetail from './Projectdetail';
import ProjectsAppStore from './ProjectsAppStore';

export default function Projects() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const savedScrollY = useRef(0);
  const wasOpen = useRef(false);

  const selectedIndex =
    selectedId === null ? -1 : projects.findIndex((p) => p.id === selectedId);
  const selected = selectedIndex >= 0 ? projects[selectedIndex] : null;

  useEffect(() => {
    const lenis = (window as any).lenis;
    if (selected) {
      if (!wasOpen.current) savedScrollY.current = window.scrollY;
      wasOpen.current = true;
      lenis?.stop();
    } else if (wasOpen.current) {
      wasOpen.current = false;
      lenis?.start();
      lenis?.scrollTo(savedScrollY.current, { immediate: true, force: true });
    }
  }, [selected]);

  useEffect(() => {
    return () => {
      (window as any).lenis?.start();
    };
  }, []);

  const open = useCallback((id: number) => setSelectedId(id), []);
  const close = useCallback(() => setSelectedId(null), []);

  return (
    <>
      <ProjectsAppStore onOpen={open} />

      <AnimatePresence>
        {selected && (
          <ProjectDetail
            key="project-detail"
            project={selected}
            index={selectedIndex}
            total={projects.length}
            prev={projects[selectedIndex - 1] ?? null}
            next={projects[selectedIndex + 1] ?? null}
            onClose={close}
            onNavigate={setSelectedId}
          />
        )}
      </AnimatePresence>
    </>
  );
}