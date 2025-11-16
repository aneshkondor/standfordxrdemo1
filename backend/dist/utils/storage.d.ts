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
export {};
//# sourceMappingURL=storage.d.ts.map