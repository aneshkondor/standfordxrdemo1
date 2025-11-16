/**
 * Therapy Mode State Controller
 *
 * Centralized state management for therapy session lifecycle and mode transitions.
 * Coordinates visibility and behavior of UI components based on current application state.
 */

import { createContext, useContext } from 'react';

/**
 * Therapy State Enum
 * Defines all possible states of the therapy application
 */
export const TherapyState = {
  /** Dashboard visible, no audio active */
  IDLE: 'idle',
  /** Robot scene visible, audio active */
  ACTIVE_THERAPY: 'active_therapy',
  /** Therapy scene visible but audio inactive */
  PAUSED: 'paused',
} as const;

export type TherapyState = typeof TherapyState[keyof typeof TherapyState];

/**
 * Therapy Tone Types
 * Defines available therapy tones that can be selected
 * Matches backend API tone presets
 */
export type TherapyTone = 'Soft' | 'Friendly' | 'Analytical';

/**
 * Therapy Session Data
 * Contains session-specific information
 */
export interface TherapySession {
  /** Selected tone for the therapy session */
  tone: TherapyTone | null;
  /** Session start timestamp */
  startedAt: number | null;
  /** Session duration in milliseconds */
  duration: number;
}

/**
 * Therapy State Context Type
 * Defines the shape of state and handlers exposed to components
 */
export interface TherapyStateContextType {
  /** Current therapy state */
  currentState: TherapyState;
  /** Current session data */
  session: TherapySession;
  /** Transition handlers (to be implemented in Step 2) */
  startTherapy: (tone: TherapyTone) => void;
  pauseTherapy: () => void;
  exitTherapy: () => void;
}

/**
 * Default session state
 */
export const DEFAULT_SESSION: TherapySession = {
  tone: null,
  startedAt: null,
  duration: 0,
};

/**
 * Therapy State Context
 * React context for sharing therapy state across component tree
 */
export const TherapyStateContext = createContext<TherapyStateContextType | undefined>(
  undefined
);

/**
 * Custom hook to access therapy state and handlers
 *
 * @throws Error if used outside of TherapyStateProvider
 * @returns Therapy state context with current state and handlers
 */
export const useTherapyState = (): TherapyStateContextType => {
  const context = useContext(TherapyStateContext);

  if (context === undefined) {
    throw new Error('useTherapyState must be used within a TherapyStateProvider');
  }

  return context;
};

/**
 * Helper: Check if therapy is currently active
 */
export const isTherapyActive = (state: TherapyState): boolean => {
  return state === TherapyState.ACTIVE_THERAPY;
};

/**
 * Helper: Check if therapy session is in progress (active or paused)
 */
export const isTherapyInProgress = (state: TherapyState): boolean => {
  return state === TherapyState.ACTIVE_THERAPY || state === TherapyState.PAUSED;
};

/**
 * Helper: Determine which UI components should be visible based on state
 */
export const getComponentVisibility = (state: TherapyState) => {
  return {
    showDashboard: state === TherapyState.IDLE,
    showRobotScene: state === TherapyState.ACTIVE_THERAPY || state === TherapyState.PAUSED,
    audioActive: state === TherapyState.ACTIVE_THERAPY,
  };
};
