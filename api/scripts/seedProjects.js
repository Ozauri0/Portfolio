/**
 * Script para migrar los proyectos existentes a la base de datos
 * Ejecutar con: node scripts/seedProjects.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('../models/Project');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

const initialProjects = [
  {
    slug: 'learnpro',
    order: 1,
    visible: true,
    title: {
      en: 'LearnPro',
      es: 'LearnPro'
    },
    description: {
      en: 'A learning management platform that enables educators to create courses.',
      es: 'Una plataforma de gestión de aprendizaje que permite a los educadores crear cursos.'
    },
    image: '/learnpro.webp',
    links: {
      github: 'https://github.com/Ozauri0/app-empresariales',
      demo: 'https://lp.christianferrer.me'
    },
    demoType: 'demo',
    technologies: ['nextjs', 'tailwindcss', 'react', 'typescript', 'nodejs', 'mongodb'],
    hoverColor: 'blue'
  },
  {
    slug: 'mybudget',
    order: 2,
    visible: true,
    title: {
      en: 'MyBudget',
      es: 'MyBudget'
    },
    description: {
      en: 'A budgeting app to help you manage personal finances, track expenses and create goals.',
      es: 'Una aplicación de presupuesto para ayudarte a administrar finanzas personales y realizar seguimiento de gastos.'
    },
    image: '/MyBudget.webp',
    links: {
      github: 'https://github.com/Ozauri0/MyBudget',
      download: 'https://play.google.com/store/apps/details?id=com.mybudget.app&pcampaignid=web_share'
    },
    demoType: 'download',
    technologies: ['ionic', 'sqlite', 'angular', 'capacitor'],
    hoverColor: 'green'
  },
  {
    slug: 'educaplus',
    order: 3,
    visible: true,
    title: {
      en: 'Educa+',
      es: 'Educa+'
    },
    description: {
      en: 'A mobile course management platform that allows educators to create and manage courses.',
      es: 'Una plataforma de gestion de cursos online que permite a educadores crear y gestionar cursos.'
    },
    image: '/educa+.webp',
    links: {
      github: 'https://github.com/Ozauri0/educaplus'
    },
    demoType: null,
    technologies: ['ionic', 'angular', 'capacitor', 'nodejs', 'mysql'],
    hoverColor: 'purple'
  }
];

const seedProjects = async () => {
  try {
    await connectDB();
    
    // Check if projects already exist
    const existingCount = await Project.countDocuments();
    
    if (existingCount > 0) {
      console.log(`⚠️ Ya existen ${existingCount} proyectos en la base de datos.`);
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        rl.question('¿Deseas eliminar los proyectos existentes y crear los nuevos? (s/n): ', resolve);
      });
      rl.close();
      
      if (answer.toLowerCase() !== 's') {
        console.log('❌ Operación cancelada');
        process.exit(0);
      }
      
      await Project.deleteMany({});
      console.log('🗑️ Proyectos existentes eliminados');
    }
    
    // Insert initial projects
    const result = await Project.insertMany(initialProjects);
    console.log(`✅ ${result.length} proyectos creados exitosamente:`);
    result.forEach(p => console.log(`   - ${p.title.en} (${p.slug})`));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedProjects();
