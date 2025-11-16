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
