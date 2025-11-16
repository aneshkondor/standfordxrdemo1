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
  /** Transition handlers */
  startTherapy: (tone: TherapyTone) => Promise<void>;
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

/**
 * Therapy State Controller Singleton
 * Manages state change notifications for audio pipeline and other subscribers
 */
class TherapyStateControllerClass {
  private currentState: TherapyState = TherapyState.IDLE;
  private listeners: Array<(newState: TherapyState, oldState: TherapyState) => void> = [];

  /**
   * Update current state and notify listeners
   */
  public setState(newState: TherapyState): void {
    const oldState = this.currentState;
    if (oldState !== newState) {
      this.currentState = newState;
      this.notifyListeners(newState, oldState);
    }
  }

  /**
   * Get current state
   */
  public getState(): TherapyState {
    return this.currentState;
  }

  /**
   * Check if therapy is currently active
   */
  public isActive(): boolean {
    return this.currentState === TherapyState.ACTIVE_THERAPY;
  }

  /**
   * Register a state change listener
   */
  public onStateChange(callback: (newState: TherapyState, oldState: TherapyState) => void): void {
    this.listeners.push(callback);
  }

  /**
   * Remove a state change listener
   */
  public offStateChange(callback: (newState: TherapyState, oldState: TherapyState) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(newState: TherapyState, oldState: TherapyState): void {
    this.listeners.forEach(listener => {
      try {
        listener(newState, oldState);
      } catch (error) {
        console.error('[TherapyStateController] Error in state change listener:', error);
      }
    });
  }
}

/**
 * Singleton instance of the therapy state controller
 * Used by audio pipeline and other systems that need to react to state changes
 */
export const therapyStateController = new TherapyStateControllerClass();
