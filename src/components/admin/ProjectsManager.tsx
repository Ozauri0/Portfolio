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
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gestión de Proyectos</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Nuevo Proyecto
          </Button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">
                  {editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                </h3>
                <Button type="button" variant="ghost" size="icon" onClick={resetForm}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="slug" className="text-white">Slug (identificador único)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="mi-proyecto"
                    className="bg-zinc-800 border-zinc-700 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="order" className="text-white">Orden</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              {/* Titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titleEn" className="text-white">Título (Inglés)</Label>
                  <Input
                    id="titleEn"
                    value={formData.title.en}
                    onChange={(e) => setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })}
                    placeholder="Project Title"
                    className="bg-zinc-800 border-zinc-700 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="titleEs" className="text-white">Título (Español)</Label>
                  <Input
                    id="titleEs"
                    value={formData.title.es}
                    onChange={(e) => setFormData({ ...formData, title: { ...formData.title, es: e.target.value } })}
                    placeholder="Título del Proyecto"
                    className="bg-zinc-800 border-zinc-700 text-white"
                    required
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="descEn" className="text-white">Descripción (Inglés)</Label>
                  <textarea
                    id="descEn"
                    value={formData.description.en}
                    onChange={(e) => setFormData({ ...formData, description: { ...formData.description, en: e.target.value } })}
                    placeholder="Project description..."
                    className="w-full h-24 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white resize-none"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="descEs" className="text-white">Descripción (Español)</Label>
                  <textarea
                    id="descEs"
                    value={formData.description.es}
                    onChange={(e) => setFormData({ ...formData, description: { ...formData.description, es: e.target.value } })}
                    placeholder="Descripción del proyecto..."
                    className="w-full h-24 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white resize-none"
                    required
                  />
                </div>
              </div>

              {/* Image */}
              <div>
                <Label className="text-white">Imagen</Label>
                <div className="flex gap-3 mt-1">
                  {/* Preview */}
                  {formData.image && (
                    <div className="w-24 h-16 rounded overflow-hidden flex-shrink-0 border border-zinc-700">
                      <img
                        src={formData.image.startsWith('/') ? `${process.env.NEXT_PUBLIC_FRONTEND_URL || ''}${formData.image}` : formData.image}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    {/* File upload button */}
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-white"
                        disabled={uploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        {uploadingImage ? 'Subiendo...' : 'Subir imagen'}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                      <span className="text-xs text-gray-400">JPG, PNG o WebP · máx 5 MB</span>
                    </div>
                    {/* Manual path fallback */}
                    <Input
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="/mi-proyecto.webp o https://..."
                      className="bg-zinc-800 border-zinc-700 text-white text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="space-y-4">
                <Label className="text-white">Enlaces</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="github" className="text-gray-400 text-sm">GitHub</Label>
                    <Input
                      id="github"
                      value={formData.links.github}
                      onChange={(e) => setFormData({ ...formData, links: { ...formData.links, github: e.target.value } })}
                      placeholder="https://github.com/..."
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="demo" className="text-gray-400 text-sm">Demo / Documentación</Label>
                    <Input
                      id="demo"
                      value={formData.links.demo}
                      onChange={(e) => setFormData({ ...formData, links: { ...formData.links, demo: e.target.value } })}
                      placeholder="https://..."
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="download" className="text-gray-400 text-sm">Descarga</Label>
                    <Input
                      id="download"
                      value={formData.links.download}
                      onChange={(e) => setFormData({ ...formData, links: { ...formData.links, download: e.target.value } })}
                      placeholder="https://play.google.com/..."
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Demo Type */}
              <div>
                <Label className="text-white">Tipo de botón secundario</Label>
                <div className="flex gap-2 mt-2">
                  {[
                    { value: null, label: 'Ninguno' },
                    { value: 'demo', label: 'Live Demo' },
                    { value: 'download', label: 'Descarga' },
                    { value: 'documentation', label: 'Documentación' }
                  ].map((option) => (
                    <Button
                      key={option.label}
                      type="button"
                      variant={formData.demoType === option.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({ ...formData, demoType: option.value as any })}
                      className={formData.demoType === option.value ? '' : 'text-white'}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Hover Color */}
              <div>
                <Label className="text-white">Color de hover</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.keys(hoverColors).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, hoverColor: color })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        formData.hoverColor === color ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{
                        backgroundColor: 
                          color === 'blue' ? '#3b82f6' :
                          color === 'green' ? '#22c55e' :
                          color === 'purple' ? '#a855f7' :
                          color === 'red' ? '#ef4444' :
                          color === 'orange' ? '#f97316' :
                          color === 'yellow' ? '#eab308' :
                          color === 'pink' ? '#ec4899' :
                          color === 'cyan' ? '#06b6d4' :
                          color === 'indigo' ? '#6366f1' : '#3b82f6'
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Technologies */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-white">Tecnologías</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTechSelector(!showTechSelector)}
                    className="text-white"
                  >
                    {showTechSelector ? 'Cerrar' : 'Seleccionar'}
                  </Button>
                </div>
                
                {/* Selected Technologies */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.technologies.map((techKey) => {
                    const tech = techIconsMap[techKey];
                    if (!tech) return null;
                    const Icon = tech.icon;
                    return (
                      <Badge
                        key={techKey}
                        variant="secondary"
                        className="bg-zinc-800 text-white cursor-pointer hover:bg-zinc-700"
                        onClick={() => toggleTech(techKey)}
                      >
                        <Icon className="h-4 w-4 mr-1" style={{ color: tech.color }} />
                        {tech.name}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    );
                  })}
                  {formData.technologies.length === 0 && (
                    <span className="text-gray-400 text-sm">No hay tecnologías seleccionadas</span>
                  )}
                </div>

                {/* Technology Selector */}
                {showTechSelector && (
                  <div className="bg-zinc-800 rounded-lg p-4 max-h-80 overflow-y-auto">
                    {Object.entries(techCategories).map(([category, techs]) => (
                      <div key={category} className="mb-2">
                        <button
                          type="button"
                          onClick={() => toggleCategory(category)}
                          className="flex items-center justify-between w-full text-left text-white font-medium py-2 hover:text-blue-400"
                        >
                          {category}
                          {expandedCategories.includes(category) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                        {expandedCategories.includes(category) && (
                          <div className="flex flex-wrap gap-2 pl-2 pb-2">
                            {techs.map((techKey) => {
                              const tech = techIconsMap[techKey];
                              if (!tech) return null;
                              const Icon = tech.icon;
                              const isSelected = formData.technologies.includes(techKey);
                              return (
                                <Badge
                                  key={techKey}
                                  variant="secondary"
                                  className={`cursor-pointer transition-all ${
                                    isSelected 
                                      ? 'bg-blue-600 text-white' 
                                      : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
                                  }`}
                                  onClick={() => toggleTech(techKey)}
                                >
                                  <Icon className="h-4 w-4 mr-1" style={{ color: isSelected ? 'white' : tech.color }} />
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

              {/* Visibility Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="visible"
                  checked={formData.visible}
                  onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="visible" className="text-white cursor-pointer">
                  Visible en el portfolio
                </Label>
              </div>

              {/* Submit Button */}
              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? 'Guardando...' : (editingProject ? 'Actualizar' : 'Crear')}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="text-white">
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="py-8 text-center">
              <p className="text-gray-400">No hay proyectos. ¡Crea el primero!</p>
            </CardContent>
          </Card>
        ) : (
          projects.map((project, index) => (
            <Card 
              key={project._id} 
              className={`bg-zinc-900 border-zinc-800 ${!project.visible ? 'opacity-50' : ''}`}
            >
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => moveProject(index, 'up')}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => moveProject(index, 'down')}
                      disabled={index === projects.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Project image */}
                  <div className="w-20 h-14 relative rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={project.image} 
                      alt={project.title.es}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Project info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {project.title.es}
                      </h3>
                      <span className="text-gray-500 text-sm">({project.slug})</span>
                      {!project.visible && (
                        <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-400">
                          Oculto
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm truncate">{project.description.es}</p>
                    <div className="flex gap-2 mt-1">
                      {project.technologies.slice(0, 4).map((techKey) => {
                        const tech = techIconsMap[techKey];
                        if (!tech) return null;
                        const Icon = tech.icon;
                        return (
                          <Icon key={techKey} className="h-4 w-4" style={{ color: tech.color }} />
                        );
                      })}
                      {project.technologies.length > 4 && (
                        <span className="text-gray-500 text-xs">+{project.technologies.length - 4}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {project.links.github && (
                      <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                        <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white">
                          <Github className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    {(project.links.demo || project.links.download) && (
                      <a href={project.links.demo || project.links.download || ''} target="_blank" rel="noopener noreferrer">
                        <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleToggleVisibility(project)}
                      className="text-gray-400 hover:text-white"
                    >
                      {project.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(project)}
                      className="text-gray-400 hover:text-blue-400"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(project)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
