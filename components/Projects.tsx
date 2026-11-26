'use client';

import ProjectsAppStore from './ProjectsAppStore';
import { useProjectModal } from './ProjectModalContext';

export default function Projects() {
  const { open } = useProjectModal();

  return <ProjectsAppStore onOpen={open} />;
}
