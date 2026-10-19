// Experiencia profesional (fuente: perfil de LinkedIn). Las entradas "featured" son de desarrollo de software.
export interface ExperienceItem {
  role: { es: string; en: string };
  org: string;
  period: { es: string; en: string };
  place?: { es: string; en: string };
  points: { es: string[]; en: string[] };
  tech?: string[];
}

export const softwareExperience: ExperienceItem[] = [
  {
    role: { es: 'Desarrollador Full Stack', en: 'Full Stack developer' },
    org: 'GruasCares',
    period: { es: 'Actualidad', en: 'Present' },
    points: {
      es: [
        'Desarrollo una plataforma full stack para Grúas Cares: un nuevo landing page y paneles de gestión para clientes, mecánicos y administradores.',
        'Incluye solicitud de grúas para transporte, agendamiento de horas en la serviteca y gestión de personal y trabajos (quién realizó cada tarea).',
      ],
      en: [
        'I develop a full-stack platform for Grúas Cares: a new landing page and management panels for clients, mechanics and administrators.',
        'It covers tow-truck transport requests, workshop appointment scheduling, and staff and job management (who performed each task).',
      ],
    },
    tech: ['Next.js', 'TypeScript', 'Express', 'PostgreSQL'],
  },
  {
    role: { es: 'Desarrollador de software', en: 'Software developer' },
    org: 'MiPortalVentas',
    period: { es: '2025', en: '2025' },
    points: {
      es: ['Desarrollé un ERP para MiPortalVentas.'],
      en: ['Built an ERP for MiPortalVentas.'],
    },
  },
  {
    role: { es: 'Ayudante de Gestión de Datos y Monitoreo (PACE)', en: 'Data Management and Monitoring Assistant (PACE)' },
    org: 'Universidad Católica de Temuco',
    period: { es: 'sept. 2025 – actualidad', en: 'Sep 2025 – Present' },
    place: { es: 'Remoto', en: 'Remote' },
    points: {
      es: [
        'Por iniciativa propia, desarrollé una aplicación de escritorio con Electron y TypeScript que automatiza la descarga masiva de reportes de Moodle (web scraping), eliminando el proceso manual.',
        'La aplicación filtra los registros de docentes y ayudantes, y unifica los archivos de cada curso en un único Excel separado por hojas, listo para el análisis del equipo.',
      ],
      en: [
        'On my own initiative, I built a desktop app with Electron and TypeScript that automates the bulk download of Moodle reports (web scraping), removing the manual process.',
        'It filters out teacher and assistant records and merges each course\'s files into a single Excel workbook split by sheets, ready for the team to analyze.',
      ],
    },
    tech: ['TypeScript', 'Electron'],
  },
  {
    role: { es: 'Migración y procesamiento de datos académicos', en: 'Academic data migration and processing' },
    org: 'DGE, Universidad Católica de Temuco',
    period: { es: 'nov. – dic. 2025', en: 'Nov – Dec 2025' },
    place: { es: 'Remoto', en: 'Remote' },
    points: {
      es: [
        'Automaticé la publicación digital de las actas del congreso CLABES en Open Journal Systems (OJS) con dos scripts en Python.',
        'Uno separa, clasifica y renombra las actas en artículos individuales; el otro genera metadatos XML para la importación masiva, sin intervención manual.',
      ],
      en: [
        'Automated the digital publication of the CLABES congress proceedings on Open Journal Systems (OJS) with two Python scripts.',
        'One splits, classifies and renames the proceedings into individual articles; the other generates XML metadata for bulk import, with no manual work.',
      ],
    },
    tech: ['Python', 'XML'],
  },
];

export const otherExperience: ExperienceItem[] = [
  {
    role: { es: 'Práctica inicial, Tecnologías de la Información', en: 'Initial internship, Information Technology' },
    org: 'Gobierno Regional de La Araucanía',
    period: { es: 'dic. 2025 – ene. 2026', en: 'Dec 2025 – Jan 2026' },
    points: {
      es: ['Redes con switches Cisco, telefonía PBX, Active Directory, soporte de hardware y software, y soporte directo al Consejo Regional y al Gobernador.'],
      en: ['Networking with Cisco switches, PBX telephony, Active Directory, hardware and software support, and direct support for the Regional Council and the Governor.'],
    },
    tech: ['Cisco IOS', 'Active Directory'],
  },
  {
    role: { es: 'Jefe coordinador de procesos académicos, Programa Bachiller', en: 'Academic processes lead, Bachelor Program' },
    org: 'Universidad Católica de Temuco',
    period: { es: 'jul. – sept. 2026', en: 'Jul – Sep 2026' },
    points: {
      es: ['Dirigí a un equipo de 3 personas y tomé decisiones sobre la oferta académica, los cupos y la asignación de salas.'],
      en: ['Led a team of 3 and made decisions on the academic offering, section capacity and room assignment.'],
    },
  },
  {
    role: { es: 'Asistente coordinador de procesos académicos, Programa Bachiller', en: 'Academic processes assistant coordinator, Bachelor Program' },
    org: 'Universidad Católica de Temuco',
    period: { es: 'jul. – ago. 2025 y ene. – abr. 2026', en: 'Jul – Aug 2025 and Jan – Apr 2026' },
    points: {
      es: ['Apoyo en matrícula e inscripción de asignaturas, control de cupos y balanceo de secciones.'],
      en: ['Support for enrollment and course registration, capacity control and section balancing.'],
    },
  },
  {
    role: { es: 'Tutor E-learning', en: 'E-learning tutor' },
    org: 'CINAP',
    period: { es: 'dic. 2023 – actualidad', en: 'Dec 2023 – Present' },
    points: { es: [], en: [] },
  },
];
