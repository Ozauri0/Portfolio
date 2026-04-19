'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Eye, 
  EyeOff, 
  GripVertical,
  X,
  Save,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Github,
  Upload
} from 'lucide-react';
import projectsService, { Project, CreateProjectData } from '@/services/projectsService';
import { techIconsMap, techCategories, hoverColors } from '@/lib/techIcons';

interface ProjectFormData {
  slug: string;
  order: number;
  visible: boolean;
  title: { en: string; es: string };
  description: { en: string; es: string };
  image: string;
  links: { github: string; demo: string; download: string };
  demoType: 'demo' | 'download' | 'documentation' | null;
  technologies: string[];
  hoverColor: string;
}

const emptyFormData: ProjectFormData = {
  slug: '',
  order: 0,
  visible: true,
  title: { en: '', es: '' },
  description: { en: '', es: '' },
  image: '',
  links: { github: '', demo: '', download: '' },
  demoType: null,
  technologies: [],
  hoverColor: 'blue'
};

export default function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>(emptyFormData);
  const [saving, setSaving] = useState(false);
  
  // Tech selector state
  const [showTechSelector, setShowTechSelector] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsService.getAllProjects();
      setProjects(data);
    } catch (err) {
      setError('Error al cargar proyectos');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(emptyFormData);
    setEditingProject(null);
    setShowForm(false);
    setShowTechSelector(false);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      slug: project.slug,
      order: project.order,
      visible: project.visible,
      title: { ...project.title },
      description: { ...project.description },
      image: project.image,
      links: {
        github: project.links.github || '',
        demo: project.links.demo || '',
        download: project.links.download || ''
      },
      demoType: project.demoType,
      technologies: [...project.technologies],
      hoverColor: project.hoverColor
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const projectData: CreateProjectData = {
        slug: formData.slug,
        order: formData.order,
        visible: formData.visible,
        title: formData.title,
        description: formData.description,
        image: formData.image,
        links: {
          github: formData.links.github || null,
          demo: formData.links.demo || null,
          download: formData.links.download || null
        },
        demoType: formData.demoType,
        technologies: formData.technologies,
        hoverColor: formData.hoverColor
      };

      if (editingProject) {
        await projectsService.updateProject(editingProject._id, projectData);
        setSuccess('Proyecto actualizado exitosamente');
      } else {
        await projectsService.createProject(projectData);
        setSuccess('Proyecto creado exitosamente');
      }

      await loadProjects();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Error al guardar proyecto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (project: Project) => {
    if (!confirm(`¿Estás seguro de eliminar "${project.title.es}"?`)) return;

    try {
      await projectsService.deleteProject(project._id);
      setSuccess('Proyecto eliminado');
      await loadProjects();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar proyecto');
    }
  };

  const handleToggleVisibility = async (project: Project) => {
    try {
      await projectsService.toggleVisibility(project._id);
      await loadProjects();
    } catch (err: any) {
      setError(err.message || 'Error al cambiar visibilidad');
    }
  };

  const toggleTech = (techKey: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.includes(techKey)
        ? prev.technologies.filter(t => t !== techKey)
        : [...prev.technologies, techKey]
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setError('');
    try {
      const imagePath = await projectsService.uploadImage(file);
      setFormData(prev => ({ ...prev, image: imagePath }));
    } catch (err: any) {
      setError(err.message || 'Error al subir la imagen');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const moveProject = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= projects.length) return;

    const newProjects = [...projects];
    [newProjects[index], newProjects[newIndex]] = [newProjects[newIndex], newProjects[index]];
    
    const projectOrders = newProjects.map((p, i) => ({ id: p._id, order: i }));
    
    try {
      await projectsService.reorderProjects(projectOrders);
      await loadProjects();
    } catch (err: any) {
      setError('Error al reordenar proyectos');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Proyectos</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{projects.length} proyecto{projects.length !== 1 ? 's' : ''} en total</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Nuevo Proyecto
          </Button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-start gap-3 bg-red-950/50 border border-red-800/60 text-red-300 px-4 py-3 rounded-lg text-sm">
          <X className="h-4 w-4 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-start gap-3 bg-green-950/50 border border-green-800/60 text-green-300 px-4 py-3 rounded-lg text-sm">
          <Save className="h-4 w-4 mt-0.5 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit}>
              {/* Form header */}
              <div className="flex justify-between items-center py-5 border-b border-zinc-800 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {editingProject ? 'Editar proyecto' : 'Nuevo proyecto'}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {editingProject ? `Modificando: ${editingProject.title.es}` : 'Completa los campos para agregar un proyecto'}
                  </p>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={resetForm} className="text-zinc-400 hover:text-white">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-8">

                {/* ── Sección: Identificación ── */}
                <section className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Identificación</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="slug" className="text-zinc-300 text-sm">Slug <span className="text-zinc-500">(identificador único)</span></Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                        placeholder="mi-proyecto"
                        className="bg-zinc-800/80 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="order" className="text-zinc-300 text-sm">Orden</Label>
                      <Input
                        id="order"
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                        className="bg-zinc-800/80 border-zinc-700 text-white focus:border-blue-500"
                      />
                    </div>
                  </div>
                </section>

                {/* ── Sección: Contenido ── */}
                <section className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Contenido</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="titleEn" className="text-zinc-300 text-sm">Título <span className="text-zinc-500">EN</span></Label>
                      <Input
                        id="titleEn"
                        value={formData.title.en}
                        onChange={(e) => setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })}
                        placeholder="Project Title"
                        className="bg-zinc-800/80 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="titleEs" className="text-zinc-300 text-sm">Título <span className="text-zinc-500">ES</span></Label>
                      <Input
                        id="titleEs"
                        value={formData.title.es}
                        onChange={(e) => setFormData({ ...formData, title: { ...formData.title, es: e.target.value } })}
                        placeholder="Título del Proyecto"
                        className="bg-zinc-800/80 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="descEn" className="text-zinc-300 text-sm">Descripción <span className="text-zinc-500">EN</span></Label>
                      <textarea
                        id="descEn"
                        value={formData.description.en}
                        onChange={(e) => setFormData({ ...formData, description: { ...formData.description, en: e.target.value } })}
                        placeholder="Project description..."
                        className="w-full h-24 px-3 py-2 bg-zinc-800/80 border border-zinc-700 rounded-md text-white placeholder:text-zinc-600 resize-none focus:outline-none focus:border-blue-500 text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="descEs" className="text-zinc-300 text-sm">Descripción <span className="text-zinc-500">ES</span></Label>
                      <textarea
                        id="descEs"
                        value={formData.description.es}
                        onChange={(e) => setFormData({ ...formData, description: { ...formData.description, es: e.target.value } })}
                        placeholder="Descripción del proyecto..."
                        className="w-full h-24 px-3 py-2 bg-zinc-800/80 border border-zinc-700 rounded-md text-white placeholder:text-zinc-600 resize-none focus:outline-none focus:border-blue-500 text-sm"
                        required
                      />
                    </div>
                  </div>
                </section>

                {/* ── Sección: Imagen ── */}
                <section className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Imagen</h4>
                  <div className="flex gap-4 items-start">
                    {/* Preview */}
                    <div className={`w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${formData.image ? 'border-zinc-700' : 'border-dashed border-zinc-700'} bg-zinc-800 flex items-center justify-center`}>
                      {formData.image ? (
                        <img
                          src={formData.image.startsWith('/') ? `${process.env.NEXT_PUBLIC_FRONTEND_URL || ''}${formData.image}` : formData.image}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Upload className="h-6 w-6 text-zinc-600" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-white border-zinc-600 hover:bg-zinc-800 gap-2"
                          disabled={uploadingImage}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-3.5 w-3.5" />
                          {uploadingImage ? 'Subiendo...' : 'Subir archivo'}
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                        />
                        <span className="text-xs text-zinc-500">JPG, PNG o WebP · máx 5 MB</span>
                      </div>
                      <Input
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="/mi-proyecto.webp o https://..."
                        className="bg-zinc-800/80 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-blue-500 text-sm"
                        required
                      />
                    </div>
                  </div>
                </section>

                {/* ── Sección: Enlaces ── */}
                <section className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Enlaces</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="github" className="text-zinc-400 text-sm flex items-center gap-1.5">
                        <Github className="h-3.5 w-3.5" /> GitHub
                      </Label>
                      <Input
                        id="github"
                        value={formData.links.github}
                        onChange={(e) => setFormData({ ...formData, links: { ...formData.links, github: e.target.value } })}
                        placeholder="https://github.com/..."
                        className="bg-zinc-800/80 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="demo" className="text-zinc-400 text-sm flex items-center gap-1.5">
                        <ExternalLink className="h-3.5 w-3.5" /> Demo / Docs
                      </Label>
                      <Input
                        id="demo"
                        value={formData.links.demo}
                        onChange={(e) => setFormData({ ...formData, links: { ...formData.links, demo: e.target.value } })}
                        placeholder="https://..."
                        className="bg-zinc-800/80 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="download" className="text-zinc-400 text-sm flex items-center gap-1.5">
                        <ChevronDown className="h-3.5 w-3.5" /> Descarga
                      </Label>
                      <Input
                        id="download"
                        value={formData.links.download}
                        onChange={(e) => setFormData({ ...formData, links: { ...formData.links, download: e.target.value } })}
                        placeholder="https://play.google.com/..."
                        className="bg-zinc-800/80 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  {/* Demo Type */}
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-sm">Botón secundario</Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: null, label: 'Ninguno' },
                        { value: 'demo', label: 'Live Demo' },
                        { value: 'download', label: 'Descarga' },
                        { value: 'documentation', label: 'Documentación' }
                      ].map((option) => (
                        <button
                          key={option.label}
                          type="button"
                          onClick={() => setFormData({ ...formData, demoType: option.value as any })}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            formData.demoType === option.value
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {/* ── Sección: Apariencia ── */}
                <section className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Apariencia</h4>

                  {/* Hover Color */}
                  <div className="space-y-2">
                    <Label className="text-zinc-300 text-sm">Color de acento</Label>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(hoverColors).map((color) => {
                        const colorHex: Record<string, string> = {
                          blue: '#3b82f6', green: '#22c55e', purple: '#a855f7', red: '#ef4444',
                          orange: '#f97316', yellow: '#eab308', pink: '#ec4899', cyan: '#06b6d4', indigo: '#6366f1'
                        };
                        const isActive = formData.hoverColor === color;
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setFormData({ ...formData, hoverColor: color })}
                            title={color}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-all ${
                              isActive
                                ? 'border-white/40 bg-white/10 text-white'
                                : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500'
                            }`}
                          >
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colorHex[color] ?? colorHex.blue }} />
                            <span className="capitalize">{color}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Technologies */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-zinc-300 text-sm">Tecnologías <span className="text-zinc-500">({formData.technologies.length})</span></Label>
                      <button
                        type="button"
                        onClick={() => setShowTechSelector(!showTechSelector)}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {showTechSelector ? 'Cerrar selector' : '+ Agregar'}
                      </button>
                    </div>

                    {/* Selected */}
                    <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
                      {formData.technologies.map((techKey) => {
                        const tech = techIconsMap[techKey];
                        if (!tech) return null;
                        const Icon = tech.icon;
                        return (
                          <Badge
                            key={techKey}
                            variant="secondary"
                            className="bg-zinc-800 text-zinc-200 cursor-pointer hover:bg-zinc-700 border border-zinc-700 gap-1 pr-1.5"
                            onClick={() => toggleTech(techKey)}
                          >
                            <Icon className="h-3.5 w-3.5" style={{ color: tech.color }} />
                            {tech.name}
                            <X className="h-3 w-3 text-zinc-500 hover:text-white" />
                          </Badge>
                        );
                      })}
                      {formData.technologies.length === 0 && (
                        <span className="text-zinc-600 text-xs italic">Sin tecnologías — usa el selector</span>
                      )}
                    </div>

                    {/* Selector */}
                    {showTechSelector && (
                      <div className="bg-zinc-800/80 border border-zinc-700 rounded-lg p-3 max-h-72 overflow-y-auto">
                        {Object.entries(techCategories).map(([category, techs]) => (
                          <div key={category} className="mb-1">
                            <button
                              type="button"
                              onClick={() => toggleCategory(category)}
                              className="flex items-center justify-between w-full text-left text-zinc-300 text-sm font-medium py-1.5 px-1 hover:text-white rounded"
                            >
                              {category}
                              {expandedCategories.includes(category)
                                ? <ChevronUp className="h-3.5 w-3.5 text-zinc-500" />
                                : <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />}
                            </button>
                            {expandedCategories.includes(category) && (
                              <div className="flex flex-wrap gap-1.5 pl-2 pb-2 pt-1">
                                {techs.map((techKey) => {
                                  const tech = techIconsMap[techKey];
                                  if (!tech) return null;
                                  const Icon = tech.icon;
                                  const isSelected = formData.technologies.includes(techKey);
                                  return (
                                    <Badge
                                      key={techKey}
                                      variant="secondary"
                                      className={`cursor-pointer transition-all border ${
                                        isSelected
                                          ? 'bg-blue-600/20 text-blue-300 border-blue-500/50'
                                          : 'bg-zinc-700/50 text-zinc-300 border-zinc-600 hover:bg-zinc-700'
                                      }`}
                                      onClick={() => toggleTech(techKey)}
                                    >
                                      <Icon className="h-3.5 w-3.5 mr-1" style={{ color: isSelected ? undefined : tech.color }} />
                                      {tech.name}
                                    </Badge>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                {/* ── Footer: Visibilidad + Acciones ── */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                  <label htmlFor="visible" className="flex items-center gap-2.5 cursor-pointer group">
                    <div className={`relative w-10 h-5 rounded-full transition-colors ${formData.visible ? 'bg-blue-600' : 'bg-zinc-700'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.visible ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                    <input
                      type="checkbox"
                      id="visible"
                      checked={formData.visible}
                      onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                      className="sr-only"
                    />
                    <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                      {formData.visible ? 'Visible en el portfolio' : 'Oculto en el portfolio'}
                    </span>
                  </label>

                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" onClick={resetForm} className="text-zinc-400 hover:text-white">
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={saving} className="gap-2 bg-blue-600 hover:bg-blue-700 min-w-[120px]">
                      <Save className="h-4 w-4" />
                      {saving ? 'Guardando...' : (editingProject ? 'Actualizar' : 'Crear proyecto')}
                    </Button>
                  </div>
                </div>

              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Projects List */}
      <div className="space-y-3">
        {projects.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="py-12 text-center">
              <Plus className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500">No hay proyectos todavía.</p>
              <p className="text-zinc-600 text-sm mt-1">Crea el primero con el botón de arriba.</p>
            </CardContent>
          </Card>
        ) : (
          projects.map((project, index) => (
            <Card
              key={project._id}
              className={`bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all ${!project.visible ? 'opacity-50' : ''}`}
            >
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3">
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveProject(index, 'up')}
                      disabled={index === 0}
                      className="p-0.5 rounded text-zinc-600 hover:text-zinc-300 disabled:opacity-20 transition-colors"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => moveProject(index, 'down')}
                      disabled={index === projects.length - 1}
                      className="p-0.5 rounded text-zinc-600 hover:text-zinc-300 disabled:opacity-20 transition-colors"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Project image */}
                  <div className="w-16 h-11 rounded-md overflow-hidden flex-shrink-0 bg-zinc-800">
                    <img
                      src={project.image}
                      alt={project.title.es}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Project info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-medium text-sm leading-tight truncate">{project.title.es}</span>
                      <span className="text-zinc-600 text-xs font-mono">{project.slug}</span>
                      {!project.visible && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                          Oculto
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-500 text-xs mt-0.5 truncate">{project.description.es}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {project.technologies.slice(0, 6).map((techKey) => {
                        const tech = techIconsMap[techKey];
                        if (!tech) return null;
                        const Icon = tech.icon;
                        return <Icon key={techKey} className="h-3.5 w-3.5" style={{ color: tech.color }} />;
                      })}
                      {project.technologies.length > 6 && (
                        <span className="text-zinc-600 text-xs">+{project.technologies.length - 6}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {project.links.github && (
                      <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                        <button className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors">
                          <Github className="h-4 w-4" />
                        </button>
                      </a>
                    )}
                    {(project.links.demo || project.links.download) && (
                      <a href={project.links.demo || project.links.download || ''} target="_blank" rel="noopener noreferrer">
                        <button className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors">
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </a>
                    )}
                    <button
                      onClick={() => handleToggleVisibility(project)}
                      className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                      title={project.visible ? 'Ocultar' : 'Mostrar'}
                    >
                      {project.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(project)}
                      className="p-1.5 rounded-md text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(project)}
                      className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
