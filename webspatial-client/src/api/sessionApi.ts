/**
 * Session REST API Client
 *
 * Handles HTTP requests to the backend session endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Session start request payload
 */
export interface SessionStartRequest {
  userId: string;
  tonePreset: 'Soft' | 'Friendly' | 'Analytical';
}

/**
 * Session start response
 */
export interface SessionStartResponse {
  mode: 'intake' | 'ongoing';
  memoryNarrative: string;
  appliedTone: string;
}

/**
 * Session end request payload
 */
export interface SessionEndRequest {
  sessionId: string;
  userId: string;
  transcript: string;
}

/**
 * Session end response
 */
export interface SessionEndResponse {
  success: boolean;
  savedAt: string;
}

/**
 * API Error interface
 */
export interface SessionApiError extends Error {
  statusCode?: number;
  response?: any;
}

/**
 * Create a SessionApiError
 */
function createSessionApiError(
  message: string,
  statusCode?: number,
  response?: any
): SessionApiError {
  const error = new Error(message) as SessionApiError;
  error.name = 'SessionApiError';
  error.statusCode = statusCode;
  error.response = response;
  return error;
}

/**
 * Start a new therapy session
 *
 * @param userId - User identifier
 * @param tonePreset - Selected tone for the session
 * @returns Session initialization data
 * @throws SessionApiError on failure
 */
export async function startSession(
  userId: string,
  tonePreset: 'Soft' | 'Friendly' | 'Analytical'
): Promise<SessionStartResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/session/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, tonePreset }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw createSessionApiError(
        errorData.message || `HTTP ${response.status}: Failed to start session`,
        response.status,
        errorData
      );
    }

    const data: SessionStartResponse = await response.json();
    console.log('[SessionAPI] Session started:', data);
    return data;
  } catch (error) {
    if ((error as SessionApiError).name === 'SessionApiError') {
      throw error;
    }
    // Network or other errors
    throw createSessionApiError(
      `Failed to connect to backend: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * End a therapy session
 *
 * @param sessionId - Session identifier
 * @param userId - User identifier
 * @param transcript - Session transcript
 * @returns Session save confirmation
 * @throws SessionApiError on failure
 */
export async function endSession(
  sessionId: string,
  userId: string,
  transcript: string
): Promise<SessionEndResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/session/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, userId, transcript }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw createSessionApiError(
        errorData.message || `HTTP ${response.status}: Failed to end session`,
        response.status,
        errorData
      );
    }

    const data: SessionEndResponse = await response.json();
    console.log('[SessionAPI] Session ended:', data);
    return data;
  } catch (error) {
    if ((error as SessionApiError).name === 'SessionApiError') {
      throw error;
    }
    // Network or other errors
    throw createSessionApiError(
      `Failed to connect to backend: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Check backend health
 *
 * @returns Health status
 */
export async function checkHealth(): Promise<{ status: string; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw createSessionApiError(
      `Backend health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
