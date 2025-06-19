// Analytics service for tracking clicks
const API_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_API_URL 
  : 'http://localhost:5000';

class AnalyticsService {
  // Track click on social media links
  async trackSocialClick(target: 'github' | 'linkedin' | 'email') {
    try {
      const response = await fetch(`${API_URL}/api/analytics/track-click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'social',
          target: target
        })
      });

      if (!response.ok) {
        console.warn('Failed to track social click:', target);
      }
    } catch (error) {
      console.warn('Error tracking social click:', error);
    }
  }

  // Track click on project links
  async trackProjectClick(target: 'learnpro' | 'mybudget' | 'educaplus') {
    try {
      const response = await fetch(`${API_URL}/api/analytics/track-click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'project',
          target: target
        })
      });

      if (!response.ok) {
        console.warn('Failed to track project click:', target);
      }
    } catch (error) {
      console.warn('Error tracking project click:', error);
    }
  }

  // Get public analytics stats
  async getStats() {
    try {
      const response = await fetch(`${API_URL}/api/analytics/stats`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics stats:', error);
      return {
        socialClicks: {
          github: 0,
          linkedin: 0,
          email: 0,
          total: 0
        },
        projectClicks: {
          learnpro: 0,
          mybudget: 0,
          educaplus: 0,
          total: 0
        }
      };
    }
  }
}

const analyticsService = new AnalyticsService();
export default analyticsService;
