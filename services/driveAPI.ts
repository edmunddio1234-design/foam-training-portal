import { AuthUser, DriveFile, APIResponse } from '../types';

const API_BASE = 'http://localhost:3001';

const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    ...options,
    credentials: 'include',
  };

  const response = await fetch(url, defaultOptions);

  if (response.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
};

export const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
};

export const authService = {
  register: (data: any): Promise<APIResponse<AuthUser>> => 
    fetchWithAuth('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  login: (data: any): Promise<{ message: string; user: AuthUser }> => 
    fetchWithAuth('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  me: (): Promise<{ user: AuthUser }> => 
    fetchWithAuth('/auth/me'),

  logout: (): Promise<{ message: string }> => 
    fetchWithAuth('/auth/logout', { method: 'POST' }),
};

export const fileService = {
  list: (): Promise<{ files: DriveFile[] }> => 
    fetchWithAuth('/files'),

  search: (query: string): Promise<{ files: DriveFile[] }> => 
    fetchWithAuth(`/files/search/${encodeURIComponent(query)}`),

  download: (fileId: string): Promise<DriveFile> => 
    fetchWithAuth(`/files/${fileId}`),

  upload: (formData: FormData): Promise<{ message: string; file: DriveFile }> => 
    fetchWithAuth('/files/upload', {
      method: 'POST',
      body: formData,
    }),

  delete: (fileId: string): Promise<{ message: string }> => 
    fetchWithAuth(`/files/${fileId}`, { method: 'DELETE' }),

  createFolder: (name: string, parentId?: string): Promise<DriveFile> => 
    fetchWithAuth('/files/create-folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, parentId }),
    }),
};