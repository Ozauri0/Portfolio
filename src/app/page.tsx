import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import NodeBackground from "@/components/node-background"
import { Github, Linkedin, Mail, ExternalLink } from "lucide-react"

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black text-white">
      <NodeBackground />

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
                  <h1 className="text-4xl md:text-6xl font-bold">
                    Full Stack <span className="text-gray-400">Developer</span>
                  </h1>
                </div>
                <p className="text-xl md:text-2xl text-gray-300">
                  Specialized in mobile and web development with modern technologies
                </p>
                <p className="text-gray-300">
                  I'm a passionate developer focused on creating efficient, scalable, and user-friendly applications.
                  With expertise in both mobile and web development, I bring ideas to life using the latest technologies
                  and best practices.
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Button variant="outline" className="border-white hover:bg-white hover:text-black">
                    View Projects
                  </Button>
                  <Button className="bg-white text-black hover:bg-gray-200">Contact Me</Button>
                </div>
                <div className="flex gap-4 justify-center md:justify-start">
                    <a href="https://github.com/Ozauri0" target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="ghost" className="rounded-full">
                      <Github className="h-5 w-5" />
                    </Button>
                    </a>
                  <a href="https://www.linkedin.com/in/christian-ferrer-640b7b216/" target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="ghost" className="rounded-full">
                    <Linkedin className="h-5 w-5" />
                    </Button>
                  </a>
                  <a href="mailto:christianferrer.dev@gmail.com.com" rel="noopener noreferrer">
                    <Button size="icon" variant="ghost" className="rounded-full">
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
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">About Me</h2>
            <div className="space-y-6 max-w-3xl mx-auto">
              <p className="text-gray-300">
                My experience spans across frontend and backend development, with a strong foundation in DevOps
                practices and server management. I'm dedicated to creating solutions that are not only technically sound
                but also deliver exceptional user experiences.
              </p>
              <p className="text-gray-300">
                I'm constantly learning and exploring new technologies to stay ahead in this rapidly evolving field.
                My approach combines technical expertise with a keen understanding of business needs to deliver
                solutions that truly make a difference.
              </p>
              <div className="flex justify-center mt-6">
                <Button variant="outline" className="border-white/50 hover:border-white">
                  Download CV
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section className="py-20 px-4 bg-black">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Skills & Technologies</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4">Mobile Development</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-zinc-800">
                      Ionic Angular
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800">
                      Capacitor
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800">
                      Android Studio
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4">Web Development</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-zinc-800">
                      Angular
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800">
                      React
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800">
                      Django
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800">
                      Flask
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800">
                      HTML5
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800">
                      CSS
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4">API Development</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-zinc-800">
                      Django
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800">
                      Flask
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800">
                      FastAPI
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800">
                      Node.js
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-zinc-800">
                      Python
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800">
                      JavaScript
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800">
                      TypeScript
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4">DevOps & Tools</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-zinc-800">
                      Git
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800">
                      MySQL
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800">
                      Docker
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800">
                      Linux
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4">Other Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-zinc-800">
                      UI/UX Design
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800">
                      RESTful APIs
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800">
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
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Featured Projects</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((project) => (
                <Card key={project} className="bg-black border-zinc-800 overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={`/placeholder.svg?height=192&width=384`}
                      alt={`Project ${project}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-bold mb-2">MyBudget</h3>
                    <p className="text-gray-400 mb-4">
                      A budgeting app to help you manage personal finances and track expenses.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="bg-zinc-800">
                        Ionic
                      </Badge>
                      <Badge variant="secondary" className="bg-zinc-800">
                        SQlite
                      </Badge>
                      <Badge variant="secondary" className="bg-zinc-800">
                        Angular
                      </Badge>
                      <Badge variant="secondary" className="bg-zinc-800">
                        Capacitor
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <a href="https://github.com/Ozauri0/MyBudget" target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="gap-1">
                          <Github className="h-4 w-4"/> Code
                        </Button>
                      </a>
                      <a href="https://drive.google.com/file/d/1vmzhouVOfmvh0CM3LvYGwwfjK5TsUofm/view?usp=sharing" target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="gap-1 bg-white text-black hover:bg-gray-200">
                          <ExternalLink className="h-4 w-4" /> Download
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center mt-12">
              <Button variant="outline">View All Projects</Button>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 px-4 bg-black">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Get In Touch</h2>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                ></textarea>
              </div>
              <Button className="w-full bg-white text-black hover:bg-gray-200">Send Message</Button>
            </form>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 bg-zinc-900 border-t border-zinc-800">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400">© {new Date().getFullYear()} | All Rights Reserved</p>
              <div className="flex gap-4 mt-4 md:mt-0">
                <Button size="icon" variant="ghost" className="rounded-full">
                  <Github className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="ghost" className="rounded-full">
                  <Linkedin className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="ghost" className="rounded-full">
                  <Mail className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

