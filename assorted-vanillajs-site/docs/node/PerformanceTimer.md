# PerformanceTimer

```ts
export class PerformanceTimer {
  constructor(private measureName: string) {}
  private startTime?: number;
  private endTime?: number;
  start() {
    this.startTime = performance.now();
    this.endTime = undefined;
  }
  end() {
    if (!this.startTime) {
      throw new Error("Timer has not been started");
    }
    this.endTime = performance.now();
    const duration = performance.now() - this.startTime;
    console.log(`${this.measureName} took ${duration.toFixed(2)}ms`);
  }
}
```
