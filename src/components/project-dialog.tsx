'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, ExternalLink, Download, FileText } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { techIconsMap } from '@/lib/techIcons';
import { resolveImageUrl } from '@/lib/imageUrl';
import { safeHref } from '@/lib/utils';
import { Project } from '@/services/projectsService';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import analyticsService from '@/services/analyticsService';

type T = (typeof translations)['es'];

// Enlaces y etiquetas de un proyecto (compartido entre la card y el modal)
export function getProjectLinks(project: Project, t: T) {
  const demoLink =
    project.demoType === 'download' && project.links.download
      ? safeHref(project.links.download)
      : safeHref(project.links.demo);
  const githubLink = safeHref(project.links.github);

  const demoLabel =
    project.demoType === 'download'
      ? t.projects.download
      : project.demoType === 'documentation'
        ? t.projects.documentation
        : t.projects.liveDemo;

  const DemoIcon =
    project.demoType === 'download' ? Download : project.demoType === 'documentation' ? FileText : ExternalLink;

  return { demoLink, githubLink, demoLabel, DemoIcon };
}

interface ProjectDialogProps {
  project: Project | null;
  onClose: () => void;
}

// Vista ampliada de un proyecto en un <dialog> nativo: el navegador atrapa el foco y Esc lo cierra
export default function ProjectDialog({ project, onClose }: ProjectDialogProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const ref = useRef<HTMLDialogElement>(null);

  // Abrir/cerrar según el proyecto seleccionado y bloquear el scroll de la página mientras está abierto
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (project && !dialog.open) {
      dialog.showModal();
      document.documentElement.style.overflow = 'hidden';
    }
    if (!project && dialog.open) dialog.close();
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [project]);

  const { demoLink, githubLink, demoLabel, DemoIcon } = project
    ? getProjectLinks(project, t)
    : { demoLink: null, githubLink: null, demoLabel: '', DemoIcon: ExternalLink };

  const imageUrl = project ? resolveImageUrl(project.image) : '';
  const track = () => project && analyticsService.trackProjectClick(project.slug);

  return (
    <dialog
      ref={ref}
      aria-labelledby="project-dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClose={onClose}
      onClick={(e) => {
        // Click en el fondo (fuera del contenido) cierra
        if (e.target === ref.current) onClose();
      }}
      className="project-dialog m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-0 text-white shadow-2xl shadow-black/60 backdrop:bg-black/75 backdrop:backdrop-blur-sm"
    >
      {project && (
        <div className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-y-auto">
          {/* Imagen grande: completa (contain) sobre un fondo desenfocado de la misma imagen */}
          <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-black">
            <Image
              src={imageUrl}
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 896px) 100vw, 896px"
              className="scale-110 object-cover opacity-40 blur-2xl"
              unoptimized={imageUrl.startsWith('http://')}
            />
            <Image
              src={imageUrl}
              alt={project.title[language]}
              fill
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-contain"
              unoptimized={imageUrl.startsWith('http://')}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zinc-950 to-transparent" />

            <button
              type="button"
              onClick={onClose}
              aria-label={t.projects.close}
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-md transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Contenido */}
          <div className="space-y-6 p-6 md:p-8">
            <div className="space-y-3">
              <h2 id="project-dialog-title" className="text-2xl font-bold md:text-3xl">
                {project.title[language]}
              </h2>
              <p className="whitespace-pre-line text-base leading-relaxed text-zinc-300 md:text-lg">
                {project.description[language]}
              </p>
            </div>

            {project.technologies.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                  {t.projects.technologies}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((techKey) => {
                    const tech = techIconsMap[techKey];
                    const Icon = tech?.icon;
                    return (
                      <span
                        key={techKey}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-200"
                      >
                        {Icon && <Icon className="h-4 w-4" style={{ color: tech.color }} aria-hidden="true" />}
                        {tech?.name ?? techKey}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {(githubLink || demoLink) && (
              <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row">
                {demoLink && (
                  <Button asChild size="lg" className="gap-2 bg-white text-black hover:bg-zinc-200 sm:flex-1">
                    <a href={demoLink} target="_blank" rel="noopener noreferrer" onClick={track}>
                      <DemoIcon className="h-4 w-4" /> {demoLabel}
                    </a>
                  </Button>
                )}
                {githubLink && (
                  <Button asChild size="lg" variant="outline" className="gap-2 text-white sm:flex-1">
                    <a href={githubLink} target="_blank" rel="noopener noreferrer" onClick={track}>
                      <FaGithub className="h-4 w-4" /> {t.projects.code}
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
