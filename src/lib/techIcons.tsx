/**
 * Technology Icons Map
 * Mapeo de tecnologías con sus iconos y colores para los badges de proyectos
 */

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
  SiTailwindcss,
  SiC,
  SiCplusplus,
  SiDotnet,
  SiPostgresql,
  SiRedis,
  SiFirebase,
  SiSupabase,
  SiGraphql,
  SiAmazonwebservices,
  SiGooglecloud,
  SiVercel,
  SiNetlify,
  SiHeroku,
  SiNginx,
  SiApache,
  SiKubernetes,
  SiJenkins,
  SiGithubactions,
  SiTerraform,
  SiAnsible,
  SiVuedotjs,
  SiSvelte,
  SiNuxtdotjs,
  SiExpress,
  SiNestjs,
  SiSpring,
  SiLaravel,
  SiPhp,
  SiRuby,
  SiRubyonrails,
  SiGo,
  SiRust,
  SiSwift,
  SiKotlin,
  SiFlutter,
  SiDart,
  SiReactquery,
  SiRedux,
  SiPrisma,
  SiStripe,
  SiAuth0,
  SiJsonwebtokens,
  SiSocketdotio,
  SiElectron,
  SiTauri,
  SiVite,
  SiWebpack,
  SiEslint,
  SiPrettier,
  SiJest,
  SiCypress,
  SiStorybook,
  SiFigma,
  SiAdobexd,
  SiBootstrap,
  SiMui,
  SiChakraui,
  SiShadcnui,
  SiRadixui,
  SiFramer,
  SiGreensock,
  SiThreedotjs,
  SiOpenai,
  SiTensorflow,
  SiPytorch,
  SiScikitlearn,
  SiPandas,
  SiNumpy,
  SiJupyter,
  SiMarkdown,
  SiNotion,
  SiSlack,
  SiDiscord,
  SiGithub,
  SiGitlab,
  SiBitbucket,
  SiJira,
  SiTrello,
  SiLinkedin,
  SiWordpress,
  SiShopify,
  SiWoo,
  SiSanity,
  SiContentful,
  SiStrapi
} from 'react-icons/si';
import { IconType } from 'react-icons';

export interface TechInfo {
  name: string;
  icon: IconType;
  color: string;
}

