const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const TIMEOUT_MS = 30000; // 30s — Apps Script can be slow on first cold start

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Special error thrown when a POST request fails at the network/CORS level.
 * Apps Script POST responses redirect through script.googleusercontent.com.
 * The browser may block reading the redirect response (CORS), but the write
 * already happened in the spreadsheet.  The service layer catches this error,
 * waits briefly, then re-fetches via GET to verify and recover the record.
 */
export class PostNetworkUncertainError extends Error {
  readonly action: string;
  constructor(action: string) {
    super(`APPS_SCRIPT_POST_UNCERTAIN:${action}`);
    this.name = 'PostNetworkUncertainError';
    this.action = action;
  }
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
    
    // Add timestamp to prevent browser/Next.js from caching the GET request
    const timestamp = Date.now();
    const url = `${API_URL}?action=${action}&t=${timestamp}`;

    if (process.env.NODE_ENV === 'development') {
      console.log('[API] GET', url);
    }

    try {
      // Force no-store cache
      const response = await fetchWithTimeout(url, { cache: 'no-store' });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();

      // Deployed backend sometimes returns raw arrays
      if (Array.isArray(result)) {
        return result as any;
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
      console.log('[API] POST', action, body);
    }

    try {
      // Using text/plain avoids the preflight OPTIONS request.
      // Apps Script still processes the body via e.postData.contents.
      const response = await fetchWithTimeout(API_URL, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        // Non-2xx but response was received — likely an Apps Script error response
        // (not a CORS redirect issue). Try to parse and surface the error.
        try {
          const errResult = await response.json();
          throw new Error(errResult.error || errResult.message || `Server error ${response.status}`);
        } catch {
          throw new Error(`Server error ${response.status}`);
        }
      }

      const result: ApiResponse<T> = await response.json();

      if (!result.success) {
        throw new Error(result.error || result.message || 'An error occurred');
      }

      return (result.data !== undefined ? result.data : result) as T;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // A network-level / CORS-redirect failure.
      // Apps Script may have ALREADY written the data before the response failed.
      // Throw PostNetworkUncertainError so the service layer can recover via GET.
      const isNetworkLevel =
        error.name === 'TypeError' ||
        error.message.includes('fetch') ||
        error.message.includes('NetworkError') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed');

      if (isNetworkLevel) {
        console.warn(`[API] POST ${action} — network-level error, write may have succeeded.`);
        throw new PostNetworkUncertainError(action);
      }

      throw error;
    }
  }
};
