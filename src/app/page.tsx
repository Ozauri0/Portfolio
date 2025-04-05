'use client';

import { useRef } from "react";
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollToTopButton } from "@/components/ui/scroll-to-top-button"
import NodeBackground from "@/components/node-background"
import { 
  Github, 
  Linkedin, 
  Mail, 
  ExternalLink
} from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { translations } from "@/translations"
import LanguageSelector from "@/components/language-selector"
import ContactForm from "@/components/contact-form"
import SkillsSection from "@/components/skills-section"

import { 
  SiAngular, 
  SiReact, 
  SiIonic, 
  SiCapacitor, 
  SiAndroidstudio, 
  SiDjango, 
  SiFlask, 
  SiFastapi, 
  SiNodedotjs, 
  SiPython, 
  SiJavascript, 
  SiTypescript, 
  SiGit, 
  SiMysql, 
  SiDocker, 
  SiLinux,
  SiHtml5,
  SiCss3,
  SiMongodb,
  SiSqlite,
  SiNextdotjs,
  SiTails,
  SiTailwindcss,
  SiC
} from 'react-icons/si';

export default function Home() {
  const { language } = useLanguage();
  const t = translations[language];
  
  // Referencias para el scroll
  const heroRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  // Función para desplazarse a la sección hero (inicio)
  const scrollToTop = () => {
    heroRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Función para desplazarse a la sección de proyectos
  const scrollToProjects = () => {
    projectsRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Función para desplazarse a la sección de contacto
  const scrollToContact = () => {
    contactRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="relative min-h-screen bg-black text-white">
      <NodeBackground />
      <LanguageSelector />

      <main className="relative z-10">
        {/* Hero Section - Rediseñado */}
        <section ref={heroRef} className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Contenido de texto */}
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
                <p className="text-xl md:text-2xl text-gray-300">
                  {t.hero.specialization}
                </p>
                <p className="text-gray-300">
                  {t.hero.description}
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
                </div>
                <div className="flex gap-4 justify-center md:justify-start">
                  <a href="https://github.com/Ozauri0" target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="ghost" className="rounded-full text-white">
                      <Github className="h-5 w-5" />
                    </Button>
                  </a>
                  <a href="https://www.linkedin.com/in/christian-ferrer-640b7b216/" target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="ghost" className="rounded-full text-white">
                      <Linkedin className="h-5 w-5" />
                    </Button>
                  </a>
                  <a href="mailto:christianferrer.dev@gmail.com" rel="noopener noreferrer">
                    <Button size="icon" variant="ghost" className="rounded-full text-white">
                      <Mail className="h-5 w-5" />
                    </Button>
                  </a>
                </div>
              </div>
              
              {/* Foto de perfil */}
              <div className="flex justify-center order-1 md:order-2">
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-white/20 shadow-lg shadow-blue-500/10">
                  <Image
                    src="/perfil.png"
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

        {/* About Section - Modificado para complementar la información */}
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
          </div>
        </section>

        {/* Skills Section - Ahora es un componente separado */}
        <SkillsSection />

        {/* Projects Section */}
        <section ref={projectsRef} className="py-20 px-4 bg-zinc-900">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">{t.projects.title}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Proyecto 1: LearnPro */}
              <Card className="bg-black border-zinc-800 overflow-hidden hover:border-blue-500/30 transition-all duration-300">
                <div className="relative h-48">
                  <Image
                    src={`/learnpro.png`}
                    alt="LearnPro"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-2 text-white">{t.projects.project1.title}</h3>
                  <p className="text-gray-400 mb-4">
                    {t.projects.project1.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="bg-zinc-800 text-white">
                    <SiNextdotjs className="text-[#00000] h-4 w-4" />
                      Next.js
                    </Badge>
                    <Badge variant="secondary" className="bg-zinc-800 text-white">
                      <SiTailwindcss className="text-[#06B6D4] h-4 w-4" />
                      TailwindCSS
                    </Badge>
                    <Badge variant="secondary" className="bg-zinc-800 text-white">
                    <SiReact className="text-[#61DAFB] h-4 w-4" />
                      React
                    </Badge>
                    <Badge variant="secondary" className="bg-zinc-800 text-white">
                    <SiTypescript className="text-[#3178C6] h-4 w-4" />
                      TypeScript
                    </Badge>
                    <Badge variant="secondary" className="bg-zinc-800 text-white">
                    <SiNodedotjs className="text-[#339933] h-4 w-4" />
                      Node.js + Express
                    </Badge>
                    <Badge variant="secondary" className="bg-zinc-800 text-white">
                      <SiMongodb className="text-[#47A248] h-4 w-4" />
                      MongoDB
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <a href="https://github.com/Ozauri0/app-empresariales" target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="gap-1 text-white">
                        <Github className="h-4 w-4"/> {t.projects.code}
                      </Button>
                    </a>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="gap-1 bg-white text-black hover:bg-gray-200">
                        <ExternalLink className="h-4 w-4" /> {t.projects.liveDemo}
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Proyecto 2: MyBudget */}
              <Card className="bg-black border-zinc-800 overflow-hidden hover:border-green-500/30 transition-all duration-300">
                <div className="relative h-48">
                  <Image
                    src={`/MyBudget.png`}
                    alt="MyBudget Project"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-2 text-white">{t.projects.project2.title}</h3>
                  <p className="text-gray-400 mb-4">
                    {t.projects.project2.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="bg-zinc-800 text-white">
                      <SiIonic className="text-[#3880FF] h-4 w-4" />
                      Ionic
                    </Badge>
                    <Badge variant="secondary" className="bg-zinc-800 text-white">
                      <SiSqlite className="text-[#003B57] h-4 w-4" />
                      SQLite
                    </Badge>
                    <Badge variant="secondary" className="bg-zinc-800 text-white">
                      <SiAngular className="text-[#DD0031] h-4 w-4" />
                      Angular
                    </Badge>
                    <Badge variant="secondary" className="bg-zinc-800 text-white">
                      <SiCapacitor className="text-[#119EFF] h-4 w-4" />
                      Capacitor
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <a href="https://github.com/Ozauri0/MyBudget" target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="gap-1 text-white">
                        <Github className="h-4 w-4"/> {t.projects.code}
                      </Button>
                    </a>
                    <a href="https://drive.google.com/file/d/1vmzhouVOfmvh0CM3LvYGwwfjK5TsUofm/view?usp=sharing" target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="gap-1 bg-white text-black hover:bg-gray-200">
                        <ExternalLink className="h-4 w-4" /> {t.projects.download}
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Proyecto 3: Educa+*/}
              <Card className="bg-black border-zinc-800 overflow-hidden hover:border-purple-500/30 transition-all duration-300">
                <div className="relative h-48">
                  <Image
                    src={`/educa+.png`}
                    alt="Educa+"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-2 text-white">{t.projects.project3.title}</h3>
                  <p className="text-gray-400 mb-4">
                    {t.projects.project3.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="bg-zinc-800 text-white">
                      <SiIonic className="text-[#3880FF] h-4 w-4" />
                      Ionic
                    </Badge>
                    <Badge variant="secondary" className="bg-zinc-800 text-white">
                      <SiAngular className="text-[#DD0031] h-4 w-4" />
                      Angular
                    </Badge>
                    <Badge variant="secondary" className="bg-zinc-800 text-white">
                      <SiCapacitor className="text-[#119EFF] h-4 w-4" />
                      Capacitor
                    </Badge>
                    <Badge variant="secondary" className="bg-zinc-800 text-white">
                      <SiNodedotjs className="text-[#339933] h-4 w-4" />
                      Node.js + Express
                    </Badge>
                    <Badge variant="secondary" className="bg-zinc-800 text-white">
                      <SiMysql className="text-[#00758F] h-4 w-4" />
                      MySQL
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <a href="https://github.com/Ozauri0/educaplus" target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="gap-1 text-white">
                        <Github className="h-4 w-4"/> {t.projects.code}
                      </Button>
                    </a>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="gap-1 bg-white text-black hover:bg-gray-200">
                        <ExternalLink className="h-4 w-4" /> {t.projects.documentation}
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center mt-12">
              <Button variant="outline" className="text-white">{t.projects.viewAll}</Button>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section ref={contactRef} className="py-20 px-4 bg-black">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">{t.contact.title}</h2>
            <ContactForm />
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 bg-zinc-900 border-t border-zinc-800">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400">© {new Date().getFullYear()} | {t.footer.rights}</p>
              <div className="flex gap-4 mt-4 md:mt-0">
                <a href="https://github.com/Ozauri0" target="_blank" rel="noopener noreferrer">
                  <Button size="icon" variant="ghost" className="rounded-full text-white">
                    <Github className="h-5 w-5" />
                  </Button>
                </a>
                <a href="https://www.linkedin.com/in/christian-ferrer-640b7b216/" target="_blank" rel="noopener noreferrer">
                  <Button size="icon" variant="ghost" className="rounded-full text-white">
                    <Linkedin className="h-5 w-5" />
                  </Button>
                </a>
                <a href="mailto:christianferrer.dev@gmail.com" rel="noopener noreferrer">
                  <Button size="icon" variant="ghost" className="rounded-full text-white">
                    <Mail className="h-5 w-5" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </footer>
        
        {/* Botón flotante para volver arriba - Con animación de crecimiento */}
        <ScrollToTopButton 
          onClick={scrollToTop} 
          srText={language === 'es' ? "Volver al inicio" : "Back to top"}
        />
      </main>
    </div>
  )
}