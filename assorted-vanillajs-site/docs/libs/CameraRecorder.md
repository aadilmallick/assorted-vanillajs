# CameraRecorder

```ts
interface StartRecording {
  onStop?: () => void;
  onRecordingCanceled?: () => void;
}

class RecordingError extends Error {
  constructor(message: string, public stream: MediaStream) {
    super(message);
    this.name = "RecordingError";
  }

  log() {
    console.error(this.name, this.message);
    console.error("The offending stream", this.stream);
    console.error(this.stack);
  }
}

class MicNotEnabledError extends RecordingError {
  constructor(stream: MediaStream) {
    super("Mic not enabled", stream);
    this.name = "MicNotEnabledError";
  }
}

export class CameraRecorder {
  stream?: MediaStream;
  recorder?: MediaRecorder;
  url?: string;

  static async checkCameraPermission() {
    const result = await navigator.permissions.query({
      name: "camera" as PermissionName,
    });
    return result.state;
  }

  static async getBasicCameraStream({ audio = false }: { audio: boolean }) {
    const recorderStream = await navigator.mediaDevices.getUserMedia({
      audio: audio
        ? {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }
        : false,
      video: {
        facingMode: "user",
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 },
        aspectRatio: 1.7777777778,
      },
    });
    return recorderStream;
  }

  private async getStream({ audio = false }: { audio: boolean }) {
    const recorderStream = await CameraRecorder.getBasicCameraStream({ audio });

    // if video ends, audio should too.
    recorderStream.getTracks()[0].addEventListener("ended", async () => {
      await this.stopRecording();
    });

    return recorderStream;
  }

  attachStreamToVideoElement(videoElement: HTMLVideoElement) {
    if (!this.stream) {
      throw new Error("No stream to attach to video element");
    }
    videoElement.srcObject = this.stream;
  }

  async startRecording({
    onStop,
    onRecordingCanceled,
    onRecordingFailed,
    downloadStream,
    audio = false,
  }: {
    onStop?: () => void;
    onRecordingCanceled?: () => void;
    onRecordingFailed?: () => void;
    downloadStream?: boolean;
    audio?: boolean;
  }) {
    if (this.recorder) {
      this.recorder.stop();
    }
    try {
      this.stream = await this.getStream({ audio });
    } catch (e) {
      if (e instanceof DOMException) {
        console.warn("Permission denied: user canceled recording");
        await onRecordingCanceled?.();
        return false;
      } else if (e instanceof RecordingError) {
        e.log();
        await onRecordingFailed?.();
        return false;
      } else {
        console.error(e);
        await onRecordingFailed?.();
        return false;
      }
    }
    this.recorder = new MediaRecorder(this.stream, {
      mimeType: "video/webm;codecs=vp9,opus",
    });

    // Start recording.
    this.recorder.start();
    this.recorder.addEventListener("dataavailable", async (event) => {
      if (downloadStream) {
        let recordedBlob = event.data;
        let url = URL.createObjectURL(recordedBlob);

        let a = document.createElement("a");

        a.style.display = "none";
        a.href = url;
        a.download = "screen-recording.webm";

        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);

        URL.revokeObjectURL(url);
      }
      onStop && (await onStop());
    });
    return true;
  }

  public get isRecording() {
    return Boolean(this.recorder && this.recorder.state === "recording");
  }

  /**
   * For programmatically stopping the recording.
   */
  async stopRecording() {
    this.stream.getTracks().forEach((track) => track.stop());
    this.recorder.stop();
    this.recorder = undefined;
  }
}
```
