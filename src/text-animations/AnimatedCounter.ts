export class AnimatedCounter {
  private currentNum = 0;
  private target: number;
  private fps = 30;
  private numSeconds = 3;
  constructor(
    private element: HTMLElement,
    options: {
      target: number;
      fps?: number;
      numSeconds?: number;
    }
  ) {
    this.target = options.target;
    if (options.fps) {
      this.fps = options.fps;
    }
    if (options.numSeconds) {
      this.numSeconds = options.numSeconds;
    }
  }

  private increment() {
    const increment = Math.ceil(this.target / (this.fps * this.numSeconds));
    if (this.currentNum >= this.target) {
      this.currentNum = this.target;
    } else {
      this.currentNum += increment;
    }
  }

  private isFinished() {
    return this.currentNum >= this.target;
  }

  startLoop() {
    requestAnimationFrame(() => {
      if (!this.isFinished()) {
        this.startLoop();
        this.element.textContent = this.currentNum.toString();
        this.increment();
      } else {
        this.element.textContent = this.target.toString();
      }
    });
  }
}
