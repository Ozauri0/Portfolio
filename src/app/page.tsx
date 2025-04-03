'use client';

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import NodeBackground from "@/components/node-background"
import { Github, Linkedin, Mail, ExternalLink } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { translations } from "@/translations"
import LanguageSelector from "@/components/language-selector"

export default function Home() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="relative min-h-screen bg-black text-white">
      <NodeBackground />
      <LanguageSelector />

      <main className="relative z-10">
        {/* Hero Section - Rediseñado */}
        <section className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Contenido de texto */}
              <div className="space-y-6 text-center md:text-left order-2 md:order-1">
                <div className="space-y-2">
                  <h2 className="text-2xl md:text-4xl tracking-wider bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent font-semibold">
                    Christian Ferrer
                  </h2>
                  <h1 className="text-4xl md:text-6xl font-bold text-white">
                    {t.hero.title} <span className="text-gray-400">{t.hero.subtitle}</span>
                  </h1>
                </div>
                <p className="text-xl md:text-2xl text-gray-300">
                  {t.hero.specialization}
                </p>
                <p className="text-gray-300">
                  {t.hero.description}
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Button variant="outline" className="border-white hover:bg-white hover:text-black text-white">
                    {t.hero.viewProjects}
                  </Button>
                  <Button className="bg-white text-black hover:bg-gray-200">{t.hero.contactMe}</Button>
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
              <div className="flex justify-center mt-6">
                <Button variant="outline" className="border-white/50 hover:border-white text-white">
                  {t.about.downloadCV}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section className="py-20 px-4 bg-black">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">{t.skills.title}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4 text-white">{t.skills.mobile}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-zinc-800 text-white">
                      Ionic Angular
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800 text-white">
                      Capacitor
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800 text-white">
                      Android Studio
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4 text-white">{t.skills.web}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-zinc-800 text-white">
                      Angular
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800 text-white">
                      React
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800 text-white">
                      Django
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800 text-white">
                      Flask
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800 text-white">
                      HTML5
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800 text-white">
                      CSS
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4 text-white">{t.skills.api}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-zinc-800 text-white">
                      Django
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800 text-white">
                      Flask
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800 text-white">
                      FastAPI
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800 text-white">
                      Node.js
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4 text-white">{t.skills.languages}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-zinc-800 text-white">
                      Python
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800 text-white">
                      JavaScript
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800 text-white">
                      TypeScript
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4 text-white">{t.skills.devops}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-zinc-800 text-white">
                      Git
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800 text-white">
                      MySQL
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800 text-white">
                      Docker
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800 text-white">
                      Linux
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4 text-white">{t.skills.other}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-zinc-800 text-white">
                      UI/UX Design
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800 text-white">
                      RESTful APIs
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800 text-white">
                      Database Design
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section className="py-20 px-4 bg-zinc-900">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">{t.projects.title}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Proyecto 1: MyBudget */}
              <Card className="bg-black border-zinc-800 overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={`/MyBudget.png`}
                    alt="MyBudget Project"
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
                      Ionic
                    </Badge>
                    <Badge variant="secondary" className="bg-zinc-800 text-white">
                      SQLite
                    </Badge>
                    <Badge variant="secondary" className="bg-zinc-800 text-white">
                      Angular
                    </Badge>
                    <Badge variant="secondary" className="bg-zinc-800 text-white">
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

              {/* Proyecto 2: Portfolio Website */}
              <Card className="bg-black border-zinc-800 overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={`/placeholder.svg?height=192&width=384`}
                    alt="Portfolio Website"
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
                      Next.js
                    </Badge>
                    <Badge variant="secondary" className="bg-zinc-800 text-white">
                      TailwindCSS
                    </Badge>
                    <Badge variant="secondary" className="bg-zinc-800 text-white">
                      React
                    </Badge>
                    <Badge variant="secondary" className="bg-zinc-800 text-white">
                      TypeScript
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <a href="https://github.com/Ozauri0/portfolio" target="_blank" rel="noopener noreferrer">
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

              {/* Proyecto 3: LearnPro */}
              <Card className="bg-black border-zinc-800 overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={`/placeholder.svg?height=192&width=384`}
                    alt="LearnPro"
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
                      Next.js
                    </Badge>
                    <Badge variant="secondary" className="bg-zinc-800 text-white">
                      TailwindCSS
                    </Badge>
                    <Badge variant="secondary" className="bg-zinc-800 text-white">
                      React
                    </Badge>
                    <Badge variant="secondary" className="bg-zinc-800 text-white">
                      TypeScript
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
        <section className="py-20 px-4 bg-black">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">{t.contact.title}</h2>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-white">
                    {t.contact.name}
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-white">
                    {t.contact.email}
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-white">
                  {t.contact.subject}
                </label>
                <input
                  id="subject"
                  type="text"
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-white">
                  {t.contact.message}
                </label>
                <textarea
                  id="message"
                  rows={6}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white"
                ></textarea>
              </div>
              <Button className="w-full bg-white text-black hover:bg-gray-200">{t.contact.send}</Button>
            </form>
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
      </main>
    </div>
  )
}