// Mapa completo de tecnologías disponibles
export const techIconsMap: Record<string, TechInfo> = {
  // Frontend Frameworks
  react: { name: 'React', icon: SiReact, color: '#61DAFB' },
  nextjs: { name: 'Next.js', icon: SiNextdotjs, color: '#000000' },
  angular: { name: 'Angular', icon: SiAngular, color: '#DD0031' },
  vue: { name: 'Vue.js', icon: SiVuedotjs, color: '#4FC08D' },
  svelte: { name: 'Svelte', icon: SiSvelte, color: '#FF3E00' },
  nuxt: { name: 'Nuxt.js', icon: SiNuxtdotjs, color: '#00DC82' },
  
  // Mobile
  ionic: { name: 'Ionic', icon: SiIonic, color: '#3880FF' },
  capacitor: { name: 'Capacitor', icon: SiCapacitor, color: '#119EFF' },
  flutter: { name: 'Flutter', icon: SiFlutter, color: '#02569B' },
  reactnative: { name: 'React Native', icon: SiReact, color: '#61DAFB' },
  android: { name: 'Android Studio', icon: SiAndroidstudio, color: '#3DDC84' },
  swift: { name: 'Swift', icon: SiSwift, color: '#F05138' },
  kotlin: { name: 'Kotlin', icon: SiKotlin, color: '#7F52FF' },
  dart: { name: 'Dart', icon: SiDart, color: '#0175C2' },
  
  // CSS / Styling
  tailwindcss: { name: 'TailwindCSS', icon: SiTailwindcss, color: '#06B6D4' },
  css: { name: 'CSS3', icon: SiCss3, color: '#1572B6' },
  bootstrap: { name: 'Bootstrap', icon: SiBootstrap, color: '#7952B3' },
  mui: { name: 'Material UI', icon: SiMui, color: '#007FFF' },
  chakra: { name: 'Chakra UI', icon: SiChakraui, color: '#319795' },
  shadcn: { name: 'shadcn/ui', icon: SiShadcnui, color: '#000000' },
  radix: { name: 'Radix UI', icon: SiRadixui, color: '#161618' },
  framer: { name: 'Framer Motion', icon: SiFramer, color: '#0055FF' },
  gsap: { name: 'GSAP', icon: SiGreensock, color: '#88CE02' },
  
  // Backend Frameworks
  nodejs: { name: 'Node.js', icon: SiNodedotjs, color: '#339933' },
  express: { name: 'Express', icon: SiExpress, color: '#000000' },
  nestjs: { name: 'NestJS', icon: SiNestjs, color: '#E0234E' },
  django: { name: 'Django', icon: SiDjango, color: '#092E20' },
  flask: { name: 'Flask', icon: SiFlask, color: '#000000' },
  fastapi: { name: 'FastAPI', icon: SiFastapi, color: '#009688' },
  spring: { name: 'Spring', icon: SiSpring, color: '#6DB33F' },
  laravel: { name: 'Laravel', icon: SiLaravel, color: '#FF2D20' },
  rails: { name: 'Ruby on Rails', icon: SiRubyonrails, color: '#CC0000' },
  dotnet: { name: '.NET', icon: SiDotnet, color: '#512BD4' },
  
  // Languages
  javascript: { name: 'JavaScript', icon: SiJavascript, color: '#F7DF1E' },
  typescript: { name: 'TypeScript', icon: SiTypescript, color: '#3178C6' },
  python: { name: 'Python', icon: SiPython, color: '#3776AB' },
  php: { name: 'PHP', icon: SiPhp, color: '#777BB4' },
  ruby: { name: 'Ruby', icon: SiRuby, color: '#CC342D' },
  go: { name: 'Go', icon: SiGo, color: '#00ADD8' },
  rust: { name: 'Rust', icon: SiRust, color: '#000000' },
  c: { name: 'C', icon: SiC, color: '#A8B9CC' },
  cpp: { name: 'C++', icon: SiCplusplus, color: '#00599C' },
  csharp: { name: 'C#', icon: SiDotnet, color: '#239120' },
  html: { name: 'HTML5', icon: SiHtml5, color: '#E34F26' },
  
  // Databases
  mongodb: { name: 'MongoDB', icon: SiMongodb, color: '#47A248' },
  mysql: { name: 'MySQL', icon: SiMysql, color: '#4479A1' },
  postgresql: { name: 'PostgreSQL', icon: SiPostgresql, color: '#4169E1' },
  sqlite: { name: 'SQLite', icon: SiSqlite, color: '#003B57' },
  redis: { name: 'Redis', icon: SiRedis, color: '#DC382D' },
  firebase: { name: 'Firebase', icon: SiFirebase, color: '#FFCA28' },
  supabase: { name: 'Supabase', icon: SiSupabase, color: '#3ECF8E' },
  prisma: { name: 'Prisma', icon: SiPrisma, color: '#2D3748' },
  
  // APIs & Auth
  graphql: { name: 'GraphQL', icon: SiGraphql, color: '#E10098' },
  jwt: { name: 'JWT', icon: SiJsonwebtokens, color: '#000000' },
  auth0: { name: 'Auth0', icon: SiAuth0, color: '#EB5424' },
  stripe: { name: 'Stripe', icon: SiStripe, color: '#008CDD' },
  socketio: { name: 'Socket.io', icon: SiSocketdotio, color: '#010101' },
  
  // DevOps & Cloud
  docker: { name: 'Docker', icon: SiDocker, color: '#2496ED' },
  kubernetes: { name: 'Kubernetes', icon: SiKubernetes, color: '#326CE5' },
  aws: { name: 'AWS', icon: SiAmazonwebservices, color: '#FF9900' },
  gcp: { name: 'Google Cloud', icon: SiGooglecloud, color: '#4285F4' },
  azure: { name: 'Azure', icon: SiGooglecloud, color: '#0078D4' },
  vercel: { name: 'Vercel', icon: SiVercel, color: '#000000' },
  netlify: { name: 'Netlify', icon: SiNetlify, color: '#00C7B7' },
  heroku: { name: 'Heroku', icon: SiHeroku, color: '#430098' },
  nginx: { name: 'Nginx', icon: SiNginx, color: '#009639' },
  apache: { name: 'Apache', icon: SiApache, color: '#D22128' },
  linux: { name: 'Linux', icon: SiLinux, color: '#FCC624' },
  
  // CI/CD
  jenkins: { name: 'Jenkins', icon: SiJenkins, color: '#D24939' },
  githubactions: { name: 'GitHub Actions', icon: SiGithubactions, color: '#2088FF' },
  terraform: { name: 'Terraform', icon: SiTerraform, color: '#7B42BC' },
  ansible: { name: 'Ansible', icon: SiAnsible, color: '#EE0000' },
  
  // Tools
  git: { name: 'Git', icon: SiGit, color: '#F05032' },
  github: { name: 'GitHub', icon: SiGithub, color: '#181717' },
  gitlab: { name: 'GitLab', icon: SiGitlab, color: '#FC6D26' },
  bitbucket: { name: 'Bitbucket', icon: SiBitbucket, color: '#0052CC' },
  vite: { name: 'Vite', icon: SiVite, color: '#646CFF' },
  webpack: { name: 'Webpack', icon: SiWebpack, color: '#8DD6F9' },
  eslint: { name: 'ESLint', icon: SiEslint, color: '#4B32C3' },
  prettier: { name: 'Prettier', icon: SiPrettier, color: '#F7B93E' },
  
  // Testing
  jest: { name: 'Jest', icon: SiJest, color: '#C21325' },
  cypress: { name: 'Cypress', icon: SiCypress, color: '#17202C' },
  playwright: { name: 'Playwright', icon: SiJest, color: '#2EAD33' },
  storybook: { name: 'Storybook', icon: SiStorybook, color: '#FF4785' },
  
  // Desktop
  electron: { name: 'Electron', icon: SiElectron, color: '#47848F' },
  tauri: { name: 'Tauri', icon: SiTauri, color: '#FFC131' },
  
  // State Management
  redux: { name: 'Redux', icon: SiRedux, color: '#764ABC' },
  reactquery: { name: 'React Query', icon: SiReactquery, color: '#FF4154' },
  
  // Design
  figma: { name: 'Figma', icon: SiFigma, color: '#F24E1E' },
  adobexd: { name: 'Adobe XD', icon: SiAdobexd, color: '#FF61F6' },
  
  // 3D & Animation
  threejs: { name: 'Three.js', icon: SiThreedotjs, color: '#000000' },
  
  // AI/ML
  openai: { name: 'OpenAI', icon: SiOpenai, color: '#412991' },
  tensorflow: { name: 'TensorFlow', icon: SiTensorflow, color: '#FF6F00' },
  pytorch: { name: 'PyTorch', icon: SiPytorch, color: '#EE4C2C' },
  sklearn: { name: 'Scikit-learn', icon: SiScikitlearn, color: '#F7931E' },
  pandas: { name: 'Pandas', icon: SiPandas, color: '#150458' },
  numpy: { name: 'NumPy', icon: SiNumpy, color: '#013243' },
  jupyter: { name: 'Jupyter', icon: SiJupyter, color: '#F37626' },
  
  // CMS
  wordpress: { name: 'WordPress', icon: SiWordpress, color: '#21759B' },
  shopify: { name: 'Shopify', icon: SiShopify, color: '#7AB55C' },
  woocommerce: { name: 'WooCommerce', icon: SiWoo, color: '#96588A' },
  sanity: { name: 'Sanity', icon: SiSanity, color: '#F03E2F' },
  contentful: { name: 'Contentful', icon: SiContentful, color: '#2478CC' },
  strapi: { name: 'Strapi', icon: SiStrapi, color: '#2F2E8B' },
  
  // Communication
  slack: { name: 'Slack', icon: SiSlack, color: '#4A154B' },
  discord: { name: 'Discord', icon: SiDiscord, color: '#5865F2' },
  notion: { name: 'Notion', icon: SiNotion, color: '#000000' },
  jira: { name: 'Jira', icon: SiJira, color: '#0052CC' },
  trello: { name: 'Trello', icon: SiTrello, color: '#0052CC' },
  markdown: { name: 'Markdown', icon: SiMarkdown, color: '#000000' },
};

