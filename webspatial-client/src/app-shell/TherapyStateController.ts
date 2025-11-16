/**
 * Therapy State Controller
 * Manages therapy session state transitions
 */

type TherapyState = 'idle' | 'active_therapy' | 'paused';
type StateChangeCallback = (newState: TherapyState, oldState: TherapyState) => void;

export class TherapyStateController {
  private currentState: TherapyState = 'idle';
  private stateChangeCallbacks: StateChangeCallback[] = [];

  /**
   * Get current therapy state
   */
  getState(): TherapyState {
    return this.currentState;
  }

  /**
   * Set therapy state
   */
  setState(newState: TherapyState): void {
    if (newState === this.currentState) {
      return;
    }

    const oldState = this.currentState;
    this.currentState = newState;

    console.log(`[TherapyState] State changed: ${oldState} -> ${newState}`);
    this.notifyStateChange(newState, oldState);
  }

  /**
   * Start therapy session
   */
  startTherapy(): void {
    this.setState('active_therapy');
  }

  /**
   * Pause therapy session
   */
  pauseTherapy(): void {
    this.setState('paused');
  }

  /**
   * End therapy session
   */
  endTherapy(): void {
    this.setState('idle');
  }

  /**
   * Check if therapy is active
   */
  isActive(): boolean {
    return this.currentState === 'active_therapy';
  }

  /**
   * Register callback for state changes
   */
  onStateChange(callback: StateChangeCallback): void {
    this.stateChangeCallbacks.push(callback);
  }

  /**
   * Remove state change callback
   */
  offStateChange(callback: StateChangeCallback): void {
    this.stateChangeCallbacks = this.stateChangeCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Notify all registered callbacks of state change
   */
  private notifyStateChange(newState: TherapyState, oldState: TherapyState): void {
    this.stateChangeCallbacks.forEach(callback => {
      try {
        callback(newState, oldState);
      } catch (error) {
        console.error('[TherapyState] Error in state change callback:', error);
      }
    });
  }
}

// Export singleton instance
export const therapyStateController = new TherapyStateController();
export default therapyStateController;
