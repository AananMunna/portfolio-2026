import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProjectDetail from '@/components/Projectdetail';
import { getProjectBySlug, projectSlug, projects } from '@/components/Projectsdata';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: projectSlug(p) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: `${project.title} case study`,
    description: project.tagline,
    openGraph: { title: project.title, description: project.tagline, images: [project.image] },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.id === project.id);

  return (
    <main>
      <ProjectDetail
        project={project}
        index={index}
        total={projects.length}
        prev={projects[index - 1] ?? null}
        next={projects[index + 1] ?? null}
      />
    </main>
  );
}
