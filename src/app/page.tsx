'use client';

import { useRef, useEffect, useState } from "react";
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ScrollToTopButton } from "@/components/ui/scroll-to-top-button"
import UniverseBackground from "@/components/universe-background"
import AuthNavigation from "@/components/auth-navigation"
import useSecretAccess from "@/hooks/useSecretAccess"
import ProjectCard from "@/components/ProjectCard"
import projectsService, { Project } from "@/services/projectsService"
import { 
  Github, 
  Linkedin, 
  Mail
} from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { translations } from "@/translations"
import LanguageSelector from "@/components/language-selector"
import ContactForm from "@/components/contact-form"
import SkillsSection from "@/components/skills-section"
import ExperienceTimeline from "@/components/experience-timeline"
import analyticsService from "@/services/analyticsService"

export default function Home() {
  const { language } = useLanguage();
  const t = translations[language];
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  
  // Secret access hook (Ctrl + Shift + L)
  useSecretAccess();
  
  // Track visitor on page load and load projects
  useEffect(() => {
    analyticsService.trackVisitor();
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectsService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };
  
  // References for scrolling
  const heroRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  // Function to scroll to hero section (top)
  const scrollToTop = () => {
    heroRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Function to scroll to projects section
  const scrollToProjects = () => {
    projectsRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };
  // Function to scroll to contact section
  const scrollToContact = () => {
    contactRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Analytics tracking functions
  const handleSocialClick = (platform: 'github' | 'linkedin' | 'email') => {
    analyticsService.trackSocialClick(platform);
  };

  return (
    <div className="relative min-h-screen bg-black text-white">
      <UniverseBackground />
      
      {/* Header with navigation */}
      <header className="fixed top-0 left-0 z-50 p-4 flex items-center space-x-4">
        <AuthNavigation />
        <LanguageSelector />
      </header>

      <main className="relative z-10">
        {/* Hero Section - Redesigned */}
        <section ref={heroRef} className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Text content */}
              <div className="space-y-6 text-center md:text-left order-2 md:order-1">
                <div className="space-y-2">
                  <h2 className="text-2xl md:text-4xl tracking-wider bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent font-semibold">
                    Christian Ferrer
                  </h2>
                  <h1 className="text-4xl md:text-6xl font-bold text-white">
                    {t.hero.title} 
                  </h1>
                  <h1 className="text-4xl md:text-6xl font-bold text-white">
                  <span className="text-gray-400">{t.hero.subtitle}</span>
                  </h1>
                </div>
                <p className="text-2xl md:text-3xl leading-snug text-gray-200 max-w-md mx-auto md:mx-0">
                  {t.hero.specialization}
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Button 
                    variant="outline" 
                    className="border-white hover:bg-white hover:text-black text-white"
                    onClick={scrollToProjects}
                  >
                    {t.hero.viewProjects}
                  </Button>
                  <Button className="bg-white text-black hover:bg-gray-200" 
                  onClick={scrollToContact}>
                    {t.hero.contactMe}</Button>
                </div>                <div className="flex gap-4 justify-center md:justify-start">
                  <Button asChild size="icon" variant="ghost" className="rounded-full text-white">
<a href="https://github.com/Ozauri0" target="_blank" rel="noopener noreferrer" aria-label="GitHub" onClick={() => handleSocialClick('github')}>
                      <Github className="h-5 w-5" />
                    </a>
</Button>
                  <Button asChild size="icon" variant="ghost" className="rounded-full text-white">
<a href="https://www.linkedin.com/in/christian-ferrer-640b7b216/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" onClick={() => handleSocialClick('linkedin')}>
                      <Linkedin className="h-5 w-5" />
                    </a>
</Button>
                  <Button asChild size="icon" variant="ghost" className="rounded-full text-white">
<a href="mailto:christianferrer.dev@gmail.com" rel="noopener noreferrer" aria-label="Email" onClick={() => handleSocialClick('email')}>
                      <Mail className="h-5 w-5" />
                    </a>
</Button>
                </div>
              </div>
                {/* Profile picture */}
              <div className="flex justify-center order-1 md:order-2">
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-white/20 shadow-lg shadow-blue-500/10">
                  <Image
                    src="/perfil.webp"
                    alt="Developer Profile"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section - Modified to complement the information */}
        <section className="py-20 px-4 bg-zinc-900">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-white">{t.about.title}</h2>
            <div className="space-y-6 max-w-3xl mx-auto">
              <p className="text-gray-300">
                {t.about.paragraph1}
              </p>
              <p className="text-gray-300">
                {t.about.paragraph2}
              </p>
            </div>
            <ExperienceTimeline />
          </div>
        </section>

        {/* Skills Section - Now it's a separate component */}
        <SkillsSection />

        {/* Projects Section */}
        <section ref={projectsRef} className="py-20 px-4 bg-zinc-900">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">{t.projects.title}</h2>
            
            {loadingProjects ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No hay proyectos disponibles</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                  <ProjectCard key={project._id} project={project} />
                ))}
              </div>
            )}

            <div className="flex justify-center mt-12">
              <Button asChild variant="outline" className="text-white">
                <a href="https://github.com/Ozauri0/" target="_blank" rel="noopener noreferrer">{t.projects.viewAll}</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section ref={contactRef} className="py-20 px-4">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">{t.contact.title}</h2>
            <ContactForm />
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 bg-zinc-900 border-t border-zinc-800">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400">© {new Date().getFullYear()} | {t.footer.rights}</p>              <div className="flex gap-4 mt-4 md:mt-0">
                <Button asChild size="icon" variant="ghost" className="rounded-full text-white">
<a href="https://github.com/Ozauri0" target="_blank" rel="noopener noreferrer" aria-label="GitHub" onClick={() => handleSocialClick('github')}>
                    <Github className="h-5 w-5" />
                  </a>
</Button>
                <Button asChild size="icon" variant="ghost" className="rounded-full text-white">
<a href="https://www.linkedin.com/in/christian-ferrer-640b7b216/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" onClick={() => handleSocialClick('linkedin')}>
                    <Linkedin className="h-5 w-5" />
                  </a>
</Button>
                <Button asChild size="icon" variant="ghost" className="rounded-full text-white">
<a href="mailto:christianferrer.dev@gmail.com" rel="noopener noreferrer" aria-label="Email" onClick={() => handleSocialClick('email')}>
                    <Mail className="h-5 w-5" />
                  </a>
</Button>
              </div>
            </div>
          </div>
        </footer>        
        {/* Floating button to go back to top - With grow animation */}
        <ScrollToTopButton 
          onClick={scrollToTop} 
          srText={language === 'es' ? "Volver al inicio" : "Back to top"}
        />
      </main>
    </div>
  )
}