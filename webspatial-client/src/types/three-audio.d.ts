declare module 'three/src/audio/AudioContext.js' {
  export class AudioContext {
    static getContext(): globalThis.AudioContext;
    static setContext(context: globalThis.AudioContext): void;
  }
}
