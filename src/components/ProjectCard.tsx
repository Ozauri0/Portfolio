'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Github, ExternalLink, Download, FileText } from 'lucide-react';
import { techIconsMap, hoverColors } from '@/lib/techIcons';
import { Project } from '@/services/projectsService';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import analyticsService from '@/services/analyticsService';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { language } = useLanguage();
  const t = translations[language];

  const handleProjectClick = () => {
    // Track click using project slug
    analyticsService.trackProjectClick(project.slug);
  };

  // Get the demo button label based on demoType
  const getDemoButtonLabel = () => {
    switch (project.demoType) {
      case 'demo':
        return t.projects.liveDemo;
      case 'download':
        return t.projects.download;
      case 'documentation':
        return t.projects.documentation;
      default:
        return t.projects.liveDemo;
    }
  };

  // Get the demo button icon based on demoType
  const getDemoButtonIcon = () => {
    switch (project.demoType) {
      case 'download':
        return <Download className="h-4 w-4" />;
      case 'documentation':
        return <FileText className="h-4 w-4" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  // Get the demo link
  const getDemoLink = () => {
    if (project.demoType === 'download' && project.links.download) {
      return project.links.download;
    }
    return project.links.demo || null;
  };

  const demoLink = getDemoLink();
  const hoverColorClass = hoverColors[project.hoverColor] || hoverColors.blue;

  return (
    <Card 
      className={`bg-black border-zinc-800 overflow-hidden ${hoverColorClass} transition-all duration-300 flex flex-col`}
    >
      <div className="relative h-48">
        <Image
          src={project.image}
          alt={project.title[language]}
          fill
          className="object-cover"
          priority
          unoptimized={project.image.startsWith('http://') || project.image.includes('/public/')}
        />
      </div>
      <CardContent className="pt-6 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2 text-white">
            {project.title[language]}
          </h3>
          <p className="text-gray-400 mb-4">
            {project.description[language]}
          </p>
          
          {/* Technology badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.technologies.map((techKey) => {
              const tech = techIconsMap[techKey];
              if (!tech) {
                // If tech not found in map, show just the name
                return (
                  <Badge 
                    key={techKey} 
                    variant="secondary" 
                    className="bg-zinc-800 text-white"
                  >
                    {techKey}
                  </Badge>
                );
              }
              const IconComponent = tech.icon;
              return (
                <Badge 
                  key={techKey} 
                  variant="secondary" 
                  className="bg-zinc-800 text-white"
                >
                  <IconComponent 
                    className="h-4 w-4 mr-1" 
                    style={{ color: tech.color }}
                  />
                  {tech.name}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-auto flex gap-2">
          {project.links.github && (
            <a 
              href={project.links.github} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={demoLink ? 'flex-1' : 'w-full'}
              onClick={handleProjectClick}
            >
              <Button size="sm" variant="outline" className="gap-1 text-white w-full">
                <Github className="h-4 w-4" /> {t.projects.code}
              </Button>
            </a>
          )}
          
          {demoLink && (
            <a 
              href={demoLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={project.links.github ? 'flex-1' : 'w-full'}
              onClick={handleProjectClick}
            >
              <Button size="sm" className="gap-1 bg-white text-black hover:bg-gray-200 w-full">
                {getDemoButtonIcon()} {getDemoButtonLabel()}
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
