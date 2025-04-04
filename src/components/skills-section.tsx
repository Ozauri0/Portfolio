'use client';

import { Card, CardContent } from "@/components/ui/card";
import { 
  Smartphone, 
  Globe, 
  Server, 
  Code, 
  Terminal, 
  PenTool,
  Database,
  Shield
} from "lucide-react";
import { translations } from "@/translations";
import { useLanguage } from "@/contexts/LanguageContext";
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
} from 'react-icons/si';

export default function SkillsSection() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <section className="py-20 px-4 bg-black">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-white">{t.skills.title}</h2>
        <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
          {language === 'es' 
            ? "Tecnologías y herramientas que utilizo para crear soluciones digitales efectivas y escalables." 
            : "Technologies and tools I use to create effective and scalable digital solutions."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Mobile Development */}
          <Card className="bg-zinc-900 border-zinc-800 hover:border-blue-500/30 transition-all duration-300">
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Smartphone className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white">{t.skills.mobile}</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <SiIonic className="text-[#3880FF] h-4 w-4" />
                  <span>Ionic Angular</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <SiCapacitor className="text-[#53B9FF] h-4 w-4" />
                  <span>Capacitor</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <SiAndroidstudio className="text-[#3DDC84] h-4 w-4" />
                  <span>Android Studio</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Web Development */}
          <Card className="bg-zinc-900 border-zinc-800 hover:border-green-500/30 transition-all duration-300">
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Globe className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white">{t.skills.web}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <SiAngular className="text-[#DD0031] h-4 w-4" />
                  <span>Angular</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <SiReact className="text-[#61DAFB] h-4 w-4" />
                  <span>React</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <SiDjango className="text-[#092E20] h-4 w-4" />
                  <span>Django</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <SiFlask className="text-white h-4 w-4" />
                  <span>Flask</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <SiHtml5 className="text-[#E34F26] h-4 w-4" />
                  <span>HTML5</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <SiCss3 className="text-[#1572B6] h-4 w-4" />
                  <span>CSS</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Development */}
          <Card className="bg-zinc-900 border-zinc-800 hover:border-purple-500/30 transition-all duration-300">
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Server className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white">{t.skills.api}</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <SiDjango className="text-[#092E20] h-4 w-4" />
                  <span>Django Rest Framework</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <SiFlask className="text-white h-4 w-4" />
                  <span>Flask</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <SiFastapi className="text-[#009688] h-4 w-4" />
                  <span>FastAPI</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <SiNodedotjs className="text-[#339933] h-4 w-4" />
                  <span>Node.js + Express</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Programming Languages */}
          <Card className="bg-zinc-900 border-zinc-800 hover:border-yellow-500/30 transition-all duration-300">
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Code className="h-5 w-5 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-white">{t.skills.languages}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <SiPython className="text-[#3776AB] h-4 w-4" />
                  <span>Python</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <SiJavascript className="text-[#F7DF1E] h-4 w-4" />
                  <span>JavaScript</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <SiTypescript className="text-[#3178C6] h-4 w-4" />
                  <span>TypeScript</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DevOps */}
          <Card className="bg-zinc-900 border-zinc-800 hover:border-teal-500/30 transition-all duration-300">
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-teal-500/10 rounded-lg">
                  <Terminal className="h-5 w-5 text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-white">{t.skills.devops}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <SiGit className="text-[#F05032] h-4 w-4" />
                  <span>Git</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <SiMysql className="text-[#4479A1] h-4 w-4" />
                  <span>MySQL</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <SiDocker className="text-[#2496ED] h-4 w-4" />
                  <span>Docker</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <SiLinux className="text-white h-4 w-4" />
                  <span>Linux</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <SiMongodb className="text-[#47A248] h-4 w-4" />
                  <span>MongoDB</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <SiSqlite className="text-[#003B57] h-4 w-4" />
                  <span>SQLite</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Other Skills */}
          <Card className="bg-zinc-900 border-zinc-800 hover:border-pink-500/30 transition-all duration-300">
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-pink-500/10 rounded-lg">
                  <PenTool className="h-5 w-5 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold text-white">{t.skills.other}</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <PenTool className="text-[#FF61F6] h-4 w-4" />
                  <span>UI/UX Design</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Server className="text-[#6C63FF] h-4 w-4" />
                  <span>RESTful APIs</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Database className="text-[#38B2AC] h-4 w-4" />
                  <span>Database Design</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Shield className="text-[#F56565] h-4 w-4" />
                  <span>Security Best Practices</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        
      </div>
    </section>
  );
}