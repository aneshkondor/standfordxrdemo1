/**
 * Therapy State Provider Component
 *
 * React component that provides therapy state management to the application
 */

import React, { useState, useCallback } from 'react';
import {
  TherapyState,
  type TherapyTone,
  type TherapySession,
  TherapyStateContext,
  type TherapyStateContextType,
  DEFAULT_SESSION,
} from './TherapyStateController';

/**
 * Therapy State Provider Props
 */
interface TherapyStateProviderProps {
  children: React.ReactNode;
}

/**
 * Therapy State Provider Component
 * Manages therapy state and provides state handlers to child components
 */
export const TherapyStateProvider: React.FC<TherapyStateProviderProps> = ({ children }) => {
  const [currentState, setCurrentState] = useState<TherapyState>(TherapyState.IDLE);
  const [session, setSession] = useState<TherapySession>(DEFAULT_SESSION);

  /**
   * Start a therapy session with the selected tone
   */
  const startTherapy = useCallback((tone: TherapyTone) => {
    setSession({
      tone,
      startedAt: Date.now(),
      duration: 0,
    });
    setCurrentState(TherapyState.ACTIVE_THERAPY);
  }, []);

  /**
   * Pause the current therapy session
   */
  const pauseTherapy = useCallback(() => {
    if (currentState === TherapyState.ACTIVE_THERAPY) {
      setCurrentState(TherapyState.PAUSED);
    }
  }, [currentState]);

  /**
   * Exit therapy and return to idle state
   */
  const exitTherapy = useCallback(() => {
    setCurrentState(TherapyState.IDLE);
    setSession(DEFAULT_SESSION);
  }, []);

  const contextValue: TherapyStateContextType = {
    currentState,
    session,
    startTherapy,
    pauseTherapy,
    exitTherapy,
  };

  return (
    <TherapyStateContext.Provider value={contextValue}>
      {children}
    </TherapyStateContext.Provider>
  );
};
