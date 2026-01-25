// FOAM Fatherhood Tracker - API Service
// Connects to the backend at foamla-backend-2.onrender.com

const API_BASE_URL = 'https://foamla-backend-2.onrender.com';

// Types
export interface Father {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  completedModules: number[];
  joinedDate: string;
  status: 'Active' | 'At Risk' | 'Graduated' | 'Inactive';
  lastCheckIn: string | null;
}

export interface Module {
  id: number;
  title: string;
  description: string;
}

export interface Stats {
  totalFathers: number;
  graduated: number;
  active: number;
  atRisk: number;
  inactive: number;
  graduationRate: string;
  averageProgress: string;
  totalModulesCompleted: number;
  todaysClass: {
    date: string;
    moduleId: number;
    topic: string;
  } | null;
  nextClass: {
    date: string;
    moduleId: number;
    topic: string;
  };
}

export interface AttendanceRecord {
  id: string;
  fatherId: string;
  fatherName: string;
  moduleId: number;
  moduleName: string;
  date: string;
  time: string;
  method: string;
}

// API Functions
export const fatherhoodApi = {
  // Get all fathers
  async getFathers(): Promise<Father[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/fathers`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching fathers:', error);
      return [];
    }
  },

  // Get single father by ID
  async getFather(id: string): Promise<Father | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/fathers/${id}`);
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error fetching father:', error);
      return null;
    }
  },

  // Search fathers by name or phone
  async searchFathers(query: string): Promise<Father[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/fathers/search/${encodeURIComponent(query)}`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error searching fathers:', error);
      return [];
    }
  },

  // Add new father
  async addFather(father: { firstName: string; lastName?: string; phone?: string; email?: string }): Promise<Father | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/fathers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(father)
      });
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error adding father:', error);
      return null;
    }
  },

  // Update father
  async updateFather(id: string, updates: Partial<Father>): Promise<Father | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/fathers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error updating father:', error);
      return null;
    }
  },

  // Check in father to a class
  async checkIn(fatherId: string, moduleId: number): Promise<{ success: boolean; message: string; alreadyCompleted?: boolean; data?: Father }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fatherId, moduleId })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error during check-in:', error);
      return { success: false, message: 'Connection error' };
    }
  },

  // Get attendance history for a father
  async getAttendance(fatherId: string): Promise<AttendanceRecord[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/${fatherId}`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return [];
    }
  },

  // Get attendance for a specific date
  async getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/date/${date}`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching attendance by date:', error);
      return [];
    }
  },

  // Get dashboard stats
  async getStats(): Promise<Stats | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stats`);
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return null;
    }
  },

  // Get all modules
  async getModules(): Promise<Module[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/modules`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching modules:', error);
      return [];
    }
  },

  // Get class schedule
  async getSchedule(weeks: number = 52): Promise<{ date: string; moduleId: number; topic: string }[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/schedule?weeks=${weeks}`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching schedule:', error);
      return [];
    }
  },

  // Get today's class info
  async getTodaysClass(): Promise<{ isClassDay: boolean; todaysClass: any; nextClass: any; location: any } | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/schedule/today`);
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error fetching today\'s class:', error);
      return null;
    }
  },

  // Import fathers (bulk)
  async importFathers(fathers: Partial<Father>[]): Promise<{ success: boolean; imported: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fathers })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error importing fathers:', error);
      return { success: false, imported: 0 };
    }
  },

  // Export all data
  async exportData(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/export`);
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  },

  // Submit assessment
  async submitAssessment(assessment: {
    lessonId: number;
    lessonTitle: string;
    question1: boolean | null;
    question2: boolean | null;
    question3: boolean | null;
    challenges: string;
    fatherName: string;
    phone: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/fatherhood/assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...assessment,
          submittedAt: new Date().toISOString()
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error submitting assessment:', error);
      return { success: false, message: 'Connection error' };
    }
  },

  // Get assessments
  async getAssessments(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/fatherhood/assessments`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching assessments:', error);
      return [];
    }
  }
};

export default fatherhoodApi;
