/**
 * Projects Service
 * Servicio para gestionar proyectos desde el frontend
 */

import authService from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
  private getAuthHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

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
  // ADMIN METHODS
  // ==========================================

  /**
   * Get all projects including hidden (Admin)
   */
  async getAllProjects(): Promise<Project[]> {
    try {
      const response = await fetch(`${API_URL}/api/projects/admin/all`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Error al obtener proyectos');
      }

      const data = await response.json();
      return data.projects || [];
    } catch (error) {
      console.error('Error fetching all projects:', error);
      throw error;
    }
  }

  /**
   * Get single project by ID (Admin)
   */
  async getProjectById(id: string): Promise<Project | null> {
    try {
      const response = await fetch(`${API_URL}/api/projects/admin/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
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

  /**
   * Create new project (Admin)
   */
  async createProject(projectData: CreateProjectData): Promise<Project> {
    try {
      const response = await fetch(`${API_URL}/api/projects/admin`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear proyecto');
      }

      const data = await response.json();
      return data.project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  /**
   * Update project (Admin)
   */
  async updateProject(id: string, projectData: UpdateProjectData): Promise<Project> {
    try {
      const response = await fetch(`${API_URL}/api/projects/admin/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar proyecto');
      }

      const data = await response.json();
      return data.project;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  /**
   * Toggle project visibility (Admin)
   */
  async toggleVisibility(id: string): Promise<Project> {
    try {
      const response = await fetch(`${API_URL}/api/projects/admin/${id}/visibility`, {
        method: 'PATCH',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al cambiar visibilidad');
      }

      const data = await response.json();
      return data.project;
    } catch (error) {
      console.error('Error toggling visibility:', error);
      throw error;
    }
  }

  /**
   * Reorder projects (Admin)
   */
  async reorderProjects(projectOrders: { id: string; order: number }[]): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/projects/admin/reorder`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ projectOrders })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al reordenar proyectos');
      }
    } catch (error) {
      console.error('Error reordering projects:', error);
      throw error;
    }
  }

  /**
   * Delete project (Admin)
   */
  async deleteProject(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/projects/admin/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar proyecto');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  /**
   * Upload project image (Admin)
   * Returns the relative path to the uploaded image, e.g. /my-image.webp
   */
  async uploadImage(file: File): Promise<string> {
    const token = authService.getToken();
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/api/projects/admin/upload-image`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Error al subir la imagen');
    }

    const data = await response.json();
    // La API devuelve una ruta relativa (e.g. /public/filename.jpg).
    // Construimos la URL absoluta apuntando al servidor de la API,
    // que es quien tiene el archivo y lo sirve estáticamente.
    return `${API_URL}${data.path as string}`;
  }
}

const projectsService = new ProjectsService();
export default projectsService;
