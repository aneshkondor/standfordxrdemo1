/**
 * Therapy State Provider Component
 *
 * React component that provides therapy state management to the application
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  TherapyState,
  type TherapyTone,
  type TherapySession,
  TherapyStateContext,
  type TherapyStateContextType,
  DEFAULT_SESSION,
  therapyStateController,
} from './TherapyStateController';
import { startSession, type SessionApiError } from '../api/sessionApi';
import websocketClient from '../api/websocketClient';

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

  // Sync React state with singleton controller for audio pipeline
  useEffect(() => {
    therapyStateController.setState(currentState);
  }, [currentState]);

  /**
   * Start a therapy session with the selected tone
   * Calls backend API to initialize session
   */
  const startTherapy = useCallback(async (tone: TherapyTone) => {
    try {
      console.log(`[TherapyStateProvider] Starting therapy session with tone: ${tone}`);

      // Call backend API to start session
      // TODO: Replace hardcoded userId with actual user authentication
      const userId = 'demo-user';
      const response = await startSession(userId, tone);

      console.log(`[TherapyStateProvider] Session initialized:`, response);
      console.log(`  - Mode: ${response.mode}`);
      console.log(`  - Applied Tone: ${response.appliedTone}`);
      console.log(`  - Memory Narrative: ${response.memoryNarrative}`);

      // Connect to WebSocket for real-time audio communication
      if (!websocketClient.isConnected()) {
        console.log('[TherapyStateProvider] Connecting to WebSocket...');

        // Register one-time handlers before connecting
        let onOpenHandler: (() => void) | null = null;
        let onErrorHandler: ((error: Event) => void) | null = null;

        const connectionPromise = new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('WebSocket connection timeout'));
          }, 5000);

          onOpenHandler = () => {
            clearTimeout(timeout);
            console.log('[TherapyStateProvider] WebSocket connected successfully');
            resolve();
          };

          onErrorHandler = (error) => {
            clearTimeout(timeout);
            console.error('[TherapyStateProvider] WebSocket connection error:', error);
            reject(error);
          };

          websocketClient.onOpen(onOpenHandler);
          websocketClient.onError(onErrorHandler);
        });

        websocketClient.connect();
        await connectionPromise;

        console.log('[TherapyStateProvider] WebSocket connection established, ready for audio');
      } else {
        console.log('[TherapyStateProvider] WebSocket already connected');
      }

      // Update local session state
      setSession({
        tone,
        startedAt: Date.now(),
        duration: 0,
      });

      // Transition to active therapy state
      // This will trigger the audio pipeline to start automatically
      setCurrentState(TherapyState.ACTIVE_THERAPY);

    } catch (error) {
      console.error('[TherapyStateProvider] Failed to start therapy session:', error);

      // Show user-friendly error message
      const err = error as SessionApiError;
      if (err.name === 'SessionApiError') {
        alert(`Failed to start session: ${err.message}\n\nPlease ensure the backend server is running.`);
      } else {
        alert('An unexpected error occurred while starting the session.');
      }

      // Keep state as idle on error
      setCurrentState(TherapyState.IDLE);
    }
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
    console.log('[TherapyStateProvider] Exiting therapy session');

    // Disconnect WebSocket
    if (websocketClient.isConnected()) {
      console.log('[TherapyStateProvider] Disconnecting WebSocket...');
      websocketClient.disconnect();
    }

    // Reset state
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