// Lista de tecnologías por categoría para el selector del admin
export const techCategories = {
  'Frontend': ['react', 'nextjs', 'angular', 'vue', 'svelte', 'nuxt'],
  'Mobile': ['ionic', 'capacitor', 'flutter', 'reactnative', 'android', 'swift', 'kotlin', 'dart'],
  'Styling': ['tailwindcss', 'css', 'bootstrap', 'mui', 'chakra', 'shadcn', 'radix', 'framer', 'gsap'],
  'Backend': ['nodejs', 'express', 'nestjs', 'django', 'flask', 'fastapi', 'spring', 'laravel', 'rails', 'dotnet'],
  'Languages': ['javascript', 'typescript', 'python', 'php', 'ruby', 'go', 'rust', 'c', 'cpp', 'csharp', 'html'],
  'Databases': ['mongodb', 'mysql', 'postgresql', 'sqlite', 'redis', 'firebase', 'supabase', 'prisma'],
  'APIs & Auth': ['graphql', 'jwt', 'auth0', 'stripe', 'socketio'],
  'DevOps & Cloud': ['docker', 'kubernetes', 'aws', 'gcp', 'azure', 'vercel', 'netlify', 'heroku', 'nginx', 'apache', 'linux'],
  'CI/CD': ['jenkins', 'githubactions', 'terraform', 'ansible'],
  'Tools': ['git', 'github', 'gitlab', 'bitbucket', 'vite', 'webpack', 'eslint', 'prettier'],
  'Testing': ['jest', 'cypress', 'playwright', 'storybook'],
  'Desktop': ['electron', 'tauri'],
  'AI/ML': ['openai', 'tensorflow', 'pytorch', 'sklearn', 'pandas', 'numpy', 'jupyter'],
  'CMS': ['wordpress', 'shopify', 'woocommerce', 'sanity', 'contentful', 'strapi'],
};

// Colores disponibles para el hover
export const hoverColors: Record<string, string> = {
  blue: 'hover:border-blue-500/30',
  green: 'hover:border-green-500/30',
  purple: 'hover:border-purple-500/30',
  red: 'hover:border-red-500/30',
  orange: 'hover:border-orange-500/30',
  yellow: 'hover:border-yellow-500/30',
  pink: 'hover:border-pink-500/30',
  cyan: 'hover:border-cyan-500/30',
  indigo: 'hover:border-indigo-500/30',
};

export default techIconsMap;
