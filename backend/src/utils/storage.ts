import { promises as fs } from 'fs';
import path from 'path';

/**
 * Base directory for all user data storage
 */
const DATA_DIR = path.join(process.cwd(), 'data', 'users');

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
export async function ensureUserDirectories(userId: string): Promise<UserDirectories> {
  const userRoot = path.join(DATA_DIR, userId);
  const sessionsDir = path.join(userRoot, 'sessions');
  const summariesDir = path.join(userRoot, 'summaries');

  // Create all directories recursively
  await fs.mkdir(userRoot, { recursive: true });
  await fs.mkdir(sessionsDir, { recursive: true });
  await fs.mkdir(summariesDir, { recursive: true });

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
export function getUserDirectories(userId: string): UserDirectories {
  const userRoot = path.join(DATA_DIR, userId);

  return {
    root: userRoot,
    sessions: path.join(userRoot, 'sessions'),
    summaries: path.join(userRoot, 'summaries'),
  };
}

/**
 * Checks if a user directory structure exists
 *
 * @param userId - The unique identifier for the user
 * @returns Promise<boolean> - True if the user directory exists, false otherwise
 */
export async function userDirectoryExists(userId: string): Promise<boolean> {
  const userRoot = path.join(DATA_DIR, userId);

  try {
    await fs.access(userRoot);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// PROFILE OPERATIONS
// ============================================================================

/**
 * Interface for user profile data
 */
export interface UserProfile {
  userId: string;
  createdAt: string;
  preferredTone?: 'professional' | 'casual' | 'friendly';
  [key: string]: unknown; // Allow for additional custom fields
}

/**
 * Creates a default user profile with initial preferences
 *
 * @param userId - The unique identifier for the user
 * @returns Promise<UserProfile> - The created user profile
 */
export async function createDefaultProfile(userId: string): Promise<UserProfile> {
  // Ensure user directories exist
  const dirs = await ensureUserDirectories(userId);
  const profilePath = path.join(dirs.root, 'profile.json');

  // Create default profile
  const defaultProfile: UserProfile = {
    userId,
    createdAt: new Date().toISOString(),
    preferredTone: 'friendly',
  };

  // Write profile to file
  await fs.writeFile(profilePath, JSON.stringify(defaultProfile, null, 2), 'utf-8');

  return defaultProfile;
}

/**
 * Reads a user profile from disk
 *
 * @param userId - The unique identifier for the user
 * @returns Promise<UserProfile | null> - The user profile, or null if it doesn't exist
 */
export async function readUserProfile(userId: string): Promise<UserProfile | null> {
  const dirs = getUserDirectories(userId);
  const profilePath = path.join(dirs.root, 'profile.json');

  try {
    const fileContent = await fs.readFile(profilePath, 'utf-8');
    return JSON.parse(fileContent) as UserProfile;
  } catch (error) {
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
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'userId' | 'createdAt'>>
): Promise<UserProfile> {
  // Read existing profile or create default
  let profile = await readUserProfile(userId);

  if (!profile) {
    profile = await createDefaultProfile(userId);
  }

  // Merge updates with existing profile
  const updatedProfile: UserProfile = {
    ...profile,
    ...updates,
    userId: profile.userId, // Ensure userId is never changed
    createdAt: profile.createdAt, // Ensure createdAt is never changed
  };

  // Write updated profile to file
  const dirs = getUserDirectories(userId);
  const profilePath = path.join(dirs.root, 'profile.json');
  await fs.writeFile(profilePath, JSON.stringify(updatedProfile, null, 2), 'utf-8');

  return updatedProfile;
}

// ============================================================================
// MEMORY OPERATIONS
// ============================================================================

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
export async function loadMemorySummary(userId: string): Promise<MemorySummary | null> {
  const dirs = getUserDirectories(userId);
  const memoryPath = path.join(dirs.root, 'memory.json');

  try {
    const fileContent = await fs.readFile(memoryPath, 'utf-8');
    return JSON.parse(fileContent) as MemorySummary;
  } catch (error) {
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
export async function createDefaultMemory(userId: string): Promise<MemorySummary> {
  // Ensure user directories exist
  const dirs = await ensureUserDirectories(userId);
  const memoryPath = path.join(dirs.root, 'memory.json');

  const defaultMemory: MemorySummary = {
    userId,
    narrative: 'New user - no conversation history yet.',
    keyThemes: [],
    sessionSummaries: [],
    lastUpdated: new Date().toISOString(),
  };

  await fs.writeFile(memoryPath, JSON.stringify(defaultMemory, null, 2), 'utf-8');

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
export async function updateMemory(
  userId: string,
  sessionSummary: SessionSummary,
  newNarrative?: string,
  newThemes?: string[]
): Promise<MemorySummary> {
  // Load existing memory or create default
  let memory = await loadMemorySummary(userId);

  if (!memory) {
    memory = await createDefaultMemory(userId);
  }

  // Append new session summary
  const updatedMemory: MemorySummary = {
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
  const memoryPath = path.join(dirs.root, 'memory.json');
  await fs.writeFile(memoryPath, JSON.stringify(updatedMemory, null, 2), 'utf-8');

  return updatedMemory;
}

/**
 * Returns narrative summary and key themes for AI context
 *
 * @param userId - The unique identifier for the user
 * @returns Promise<{ narrative: string; keyThemes: string[] } | null> - Context data or null
 */
export async function getMemoryContext(
  userId: string
): Promise<{ narrative: string; keyThemes: string[] } | null> {
  const memory = await loadMemorySummary(userId);

  if (!memory) {
    return null;
  }

  return {
    narrative: memory.narrative,
    keyThemes: memory.keyThemes,
  };
}
