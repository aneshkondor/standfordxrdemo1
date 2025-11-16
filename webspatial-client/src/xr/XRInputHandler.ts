import { useEffect, useState } from 'react';

type InputSourcesDetail = {
  sources: XRInputSource[];
};

type SelectDetail = {
  source: XRInputSource;
};

const SOURCES_EVENT = 'sourceschange';
const SELECT_EVENT = 'select';

class XRInputHandler extends EventTarget {
  private session: XRSession | null = null;
  private sources: XRInputSource[] = [];

  public attach(session: XRSession | null): void {
    if (this.session === session) {
      return;
    }

    this.detach();

    if (!session) {
      return;
    }

    this.session = session;

    session.addEventListener('inputsourceschange', this.handleInputSourcesChange);
    session.addEventListener('select', this.handleSelect);
    session.addEventListener('selectend', this.handleSelectEnd);

    this.sources = Array.from(session.inputSources ?? []);
    this.dispatchSources();
  }

  public detach(): void {
    if (!this.session) {
      return;
    }

    this.session.removeEventListener('inputsourceschange', this.handleInputSourcesChange);
    this.session.removeEventListener('select', this.handleSelect);
    this.session.removeEventListener('selectend', this.handleSelectEnd);
    this.session = null;
    this.sources = [];
    this.dispatchSources();
  }

  public getSources(): XRInputSource[] {
    return [...this.sources];
  }

  private handleInputSourcesChange = (event: XRInputSourcesChangeEvent): void => {
    const removed = new Set(event.removed);
    const added = event.added;

    const nextSources = this.sources.filter((source) => !removed.has(source));

    for (const source of added) {
      nextSources.push(source);
    }

    this.sources = nextSources;
    this.dispatchSources();
  };

  private handleSelect = (event: XRInputSourceEvent): void => {
    const selectEvent = new CustomEvent<SelectDetail>(SELECT_EVENT, {
      detail: {
        source: event.inputSource
      }
    });

    this.dispatchEvent(selectEvent);
  };

  private handleSelectEnd = (): void => {
    this.dispatchSources();
  };

  private dispatchSources(): void {
    const event = new CustomEvent<InputSourcesDetail>(SOURCES_EVENT, {
      detail: {
        sources: this.getSources()
      }
    });

    this.dispatchEvent(event);
  }

  public onSourcesChange(listener: (event: CustomEvent<InputSourcesDetail>) => void): () => void {
    this.addEventListener(SOURCES_EVENT, listener as EventListener);
    return () => this.removeEventListener(SOURCES_EVENT, listener as EventListener);
  }

  public onSelect(listener: (event: CustomEvent<SelectDetail>) => void): () => void {
    this.addEventListener(SELECT_EVENT, listener as EventListener);
    return () => this.removeEventListener(SELECT_EVENT, listener as EventListener);
  }
}

export const xrInputHandler = new XRInputHandler();

export function useXRInputSources(session: XRSession | null) {
  const [sources, setSources] = useState<XRInputSource[]>([]);

  useEffect(() => {
    xrInputHandler.attach(session);
    return () => {
      xrInputHandler.detach();
    };
  }, [session]);

  useEffect(() => {
    const unsubscribe = xrInputHandler.onSourcesChange((event) => {
      setSources(event.detail.sources);
    });

    return () => unsubscribe();
  }, []);

  return sources;
}
