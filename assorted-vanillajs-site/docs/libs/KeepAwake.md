# KeepAwake

This class uses the new screen lock API to basically prevent the computer from sleeping while the user has the website opened and visible, even if they're not actively doing anything.

```ts
export class KeepAwake {
  public wakeLock?: WakeLockSentinel;
  private onVisibilityChange: () => void;
  constructor() {
    this.onVisibilityChange = this.handleVisibilityChange.bind(this);
  }
  async request() {
    try {
      this.wakeLock = await navigator.wakeLock.request();
      this.wakeLock.addEventListener("release", () => {
        console.log("Screen Wake Lock released:", this.wakeLock?.released);
      });
      console.log("Screen Wake Lock released:", this.wakeLock?.released);
    } catch (err) {
      const error = err as unknown as any;
      console.error(`${error.name}, ${error.message}`);
    }
  }

  release() {
    this.wakeLock?.release();
    setTimeout(() => {
      this.wakeLock = undefined;
    }, 250);
  }

  // when dcoument is visible, request wakelock
  // when document is hidden, we have no choice but to release wakelock.
  private async handleVisibilityChange() {
    if (document.visibilityState === "visible" && !this.wakeLock) {
      console.log("Document is visible again. Re-acquiring wake lock...");
      await this.request();
    } else if (document.visibilityState === "hidden" && this.wakeLock) {
      console.log("Document is hidden. Releasing wake lock...");
      this.release();
    } else {
      this.release();
    }
  }

  keepAwake() {
    document.addEventListener("visibilitychange", this.onVisibilityChange);
  }

  destroy() {
    this.release();
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
  }
}
```

We can request a wakelock with `navigator.wakeLock.request()` whenever the website we want to keep awake is currently visible. However, if the website is not visible, then requesting will fail and the wakelock will be automatically released. This is why we need to handle visibility changes to re-acquire or release the wakelock.

- `request()`: Requests a screen wake lock. This fails if the website is not visible.
- `release()`: Releases the screen wake lock. This triggers the `release` event on the wake lock.
- `handleVisibilityChange()`: Handles visibility changes to re-acquire or release the wake lock.
