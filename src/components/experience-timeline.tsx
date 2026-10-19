'use client';

import { Code2, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import { otherExperience, softwareExperience, type ExperienceItem } from '@/data/experience';

function Entry({ item, featured }: { item: ExperienceItem; featured: boolean }) {
  const { language } = useLanguage();
  const Icon = featured ? Code2 : Briefcase;
  const points = item.points[language];

  return (
    <li className="rounded-xl border border-zinc-800 bg-black/50 p-5 transition-colors hover:border-blue-500/30">
      <div className="flex items-start gap-4">
        <div className={`mt-0.5 rounded-lg p-2 ${featured ? 'bg-blue-500/10' : 'bg-zinc-800'}`}>
          <Icon aria-hidden="true" className={`h-5 w-5 ${featured ? 'text-blue-400' : 'text-gray-400'}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <h4 className="font-semibold text-white">{item.role[language]}</h4>
            <p className="shrink-0 text-sm text-gray-400">{item.period[language]}</p>
          </div>
          <p className={`text-sm ${featured ? 'text-blue-400' : 'text-gray-400'}`}>
            {item.org}{item.place ? ` · ${item.place[language]}` : ''}
          </p>
          {points.length > 0 && (
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-gray-300 marker:text-zinc-600">
              {points.map((point) => <li key={point}>{point}</li>)}
            </ul>
          )}
          {item.tech && (
            <div className="mt-3 flex flex-wrap gap-2">
              {item.tech.map((name) => (
                <Badge key={name} variant="secondary" className="bg-zinc-800 text-white">{name}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export default function ExperienceTimeline() {
  const { language } = useLanguage();
  const t = translations[language].experience;

  return (
    <div className="mx-auto mt-16 max-w-3xl">
      <h3 className="mb-8 text-center text-2xl font-bold text-white md:text-3xl">{t.title}</h3>
      <ul className="space-y-4">
        {softwareExperience.map((item) => <Entry key={item.org + item.role.en} item={item} featured />)}
      </ul>

      <h4 className="mb-4 mt-12 text-lg font-semibold text-gray-300">{t.more}</h4>
      <ul className="space-y-3">
        {otherExperience.map((item) => <Entry key={item.org + item.role.en} item={item} featured={false} />)}
      </ul>
    </div>
  );
}
