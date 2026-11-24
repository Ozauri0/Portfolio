'use client';

import { resolveImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Maximize2 } from 'lucide-react';
import { FaGithub as Github } from 'react-icons/fa';
import { techIconsMap, hoverColors } from '@/lib/techIcons';
import { Project } from '@/services/projectsService';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import analyticsService from '@/services/analyticsService';
import { getProjectLinks } from '@/components/project-dialog';

interface ProjectCardProps {
  project: Project;
  /** Abre la vista ampliada del proyecto */
  onOpen: (project: Project) => void;
}

// Máximo de badges en la card; el resto se ve en la vista ampliada
const MAX_BADGES = 5;

export default function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const { language } = useLanguage();
  const t = translations[language];

  const { demoLink, githubLink, demoLabel, DemoIcon } = getProjectLinks(project, t);
  const hoverColorClass = hoverColors[project.hoverColor] || hoverColors.blue;
  const imageUrl = resolveImageUrl(project.image);
  const title = project.title[language];

  const open = () => onOpen(project);
  // Los enlaces de la card no deben abrir el modal
  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    analyticsService.trackProjectClick(project.slug);
  };

  const shownTech = project.technologies.slice(0, MAX_BADGES);
  const hiddenTech = project.technologies.length - shownTech.length;

  return (
    <Card
      onClick={open}
      className={`group relative cursor-pointer bg-black border-zinc-800 overflow-hidden ${hoverColorClass} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 flex flex-col`}
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 384px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority
          unoptimized={imageUrl.startsWith('http://')}
        />
        {/* Indicación de que la card se puede ampliar */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/40">
          <span className="flex translate-y-2 items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-sm font-medium text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <Maximize2 className="h-4 w-4" aria-hidden="true" />
            {t.projects.viewDetails}
          </span>
        </div>
      </div>
      <CardContent className="pt-6 flex-1 flex flex-col">
        <div className="flex-1">
          {/* Botón accesible que cubre la card (teclado / lectores de pantalla) */}
          <h3 className="text-xl font-bold mb-2 text-white">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
              className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-sm"
              aria-haspopup="dialog"
            >
              {title}
            </button>
          </h3>
          <p className="text-gray-400 mb-4 line-clamp-3">
            {project.description[language]}
          </p>

          {/* Technology badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {shownTech.map((techKey) => {
              const tech = techIconsMap[techKey];
              const IconComponent = tech?.icon;
              return (
                <Badge key={techKey} variant="secondary" className="bg-zinc-800 text-white">
                  {IconComponent && (
                    <IconComponent className="h-4 w-4 mr-1" style={{ color: tech.color }} />
                  )}
                  {tech?.name ?? techKey}
                </Badge>
              );
            })}
            {hiddenTech > 0 && (
              <Badge variant="secondary" className="bg-zinc-900 text-zinc-400 border border-zinc-800">
                +{hiddenTech}
              </Badge>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-auto flex gap-2">
          {githubLink && (
            <Button asChild size="sm" variant="outline" className={`gap-1 text-white ${demoLink ? 'flex-1' : 'w-full'}`}>
              <a href={githubLink} target="_blank" rel="noopener noreferrer" onClick={handleLinkClick}>
                <Github className="h-4 w-4" /> {t.projects.code}
              </a>
            </Button>
          )}

          {demoLink && (
            <Button asChild size="sm" className={`gap-1 bg-white text-black hover:bg-gray-200 ${githubLink ? 'flex-1' : 'w-full'}`}>
              <a href={demoLink} target="_blank" rel="noopener noreferrer" onClick={handleLinkClick}>
                <DemoIcon className="h-4 w-4" /> {demoLabel}
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
