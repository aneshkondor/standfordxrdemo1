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
export {};
//# sourceMappingURL=storage.d.ts.map