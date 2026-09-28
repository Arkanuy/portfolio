/* API View Transitions belum ada di lib.dom bawaan TypeScript. */
type ViewTransitionLike = {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition(): void;
};

declare global {
  interface Document {
    startViewTransition?: (callback: () => void | Promise<void>) => ViewTransitionLike;
  }
}

export {};
