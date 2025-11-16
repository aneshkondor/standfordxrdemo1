import { useEffect, useState, useCallback } from 'react';
import { startSession as startXRSession, stopSession as stopXRSession } from '@react-three/xr';

type XRSessionState = 'unsupported' | 'idle' | 'starting' | 'immersive';

interface XRStateChangeDetail {
  state: XRSessionState;
  session: XRSession | null;
  referenceSpace: XRReferenceSpace | null;
}

type XRStateChangeEvent = CustomEvent<XRStateChangeDetail>;

const STATE_EVENT = 'statechange';

class XRSessionManager extends EventTarget {
  private state: XRSessionState = 'idle';
  private session: XRSession | null = null;
  private referenceSpace: XRReferenceSpace | null = null;
  private supportChecked = false;
  private supported = false;
  private polyfillPromise: Promise<void> | null = null;

  public getState(): XRSessionState {
    return this.state;
  }

  public getSession(): XRSession | null {
    return this.session;
  }

  public getReferenceSpace(): XRReferenceSpace | null {
    return this.referenceSpace;
  }

  public isSupported(): boolean {
    return this.supported;
  }

  public async checkSupport(): Promise<boolean> {
    await this.ensureSupport();
    return this.supported;
  }

  private async ensureSupport(): Promise<void> {
    if (this.supportChecked) {
      return;
    }

    this.supportChecked = true;

    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      this.supported = false;
      this.updateState('unsupported');
      return;
    }

    if ('xr' in navigator) {
      this.supported = true;
      return;
    }

    if (!this.polyfillPromise) {
      this.polyfillPromise = import('webxr-polyfill')
        .then((module) => {
          const Polyfill = module.default as new () => unknown;
          new Polyfill();
        })
        .catch((error) => {
          console.error('[XRSessionManager] Failed to initialize WebXR polyfill', error);
        });
    }

    await this.polyfillPromise;

    if ('xr' in navigator) {
      this.supported = true;
    } else {
      this.supported = false;
      this.updateState('unsupported');
    }
  }

  public async startSession(): Promise<XRSession | null> {
    await this.ensureSupport();

    if (!this.supported || !navigator.xr) {
      console.warn('[XRSessionManager] WebXR not supported on this device');
      this.updateState('unsupported');
      return null;
    }

    if (this.session) {
      return this.session;
    }

    try {
      this.updateState('starting');

      const sessionInit: XRSessionInit = {
        requiredFeatures: ['local-floor'],
        optionalFeatures: ['bounded-floor', 'hand-tracking']
      };

      const session = await startXRSession('immersive-vr', sessionInit);

      if (!session) {
        this.updateState('idle');
        return null;
      }

      session.addEventListener('end', this.handleSessionEnd);
      session.addEventListener('visibilitychange', this.handleVisibilityChange);

      this.session = session;
      this.referenceSpace = await session.requestReferenceSpace('local-floor');

      this.updateState('immersive');

      return session;
    } catch (error) {
      console.error('[XRSessionManager] Failed to start XR session', error);
      this.updateState('idle');
      return null;
    }
  }

  public async endSession(): Promise<void> {
    if (!this.session) {
      return;
    }

    try {
      await stopXRSession();
    } catch (error) {
      console.warn('[XRSessionManager] Error while ending XR session', error);
      await this.session.end();
    }
  }

  private handleSessionEnd = (): void => {
    this.session?.removeEventListener('end', this.handleSessionEnd);
    this.session?.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.session = null;
    this.referenceSpace = null;
    this.updateState('idle');
  };

  private handleVisibilityChange = (event: XRSessionEvent): void => {
    console.log('[XRSessionManager] Visibility changed:', event.session.visibilityState);
  };

  private updateState(state: XRSessionState): void {
    this.state = state;

    const detail: XRStateChangeDetail = {
      state,
      session: this.session,
      referenceSpace: this.referenceSpace
    };

    const event = new CustomEvent<XRStateChangeDetail>(STATE_EVENT, {
      detail
    });

    this.dispatchEvent(event);
  }

  public subscribe(listener: (event: XRStateChangeEvent) => void): () => void {
    this.addEventListener(STATE_EVENT, listener as EventListener);
    return () => this.removeEventListener(STATE_EVENT, listener as EventListener);
  }
}

export const xrSessionManager = new XRSessionManager();

export type { XRSessionState };

export function useXRSession() {
  const [state, setState] = useState<XRSessionState>(() => xrSessionManager.getState());
  const [session, setSession] = useState<XRSession | null>(() => xrSessionManager.getSession());
  const [referenceSpace, setReferenceSpace] = useState<XRReferenceSpace | null>(() =>
    xrSessionManager.getReferenceSpace()
  );
  const [supported, setSupported] = useState<boolean>(() => xrSessionManager.isSupported());

  useEffect(() => {
    xrSessionManager
      .checkSupport()
      .then((isSupported) => setSupported(isSupported))
      .catch(() => setSupported(false));

    const listener = (event: XRStateChangeEvent) => {
      setState(event.detail.state);
      setSession(event.detail.session);
      setReferenceSpace(event.detail.referenceSpace);
      setSupported(xrSessionManager.isSupported());
    };

    const unsubscribe = xrSessionManager.subscribe(listener);
    return () => unsubscribe();
  }, []);

  const startSession = useCallback(() => xrSessionManager.startSession(), []);
  const endSession = useCallback(() => xrSessionManager.endSession(), []);

  return {
    state,
    session,
    referenceSpace,
    isSupported: supported,
    startSession,
    endSession
  };
}
