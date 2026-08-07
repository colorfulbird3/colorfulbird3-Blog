"use client";

export type FramePriority = 'critical' | 'decorative';

export type FrameSubscriber = (
  timeMs: number,
  deltaSeconds: number
) => void;

type SubscribeOptions = {
  priority?: FramePriority;
  maxFps?: number;
  interactionMaxFps?: number;
};

type Subscription = {
  callback: FrameSubscriber;
  maxFps: number;
  lastRun: number;
};

class AnimationScheduler {
  private subscriptions = new Set<Subscription>();
  private rafId: number | null = null;

  subscribe(
    callback: FrameSubscriber,
    options: SubscribeOptions = {}
  ) {
    const subscription: Subscription = {
      callback,
      maxFps: options.maxFps ?? Number.POSITIVE_INFINITY,
      lastRun: 0,
    };

    this.subscriptions.add(subscription);
    this.ensureRunning();

    return () => {
      this.subscriptions.delete(subscription);

      if (this.subscriptions.size === 0) {
        this.stop();
      }
    };
  }

  private stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private ensureRunning() {
    if (
      this.rafId !== null ||
      this.subscriptions.size === 0 ||
      typeof window === 'undefined'
    ) {
      return;
    }

    this.rafId = requestAnimationFrame(this.tick);
  }

  private tick = (timeMs: number) => {
    this.rafId = null;

    if (this.subscriptions.size === 0) {
      return;
    }

    for (const subscription of this.subscriptions) {
      const minInterval =
        Number.isFinite(subscription.maxFps) &&
        subscription.maxFps > 0
          ? 1000 / subscription.maxFps
          : 0;

      if (
        minInterval > 0 &&
        subscription.lastRun > 0 &&
        timeMs - subscription.lastRun < minInterval - 0.35
      ) {
        continue;
      }

      const rawDelta =
        subscription.lastRun === 0
          ? 1 / 60
          : (timeMs - subscription.lastRun) / 1000;

      const deltaSeconds = Math.min(
        Math.max(rawDelta, 0),
        1 / 24
      );

      subscription.lastRun = timeMs;
      subscription.callback(timeMs, deltaSeconds);
    }

    this.ensureRunning();
  };
}

export const animationScheduler = new AnimationScheduler();
