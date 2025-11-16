"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureUserDirectories = ensureUserDirectories;
exports.getUserPath = getUserPath;
exports.getSessionsPath = getSessionsPath;
exports.getSummariesPath = getSummariesPath;
exports.createDefaultProfile = createDefaultProfile;
exports.readUserProfile = readUserProfile;
exports.updateUserProfile = updateUserProfile;
exports.loadMemorySummary = loadMemorySummary;
exports.updateMemoryAfterSession = updateMemoryAfterSession;
exports.getMemoryContext = getMemoryContext;
exports.saveSessionTranscript = saveSessionTranscript;
exports.listSessionTranscripts = listSessionTranscripts;
exports.readSessionTranscript = readSessionTranscript;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
// ============================================================================
// CONSTANTS
// ============================================================================
const DATA_ROOT = path_1.default.join(__dirname, '../../data');
const USERS_DIR = path_1.default.join(DATA_ROOT, 'users');
// ============================================================================
// STEP 1: DIRECTORY MANAGEMENT
// ============================================================================
/**
 * Ensures that the user directory structure exists
 * Creates: data/users/{userId}/, sessions/, summaries/
 */
async function ensureUserDirectories(userId) {
    const userRoot = path_1.default.join(USERS_DIR, userId);
    const sessionsDir = path_1.default.join(userRoot, 'sessions');
    const summariesDir = path_1.default.join(userRoot, 'summaries');
    // Create all directories recursively
    await fs_1.promises.mkdir(userRoot, { recursive: true });
    await fs_1.promises.mkdir(sessionsDir, { recursive: true });
    await fs_1.promises.mkdir(summariesDir, { recursive: true });
}
/**
 * Gets the path to a user's root directory
 */
function getUserPath(userId) {
    return path_1.default.join(USERS_DIR, userId);
}
/**
 * Gets the path to a user's sessions directory
 */
function getSessionsPath(userId) {
    return path_1.default.join(USERS_DIR, userId, 'sessions');
}
/**
 * Gets the path to a user's summaries directory
 */
function getSummariesPath(userId) {
    return path_1.default.join(USERS_DIR, userId, 'summaries');
}
// ============================================================================
// STEP 2: PROFILE OPERATIONS
// ============================================================================
/**
 * Creates a default user profile with initial preferences
 */
async function createDefaultProfile(userId, preferredTone = 'friendly') {
    await ensureUserDirectories(userId);
    const profile = {
        userId,
        createdAt: new Date().toISOString(),
        preferredTone,
        preferences: {}
    };
    const profilePath = path_1.default.join(getUserPath(userId), 'profile.json');
    await fs_1.promises.writeFile(profilePath, JSON.stringify(profile, null, 2), 'utf-8');
    return profile;
}
/**
 * Reads a user profile from profile.json
 */
async function readUserProfile(userId) {
    const profilePath = path_1.default.join(getUserPath(userId), 'profile.json');
    try {
        const data = await fs_1.promises.readFile(profilePath, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            return null; // Profile doesn't exist
        }
        throw error;
    }
}
/**
 * Updates user preference fields in profile.json
 */
async function updateUserProfile(userId, updates) {
    let profile = await readUserProfile(userId);
    if (!profile) {
        // Create default profile if it doesn't exist
        profile = await createDefaultProfile(userId);
    }
    // Apply updates
    const updatedProfile = {
        ...profile,
        ...updates,
        userId: profile.userId, // Ensure userId cannot be changed
        createdAt: profile.createdAt // Ensure createdAt cannot be changed
    };
    const profilePath = path_1.default.join(getUserPath(userId), 'profile.json');
    await fs_1.promises.writeFile(profilePath, JSON.stringify(updatedProfile, null, 2), 'utf-8');
    return updatedProfile;
}
// ============================================================================
// STEP 3: MEMORY OPERATIONS
// ============================================================================
/**
 * Loads existing memory summary and narrative from memory.json
 */
async function loadMemorySummary(userId) {
    const memoryPath = path_1.default.join(getUserPath(userId), 'memory.json');
    try {
        const data = await fs_1.promises.readFile(memoryPath, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            return null; // Memory doesn't exist yet
        }
        throw error;
    }
}
/**
 * Creates a default memory structure
 */
async function createDefaultMemory(userId) {
    await ensureUserDirectories(userId);
    const memory = {
        narrative: '',
        keyThemes: [],
        sessionSummaries: [],
        lastUpdated: new Date().toISOString()
    };
    const memoryPath = path_1.default.join(getUserPath(userId), 'memory.json');
    await fs_1.promises.writeFile(memoryPath, JSON.stringify(memory, null, 2), 'utf-8');
    return memory;
}
/**
 * Updates memory after sessions with new insights
 * Appends session summaries to memory structure
 */
async function updateMemoryAfterSession(userId, sessionSummary, narrativeUpdate) {
    let memory = await loadMemorySummary(userId);
    if (!memory) {
        memory = await createDefaultMemory(userId);
    }
    // Append session summary
    memory.sessionSummaries.push(sessionSummary);
    // Update narrative if provided
    if (narrativeUpdate) {
        memory.narrative = narrativeUpdate;
    }
    // Extract and merge key themes from session topics
    const newThemes = sessionSummary.topics.filter(topic => !memory.keyThemes.includes(topic));
    memory.keyThemes.push(...newThemes);
    // Update timestamp
    memory.lastUpdated = new Date().toISOString();
    const memoryPath = path_1.default.join(getUserPath(userId), 'memory.json');
    await fs_1.promises.writeFile(memoryPath, JSON.stringify(memory, null, 2), 'utf-8');
    return memory;
}
/**
 * Returns narrative summary and key themes for AI context
 */
async function getMemoryContext(userId) {
    const memory = await loadMemorySummary(userId);
    if (!memory) {
        return {
            narrative: '',
            keyThemes: []
        };
    }
    return {
        narrative: memory.narrative,
        keyThemes: memory.keyThemes
    };
}
// ============================================================================
// STEP 4: SESSION STORAGE
// ============================================================================
/**
 * Formats timestamp for session filename: YYYY-MM-DD_HH-mm-ss
 */
function formatTimestampForFilename(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}
/**
 * Writes session transcript to markdown file
 * Filename format: YYYY-MM-DD_HH-mm-ss.md
 */
async function saveSessionTranscript(userId, conversationLog, timestamp) {
    await ensureUserDirectories(userId);
    const sessionTimestamp = timestamp || new Date();
    const filename = `${formatTimestampForFilename(sessionTimestamp)}.md`;
    const sessionPath = path_1.default.join(getSessionsPath(userId), filename);
    // Format as markdown
    const markdown = `# Session Transcript
**Date:** ${sessionTimestamp.toISOString()}
**User ID:** ${userId}

---

${conversationLog}
`;
    await fs_1.promises.writeFile(sessionPath, markdown, 'utf-8');
    return sessionPath;
}
/**
 * Lists all session transcripts for a user
 */
async function listSessionTranscripts(userId) {
    const sessionsPath = getSessionsPath(userId);
    try {
        const files = await fs_1.promises.readdir(sessionsPath);
        return files.filter(file => file.endsWith('.md')).sort().reverse(); // Most recent first
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            return []; // No sessions directory yet
        }
        throw error;
    }
}
/**
 * Reads a specific session transcript
 */
async function readSessionTranscript(userId, filename) {
    const sessionPath = path_1.default.join(getSessionsPath(userId), filename);
    try {
        return await fs_1.promises.readFile(sessionPath, 'utf-8');
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            return null; // Session doesn't exist
        }
        throw error;
    }
}
//# sourceMappingURL=storage.js.map