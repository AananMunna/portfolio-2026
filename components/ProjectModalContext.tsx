'use client';

import { AnimatePresence } from 'motion/react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { projects } from './Projectsdata';
import ProjectDetail from './Projectdetail';

/**
 * One project modal for the whole page. Both the Projects section and the
 * Experience section open it, so a project always looks the same wherever
 * you click it.
 */
interface ProjectModalValue {
  open: (id: number) => void;
  openByTitle: (title: string) => void;
  close: () => void;
}

const ProjectModalContext = createContext<ProjectModalValue | null>(null);

export function useProjectModal() {
  const ctx = useContext(ProjectModalContext);
  if (!ctx) {
    throw new Error('useProjectModal must be used inside <ProjectModalProvider>');
  }
  return ctx;
}

export function ProjectModalProvider({ children }: { children: ReactNode }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const savedScrollY = useRef(0);
  const wasOpen = useRef(false);

  const selectedIndex =
    selectedId === null ? -1 : projects.findIndex((p) => p.id === selectedId);
  const selected = selectedIndex >= 0 ? projects[selectedIndex] : null;

  // Freeze the page behind the modal, then put the reader back exactly where
  // they were (Experience or Projects) when it closes.
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
  const openByTitle = useCallback((title: string) => {
    const match = projects.find((p) => p.title === title);
    if (match) setSelectedId(match.id);
  }, []);

  const value = useMemo(
    () => ({ open, openByTitle, close }),
    [open, openByTitle, close]
  );

  return (
    <ProjectModalContext.Provider value={value}>
      {children}

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
    </ProjectModalContext.Provider>
  );
}
