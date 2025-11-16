export interface UserProfile {
    userId: string;
    createdAt: string;
    preferredTone?: string;
    preferences?: Record<string, any>;
}
export interface MemorySummary {
    narrative: string;
    keyThemes: string[];
    sessionSummaries: SessionSummary[];
    lastUpdated: string;
}
export interface SessionSummary {
    sessionId: string;
    timestamp: string;
    insights: string[];
    topics: string[];
}
/**
 * Ensures that the user directory structure exists
 * Creates: data/users/{userId}/, sessions/, summaries/
 */
export declare function ensureUserDirectories(userId: string): Promise<void>;
/**
 * Gets the path to a user's root directory
 */
export declare function getUserPath(userId: string): string;
/**
 * Gets the path to a user's sessions directory
 */
export declare function getSessionsPath(userId: string): string;
/**
 * Gets the path to a user's summaries directory
 */
export declare function getSummariesPath(userId: string): string;
/**
 * Creates a default user profile with initial preferences
 */
export declare function createDefaultProfile(userId: string, preferredTone?: string): Promise<UserProfile>;
/**
 * Reads a user profile from profile.json
 */
export declare function readUserProfile(userId: string): Promise<UserProfile | null>;
/**
 * Updates user preference fields in profile.json
 */
export declare function updateUserProfile(userId: string, updates: Partial<Omit<UserProfile, 'userId' | 'createdAt'>>): Promise<UserProfile>;
/**
 * Loads existing memory summary and narrative from memory.json
 */
export declare function loadMemorySummary(userId: string): Promise<MemorySummary | null>;
/**
 * Updates memory after sessions with new insights
 * Appends session summaries to memory structure
 */
export declare function updateMemoryAfterSession(userId: string, sessionSummary: SessionSummary, narrativeUpdate?: string): Promise<MemorySummary>;
/**
 * Returns narrative summary and key themes for AI context
 */
export declare function getMemoryContext(userId: string): Promise<{
    narrative: string;
    keyThemes: string[];
}>;
/**
 * Writes session transcript to markdown file
 * Filename format: YYYY-MM-DD_HH-mm-ss.md
 */
export declare function saveSessionTranscript(userId: string, conversationLog: string, timestamp?: Date): Promise<string>;
/**
 * Lists all session transcripts for a user
 */
export declare function listSessionTranscripts(userId: string): Promise<string[]>;
/**
 * Reads a specific session transcript
 */
export declare function readSessionTranscript(userId: string, filename: string): Promise<string | null>;
//# sourceMappingURL=storage.d.ts.map