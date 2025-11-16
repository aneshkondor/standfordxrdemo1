"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureUserDirectories = ensureUserDirectories;
exports.getUserDirectories = getUserDirectories;
exports.userDirectoryExists = userDirectoryExists;
exports.createDefaultProfile = createDefaultProfile;
exports.readUserProfile = readUserProfile;
exports.updateUserProfile = updateUserProfile;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
/**
 * Base directory for all user data storage
 */
const DATA_DIR = path_1.default.join(process.cwd(), 'data', 'users');
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
async function ensureUserDirectories(userId) {
    const userRoot = path_1.default.join(DATA_DIR, userId);
    const sessionsDir = path_1.default.join(userRoot, 'sessions');
    const summariesDir = path_1.default.join(userRoot, 'summaries');
    // Create all directories recursively
    await fs_1.promises.mkdir(userRoot, { recursive: true });
    await fs_1.promises.mkdir(sessionsDir, { recursive: true });
    await fs_1.promises.mkdir(summariesDir, { recursive: true });
    return {
        root: userRoot,
        sessions: sessionsDir,
        summaries: summariesDir,
    };
}
/**
 * Gets the paths for all user directories without creating them
 *
 * @param userId - The unique identifier for the user
 * @returns UserDirectories - Object containing paths to all user directories
 */
function getUserDirectories(userId) {
    const userRoot = path_1.default.join(DATA_DIR, userId);
    return {
        root: userRoot,
        sessions: path_1.default.join(userRoot, 'sessions'),
        summaries: path_1.default.join(userRoot, 'summaries'),
    };
}
/**
 * Checks if a user directory structure exists
 *
 * @param userId - The unique identifier for the user
 * @returns Promise<boolean> - True if the user directory exists, false otherwise
 */
async function userDirectoryExists(userId) {
    const userRoot = path_1.default.join(DATA_DIR, userId);
    try {
        await fs_1.promises.access(userRoot);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Creates a default user profile with initial preferences
 *
 * @param userId - The unique identifier for the user
 * @returns Promise<UserProfile> - The created user profile
 */
async function createDefaultProfile(userId) {
    // Ensure user directories exist
    const dirs = await ensureUserDirectories(userId);
    const profilePath = path_1.default.join(dirs.root, 'profile.json');
    // Create default profile
    const defaultProfile = {
        userId,
        createdAt: new Date().toISOString(),
        preferredTone: 'friendly',
    };
    // Write profile to file
    await fs_1.promises.writeFile(profilePath, JSON.stringify(defaultProfile, null, 2), 'utf-8');
    return defaultProfile;
}
/**
 * Reads a user profile from disk
 *
 * @param userId - The unique identifier for the user
 * @returns Promise<UserProfile | null> - The user profile, or null if it doesn't exist
 */
async function readUserProfile(userId) {
    const dirs = getUserDirectories(userId);
    const profilePath = path_1.default.join(dirs.root, 'profile.json');
    try {
        const fileContent = await fs_1.promises.readFile(profilePath, 'utf-8');
        return JSON.parse(fileContent);
    }
    catch (error) {
        // Profile doesn't exist or can't be read
        return null;
    }
}
/**
 * Updates user profile with new preference fields
 *
 * @param userId - The unique identifier for the user
 * @param updates - Partial profile data to update
 * @returns Promise<UserProfile> - The updated user profile
 */
async function updateUserProfile(userId, updates) {
    // Read existing profile or create default
    let profile = await readUserProfile(userId);
    if (!profile) {
        profile = await createDefaultProfile(userId);
    }
    // Merge updates with existing profile
    const updatedProfile = {
        ...profile,
        ...updates,
        userId: profile.userId, // Ensure userId is never changed
        createdAt: profile.createdAt, // Ensure createdAt is never changed
    };
    // Write updated profile to file
    const dirs = getUserDirectories(userId);
    const profilePath = path_1.default.join(dirs.root, 'profile.json');
    await fs_1.promises.writeFile(profilePath, JSON.stringify(updatedProfile, null, 2), 'utf-8');
    return updatedProfile;
}
//# sourceMappingURL=storage.js.map