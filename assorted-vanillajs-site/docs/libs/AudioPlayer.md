# AudioPlayer

```ts
export class AudioFilePlayer {
  private audio: HTMLAudioElement;

  constructor(url: string) {
    this.audio = new Audio(url);
    this.audio.crossOrigin = "anonymous";
  }

  public get isPlaying(): boolean {
    return this.audio.paused === false && !this.audio.ended;
  }

  async play() {
    if (this.isPlaying) return;
    await this.audio.play();
    // wire the source to the 'speaker'
  }

  async pause() {
    if (!this.isPlaying) return;
  }

  public set volume(volume: number) {
    if (volume >= 0 && volume <= 1) {
      this.audio.volume = volume;
    } else {
      console.error("Volume must be between 0 and 1.");
    }
  }

  public get volume(): number {
    return this.audio.volume;
  }

  // Get the total duration of the audio in seconds
  public get duration(): number {
    return this.audio.duration;
  }

  public set speed(speed: number) {
    if (speed > 0) {
      this.audio.playbackRate = speed;
    } else {
      console.error("Speed must be greater than 0.");
    }
  }

  public get speed(): number {
    return this.audio.playbackRate;
  }

  public get progress(): number {
    if (!this.audio.duration || this.audio.duration === 0) {
      // If the duration is 0, we can't calculate progress
      return 0;
    }
    return this.audio.currentTime / this.audio.duration;
  }

  // Skip forward or backward by a specified number of seconds
  skip(seconds: number): void {
    this.audio.currentTime += seconds;
  }

  seekToProgress(progress: number): void {
    if (progress >= 0 && progress <= 1) {
      this.audio.currentTime = progress * this.audio.duration;
    } else {
      console.error("Progress must be between 0 and 1.");
    }
  }

  seekToTime(seconds: number): void {
    if (seconds >= 0 && seconds <= this.duration) {
      this.audio.currentTime = seconds;
    } else {
      console.error(
        `Seconds must be between 0 and audio duration (${seconds}).`
      );
    }
  }

  public get currentTime(): number {
    return this.audio.currentTime;
  }
}
```
