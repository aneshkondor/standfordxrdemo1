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
exports.loadMemorySummary = loadMemorySummary;
exports.createDefaultMemory = createDefaultMemory;
exports.updateMemory = updateMemory;
exports.getMemoryContext = getMemoryContext;
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
/**
 * Loads existing memory summary and narrative from disk
 *
 * @param userId - The unique identifier for the user
 * @returns Promise<MemorySummary | null> - The memory summary, or null if it doesn't exist
 */
async function loadMemorySummary(userId) {
    const dirs = getUserDirectories(userId);
    const memoryPath = path_1.default.join(dirs.root, 'memory.json');
    try {
        const fileContent = await fs_1.promises.readFile(memoryPath, 'utf-8');
        return JSON.parse(fileContent);
    }
    catch (error) {
        // Memory doesn't exist or can't be read
        return null;
    }
}
/**
 * Creates a default memory structure for a new user
 *
 * @param userId - The unique identifier for the user
 * @returns Promise<MemorySummary> - The created memory summary
 */
async function createDefaultMemory(userId) {
    // Ensure user directories exist
    const dirs = await ensureUserDirectories(userId);
    const memoryPath = path_1.default.join(dirs.root, 'memory.json');
    const defaultMemory = {
        userId,
        narrative: 'New user - no conversation history yet.',
        keyThemes: [],
        sessionSummaries: [],
        lastUpdated: new Date().toISOString(),
    };
    await fs_1.promises.writeFile(memoryPath, JSON.stringify(defaultMemory, null, 2), 'utf-8');
    return defaultMemory;
}
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
async function updateMemory(userId, sessionSummary, newNarrative, newThemes) {
    // Load existing memory or create default
    let memory = await loadMemorySummary(userId);
    if (!memory) {
        memory = await createDefaultMemory(userId);
    }
    // Append new session summary
    const updatedMemory = {
        ...memory,
        narrative: newNarrative || memory.narrative,
        keyThemes: newThemes
            ? [...new Set([...memory.keyThemes, ...newThemes])] // Merge and deduplicate themes
            : memory.keyThemes,
        sessionSummaries: [...memory.sessionSummaries, sessionSummary],
        lastUpdated: new Date().toISOString(),
    };
    // Write updated memory to file
    const dirs = getUserDirectories(userId);
    const memoryPath = path_1.default.join(dirs.root, 'memory.json');
    await fs_1.promises.writeFile(memoryPath, JSON.stringify(updatedMemory, null, 2), 'utf-8');
    return updatedMemory;
}
/**
 * Returns narrative summary and key themes for AI context
 *
 * @param userId - The unique identifier for the user
 * @returns Promise<{ narrative: string; keyThemes: string[] } | null> - Context data or null
 */
async function getMemoryContext(userId) {
    const memory = await loadMemorySummary(userId);
    if (!memory) {
        return null;
    }
    return {
        narrative: memory.narrative,
        keyThemes: memory.keyThemes,
    };
}
//# sourceMappingURL=storage.js.map