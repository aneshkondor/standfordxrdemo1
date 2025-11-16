"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureUserDirectories = ensureUserDirectories;
exports.getUserDirectories = getUserDirectories;
exports.userDirectoryExists = userDirectoryExists;
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
//# sourceMappingURL=storage.js.map