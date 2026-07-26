const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const TIMEOUT_MS = 15000;

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
}

export const api = {
  async get<T>(action: string): Promise<T> {
    if (!API_URL) throw new Error('Backend unavailable (API URL not configured).');
    const url = `${API_URL}?action=${action}`;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('GET', url);
    }
    
    try {
      const response = await fetchWithTimeout(url);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const result = await response.json();
      
      if (Array.isArray(result)) {
        return result as any; // The deployed backend sometimes returns raw arrays
      }
      
      if (result && typeof result === 'object' && result.success !== undefined && !result.success) {
        throw new Error(result.error || result.message || 'An error occurred');
      }
      
      return (result.data !== undefined ? result.data : result) as T;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
        throw new Error('Network error. Please check your connection.');
      }
      throw error;
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async post<T>(action: string, payload: any = {}): Promise<T> {
    if (!API_URL) throw new Error('Backend unavailable (API URL not configured).');
    
    const body = { action, ...payload };
    
    if (process.env.NODE_ENV === 'development') {
      console.log('POST', API_URL, body);
    }
    
    try {
      // Apps Script receives raw text when Content-Type is omitted or text/plain
      const response = await fetchWithTimeout(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const result: ApiResponse<T> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || result.message || 'An error occurred');
      }
      
      return (result.data !== undefined ? result.data : result) as T;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
        throw new Error('Network error. Please check your connection.');
      }
      throw error;
    }
  }
};
