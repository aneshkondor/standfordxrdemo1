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
