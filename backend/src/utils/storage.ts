import { promises as fs } from 'fs';
import path from 'path';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

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

// ============================================================================
// CONSTANTS
// ============================================================================

const DATA_ROOT = path.join(__dirname, '../../data');
const USERS_DIR = path.join(DATA_ROOT, 'users');

// ============================================================================
// STEP 1: DIRECTORY MANAGEMENT
// ============================================================================

/**
 * Ensures that the user directory structure exists
 * Creates: data/users/{userId}/, sessions/, summaries/
 */
export async function ensureUserDirectories(userId: string): Promise<void> {
  const userRoot = path.join(USERS_DIR, userId);
  const sessionsDir = path.join(userRoot, 'sessions');
  const summariesDir = path.join(userRoot, 'summaries');

  // Create all directories recursively
  await fs.mkdir(userRoot, { recursive: true });
  await fs.mkdir(sessionsDir, { recursive: true });
  await fs.mkdir(summariesDir, { recursive: true });
}

/**
 * Gets the path to a user's root directory
 */
export function getUserPath(userId: string): string {
  return path.join(USERS_DIR, userId);
}

/**
 * Gets the path to a user's sessions directory
 */
export function getSessionsPath(userId: string): string {
  return path.join(USERS_DIR, userId, 'sessions');
}

/**
 * Gets the path to a user's summaries directory
 */
export function getSummariesPath(userId: string): string {
  return path.join(USERS_DIR, userId, 'summaries');
}

// ============================================================================
// STEP 2: PROFILE OPERATIONS
// ============================================================================

/**
 * Creates a default user profile with initial preferences
 */
export async function createDefaultProfile(userId: string, preferredTone: string = 'friendly'): Promise<UserProfile> {
  await ensureUserDirectories(userId);

  const profile: UserProfile = {
    userId,
    createdAt: new Date().toISOString(),
    preferredTone,
    preferences: {}
  };

  const profilePath = path.join(getUserPath(userId), 'profile.json');
  await fs.writeFile(profilePath, JSON.stringify(profile, null, 2), 'utf-8');

  return profile;
}

/**
 * Reads a user profile from profile.json
 */
export async function readUserProfile(userId: string): Promise<UserProfile | null> {
  const profilePath = path.join(getUserPath(userId), 'profile.json');

  try {
    const data = await fs.readFile(profilePath, 'utf-8');
    return JSON.parse(data) as UserProfile;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return null; // Profile doesn't exist
    }
    throw error;
  }
}

/**
 * Updates user preference fields in profile.json
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'userId' | 'createdAt'>>
): Promise<UserProfile> {
  let profile = await readUserProfile(userId);

  if (!profile) {
    // Create default profile if it doesn't exist
    profile = await createDefaultProfile(userId);
  }

  // Apply updates
  const updatedProfile: UserProfile = {
    ...profile,
    ...updates,
    userId: profile.userId, // Ensure userId cannot be changed
    createdAt: profile.createdAt // Ensure createdAt cannot be changed
  };

  const profilePath = path.join(getUserPath(userId), 'profile.json');
  await fs.writeFile(profilePath, JSON.stringify(updatedProfile, null, 2), 'utf-8');

  return updatedProfile;
}

// ============================================================================
// STEP 3: MEMORY OPERATIONS
// ============================================================================

/**
 * Loads existing memory summary and narrative from memory.json
 */
export async function loadMemorySummary(userId: string): Promise<MemorySummary | null> {
  const memoryPath = path.join(getUserPath(userId), 'memory.json');

  try {
    const data = await fs.readFile(memoryPath, 'utf-8');
    return JSON.parse(data) as MemorySummary;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return null; // Memory doesn't exist yet
    }
    throw error;
  }
}

/**
 * Creates a default memory structure
 */
async function createDefaultMemory(userId: string): Promise<MemorySummary> {
  await ensureUserDirectories(userId);

  const memory: MemorySummary = {
    narrative: '',
    keyThemes: [],
    sessionSummaries: [],
    lastUpdated: new Date().toISOString()
  };

  const memoryPath = path.join(getUserPath(userId), 'memory.json');
  await fs.writeFile(memoryPath, JSON.stringify(memory, null, 2), 'utf-8');

  return memory;
}

/**
 * Updates memory after sessions with new insights
 * Appends session summaries to memory structure
 */
export async function updateMemoryAfterSession(
  userId: string,
  sessionSummary: SessionSummary,
  narrativeUpdate?: string
): Promise<MemorySummary> {
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
  const newThemes = sessionSummary.topics.filter(
    topic => !memory.keyThemes.includes(topic)
  );
  memory.keyThemes.push(...newThemes);

  // Update timestamp
  memory.lastUpdated = new Date().toISOString();

  const memoryPath = path.join(getUserPath(userId), 'memory.json');
  await fs.writeFile(memoryPath, JSON.stringify(memory, null, 2), 'utf-8');

  return memory;
}

/**
 * Returns narrative summary and key themes for AI context
 */
export async function getMemoryContext(userId: string): Promise<{ narrative: string; keyThemes: string[] }> {
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
function formatTimestampForFilename(date: Date): string {
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
export async function saveSessionTranscript(
  userId: string,
  conversationLog: string,
  timestamp?: Date
): Promise<string> {
  await ensureUserDirectories(userId);

  const sessionTimestamp = timestamp || new Date();
  const filename = `${formatTimestampForFilename(sessionTimestamp)}.md`;
  const sessionPath = path.join(getSessionsPath(userId), filename);

  // Format as markdown
  const markdown = `# Session Transcript
**Date:** ${sessionTimestamp.toISOString()}
**User ID:** ${userId}

---

${conversationLog}
`;

  await fs.writeFile(sessionPath, markdown, 'utf-8');

  return sessionPath;
}

/**
 * Lists all session transcripts for a user
 */
export async function listSessionTranscripts(userId: string): Promise<string[]> {
  const sessionsPath = getSessionsPath(userId);

  try {
    const files = await fs.readdir(sessionsPath);
    return files.filter(file => file.endsWith('.md')).sort().reverse(); // Most recent first
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []; // No sessions directory yet
    }
    throw error;
  }
}

/**
 * Reads a specific session transcript
 */
export async function readSessionTranscript(userId: string, filename: string): Promise<string | null> {
  const sessionPath = path.join(getSessionsPath(userId), filename);

  try {
    return await fs.readFile(sessionPath, 'utf-8');
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return null; // Session doesn't exist
    }
    throw error;
  }
}
