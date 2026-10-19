/**
 * Projects Service
 * Servicio para gestionar proyectos desde el frontend
 */

import authService from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export interface ProjectLinks {
  github?: string | null;
  demo?: string | null;
  download?: string | null;
}

export interface Project {
  _id: string;
  slug: string;
  order: number;
  visible: boolean;
  title: {
    en: string;
    es: string;
  };
  description: {
    en: string;
    es: string;
  };
  image: string;
  links: ProjectLinks;
  demoType: 'demo' | 'download' | 'documentation' | null;
  technologies: string[];
  hoverColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  slug: string;
  order?: number;
  visible?: boolean;
  title: {
    en: string;
    es: string;
  };
  description: {
    en: string;
    es: string;
  };
  image: string;
  links?: ProjectLinks;
  demoType?: 'demo' | 'download' | 'documentation' | null;
  technologies?: string[];
  hoverColor?: string;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {}

class ProjectsService {
  // ==========================================
  // PUBLIC METHODS
  // ==========================================

  /**
   * Get all visible projects (for public display)
   */
  async getProjects(): Promise<Project[]> {
    try {
      const response = await fetch(`${API_URL}/api/projects`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Error al obtener proyectos');
      }

      const data = await response.json();
      return data.projects || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  /**
   * Get single project by slug
   */
  async getProjectBySlug(slug: string): Promise<Project | null> {
    try {
      const response = await fetch(`${API_URL}/api/projects/slug/${slug}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.project || null;
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  }

  // ==========================================
  // ADMIN METHODS (todas pasan por authService.request: token + refresh automático)
  // ==========================================

  /**
   * Get all projects including hidden (Admin)
   */
  async getAllProjects(): Promise<Project[]> {
    const data = await authService.request('/projects/admin/all');
    return data.projects || [];
  }

  /**
   * Get single project by ID (Admin)
   */
  async getProjectById(id: string): Promise<Project | null> {
    try {
      const data = await authService.request(`/projects/admin/${id}`);
      return data.project || null;
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  }

  /**
   * Create new project (Admin)
   */
  async createProject(projectData: CreateProjectData): Promise<Project> {
    const data = await authService.request('/projects/admin', {
      method: 'POST',
      body: JSON.stringify(projectData)
    });
    return data.project;
  }

  /**
   * Update project (Admin)
   */
  async updateProject(id: string, projectData: UpdateProjectData): Promise<Project> {
    const data = await authService.request(`/projects/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData)
    });
    return data.project;
  }

  /**
   * Toggle project visibility (Admin)
   */
  async toggleVisibility(id: string): Promise<Project> {
    const data = await authService.request(`/projects/admin/${id}/visibility`, { method: 'PATCH' });
    return data.project;
  }

  /**
   * Reorder projects (Admin)
   */
  async reorderProjects(projectOrders: { id: string; order: number }[]): Promise<void> {
    await authService.request('/projects/admin/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ projectOrders })
    });
  }

  /**
   * Delete project (Admin)
   */
  async deleteProject(id: string): Promise<void> {
    await authService.request(`/projects/admin/${id}`, { method: 'DELETE' });
  }

  /**
   * Upload project image (Admin)
   * Returns the image URL (API_URL + /public/<file>)
   */
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const data = await authService.request('/projects/admin/upload-image', {
      method: 'POST',
      body: formData
    });
    // La API devuelve una ruta relativa (e.g. /public/filename.jpg).
    // Construimos la URL absoluta apuntando al servidor de la API,
    // que es quien tiene el archivo y lo sirve estáticamente.
    return `${API_URL}${data.path as string}`;
  }
}

const projectsService = new ProjectsService();
export default projectsService;
