'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-6 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-black/80 backdrop-blur-sm border-white/40 text-white hover:bg-zinc-800 hover:text-white hover:border-white">
            <Globe className="h-4 w-4" />
            <span>{language.toUpperCase()}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-700 text-white">
          <DropdownMenuItem 
            onClick={() => setLanguage('es')}
            className={`${language === 'es' ? 'bg-zinc-800' : ''} cursor-pointer text-white hover:bg-zinc-800 hover:text-white`}
          >
            Español
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setLanguage('en')}
            className={`${language === 'en' ? 'bg-zinc-800' : ''} cursor-pointer text-white hover:bg-zinc-800 hover:text-white`}
          >
            English
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}