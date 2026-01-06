// ============================================
// FATHERHOOD TRACKER API SERVICE
// ============================================
// Connects to the FOAM Backend on Render
// ============================================

// Backend URL - Update this to your Render URL
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
  status: 'Active' | 'At Risk' | 'Graduated';
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
  graduationRate: string;
  averageProgress: string;
  totalModulesCompleted: number;
  todaysClass: { date: string; moduleId: number; topic: string } | null;
  nextClass: { date: string; moduleId: number; topic: string };
}

export interface AttendanceRecord {
  fatherId: string;
  fatherName: string;
  moduleId: number;
  moduleName: string;
  date: string;
  timestamp: string;
}

// ============================================
// API FUNCTIONS
// ============================================

export const fatherhoodApi = {
  // Health check
  async healthCheck(): Promise<{ status: string; sheetConfigured: boolean }> {
    const res = await fetch(`${API_BASE_URL}/api/fatherhood`);
    return res.json();
  },

  // Get all fathers
  async getFathers(): Promise<Father[]> {
    const res = await fetch(`${API_BASE_URL}/api/fatherhood/fathers`);
    const data = await res.json();
    return data.success ? data.data : [];
  },

  // Get single father by ID
  async getFather(id: string): Promise<Father | null> {
    const res = await fetch(`${API_BASE_URL}/api/fatherhood/fathers/${id}`);
    const data = await res.json();
    return data.success ? data.data : null;
  },

  // Search fathers by name or phone
  async searchFathers(query: string): Promise<Father[]> {
    const res = await fetch(`${API_BASE_URL}/api/fatherhood/fathers/search/${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.success ? data.data : [];
  },

  // Add new father
  async addFather(father: Partial<Father>): Promise<Father | null> {
    const res = await fetch(`${API_BASE_URL}/api/fatherhood/fathers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(father)
    });
    const data = await res.json();
    return data.success ? data.data : null;
  },

  // Update father info
  async updateFather(id: string, updates: Partial<Father>): Promise<Father | null> {
    const res = await fetch(`${API_BASE_URL}/api/fatherhood/fathers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    return data.success ? data.data : null;
  },

  // Check in father to a class
  async checkIn(fatherId: string, moduleId: number): Promise<{ success: boolean; message: string; alreadyCompleted?: boolean; data?: Father }> {
    const res = await fetch(`${API_BASE_URL}/api/fatherhood/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fatherId, moduleId })
    });
    return res.json();
  },

  // Get attendance history for a father
  async getAttendance(fatherId: string): Promise<AttendanceRecord[]> {
    const res = await fetch(`${API_BASE_URL}/api/fatherhood/attendance/${fatherId}`);
    const data = await res.json();
    return data.success ? data.data : [];
  },

  // Get dashboard stats
  async getStats(): Promise<Stats | null> {
    const res = await fetch(`${API_BASE_URL}/api/fatherhood/stats`);
    const data = await res.json();
    return data.success ? data.data : null;
  },

  // Get program modules
  async getModules(): Promise<Module[]> {
    const res = await fetch(`${API_BASE_URL}/api/fatherhood/modules`);
    const data = await res.json();
    return data.success ? data.data : [];
  },

  // Get class schedule
  async getSchedule(weeks: number = 52): Promise<{ date: string; moduleId: number; topic: string }[]> {
    const res = await fetch(`${API_BASE_URL}/api/fatherhood/schedule?weeks=${weeks}`);
    const data = await res.json();
    return data.success ? data.data : [];
  },

  // Get today's class info
  async getTodaysClass(): Promise<{ isClassDay: boolean; todaysClass: any; nextClass: any; location: any }> {
    const res = await fetch(`${API_BASE_URL}/api/fatherhood/schedule/today`);
    const data = await res.json();
    return data.success ? data.data : { isClassDay: false, todaysClass: null, nextClass: null, location: null };
  },

  // Bulk import fathers
  async importFathers(fathers: Partial<Father>[]): Promise<{ success: boolean; imported: number }> {
    const res = await fetch(`${API_BASE_URL}/api/fatherhood/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fathers })
    });
    return res.json();
  },

  // Export all data
  async exportData(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/fatherhood/export`);
    return res.json();
  }
};

export default fatherhoodApi;
