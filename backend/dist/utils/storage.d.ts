/**
 * Interface for directory structure paths
 */
interface UserDirectories {
    root: string;
    sessions: string;
    summaries: string;
}
/**
 * Ensures that all required directories exist for a given user
 * Creates the directory structure recursively if it doesn't exist:
 * - data/users/{userId}/
 * - data/users/{userId}/sessions/
 * - data/users/{userId}/summaries/
 *
 * @param userId - The unique identifier for the user
 * @returns Promise<UserDirectories> - Object containing paths to all user directories
 */
export declare function ensureUserDirectories(userId: string): Promise<UserDirectories>;
/**
 * Gets the paths for all user directories without creating them
 *
 * @param userId - The unique identifier for the user
 * @returns UserDirectories - Object containing paths to all user directories
 */
export declare function getUserDirectories(userId: string): UserDirectories;
/**
 * Checks if a user directory structure exists
 *
 * @param userId - The unique identifier for the user
 * @returns Promise<boolean> - True if the user directory exists, false otherwise
 */
export declare function userDirectoryExists(userId: string): Promise<boolean>;
/**
 * Interface for user profile data
 */
export interface UserProfile {
    userId: string;
    createdAt: string;
    preferredTone?: 'professional' | 'casual' | 'friendly';
    [key: string]: unknown;
}
/**
 * Creates a default user profile with initial preferences
 *
 * @param userId - The unique identifier for the user
 * @returns Promise<UserProfile> - The created user profile
 */
export declare function createDefaultProfile(userId: string): Promise<UserProfile>;
/**
 * Reads a user profile from disk
 *
 * @param userId - The unique identifier for the user
 * @returns Promise<UserProfile | null> - The user profile, or null if it doesn't exist
 */
export declare function readUserProfile(userId: string): Promise<UserProfile | null>;
/**
 * Updates user profile with new preference fields
 *
 * @param userId - The unique identifier for the user
 * @param updates - Partial profile data to update
 * @returns Promise<UserProfile> - The updated user profile
 */
export declare function updateUserProfile(userId: string, updates: Partial<Omit<UserProfile, 'userId' | 'createdAt'>>): Promise<UserProfile>;
/**
 * Interface for session summary entries
 */
export interface SessionSummary {
    timestamp: string;
    summary: string;
    insights?: string[];
}
/**
 * Interface for user memory data
 */
export interface MemorySummary {
    userId: string;
    narrative: string;
    keyThemes: string[];
    sessionSummaries: SessionSummary[];
    lastUpdated: string;
}
/**
 * Loads existing memory summary and narrative from disk
 *
 * @param userId - The unique identifier for the user
 * @returns Promise<MemorySummary | null> - The memory summary, or null if it doesn't exist
 */
export declare function loadMemorySummary(userId: string): Promise<MemorySummary | null>;
/**
 * Creates a default memory structure for a new user
 *
 * @param userId - The unique identifier for the user
 * @returns Promise<MemorySummary> - The created memory summary
 */
export declare function createDefaultMemory(userId: string): Promise<MemorySummary>;
/**
 * Updates memory after sessions with new insights
 * Appends session summaries to the memory structure
 *
 * @param userId - The unique identifier for the user
 * @param sessionSummary - The session summary to append
 * @param newNarrative - Optional updated narrative summary
 * @param newThemes - Optional new key themes to add
 * @returns Promise<MemorySummary> - The updated memory summary
 */
export declare function updateMemory(userId: string, sessionSummary: SessionSummary, newNarrative?: string, newThemes?: string[]): Promise<MemorySummary>;
/**
 * Returns narrative summary and key themes for AI context
 *
 * @param userId - The unique identifier for the user
 * @returns Promise<{ narrative: string; keyThemes: string[] } | null> - Context data or null
 */
export declare function getMemoryContext(userId: string): Promise<{
    narrative: string;
    keyThemes: string[];
} | null>;
export {};
//# sourceMappingURL=storage.d.ts.map