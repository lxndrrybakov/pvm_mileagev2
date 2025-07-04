// Database interface for PostgreSQL
import type { PVM, PVMRun, Stream, StreamAssignment } from '../types';

interface QueryResponse<T = any> {
  data: T[] | null;
  error: Error | null;
}

// Helper function to make API calls
async function apiCall<T = any>(endpoint: string, options: RequestInit = {}): Promise<QueryResponse<T>> {
  try {
    const response = await fetch(`/api/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('API Error:', error);
    return { data: null, error: error as Error };
  }
}

// Database operations
export const db = {
  // PVMs
  async getPVMs() {
    return apiCall<PVM>('pvms');
  },

  async updatePVM(id: string, data: Partial<PVM>) {
    return apiCall<PVM>(`pvms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async insertPVM(data: Partial<PVM>) {
    return apiCall<PVM>('pvms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deletePVM(id: string) {
    return apiCall<void>(`pvms/${id}`, {
      method: 'DELETE',
    });
  },

  // PVM Runs
  async getPVMRuns() {
    return apiCall<PVMRun>('pvm-runs');
  },

  async insertPVMRun(data: Partial<PVMRun>) {
    return apiCall<PVMRun>('pvm-runs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deletePVMRuns(period?: string) {
    return apiCall<void>('pvm-runs', {
      method: 'DELETE',
      body: JSON.stringify({ period }),
    });
  },

  // Streams
  async getStreams() {
    return apiCall<Stream>('streams');
  },

  async updateStream(id: string, data: Partial<Stream>) {
    return apiCall<Stream>(`streams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Stream Assignments
  async getStreamAssignments(pvm_id: string) {
    return apiCall<StreamAssignment>(`stream-assignments?pvm_id=${pvm_id}`);
  },

  async insertStreamAssignment(data: Partial<StreamAssignment>) {
    return apiCall<StreamAssignment>('stream-assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};

// Raw SQL query function
export const query = async <T = any>(sql: string, params?: any[]): Promise<QueryResponse<T>> => {
  return apiCall<T>('query', {
    method: 'POST',
    body: JSON.stringify({ sql, params }),
  });
};