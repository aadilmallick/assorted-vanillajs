# FFMPEG with WASM

1. install `@ffmpeg/ffmpeg` and `@ffmpeg/util`
2. Run `npm run build` if using vite.


```ts
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export class FFMpegBrowser {
  ffmpeg = new FFmpeg();
  #initialized?: boolean;
  baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
  constructor(vite = true, version = "0.12.6") {
    if (vite) {
      this.baseURL = `https://unpkg.com/@ffmpeg/core@${version}/dist/esm`;
    } else {
      this.baseURL = `https://unpkg.com/@ffmpeg/core@${version}/dist/umd`;
    }
  }

  async init() {
    const thing = await this.ffmpeg.load({
      coreURL: await toBlobURL(
        `${this.baseURL}/ffmpeg-core.js`,
        "text/javascript"
      ),
      wasmURL: await toBlobURL(
        `${this.baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
    console.log("thing", thing);
    this.#initialized = true;

    this.ffmpeg.on("log", ({ message }) => {
      console.log(message);
    });
  }

  onProgress(cb: (progress: number, time: number) => void) {
    this.ffmpeg.on("progress", ({ progress, time }) => {
      cb(progress, time);
    });
  }

  public get isLoaded() {
    return !!this.#initialized;
  }

  private parseCommand(
    command: string,
    inputFileName: string,
    outputFileName: string
  ) {
    if (!command.includes("$input") || !command.includes("$output")) {
      throw new Error("Command must include $input and $output placeholders");
    }
    const parsedCommand = command
      .replace("$input", `${inputFileName}`)
      .replace("$output", `${outputFileName}`)
      .split(" ");
    return parsedCommand;
  }

  async processVideo(
    url: string,
    command: string,
    options: {
      inputFileName: string;
      outputFileName: string;
    }
  ) {
    if (!this.#initialized) {
      throw new Error("FFMpeg not initialized");
    }
    await this.ffmpeg.writeFile(options.inputFileName, await fetchFile(url));
    const parsedCommand = this.parseCommand(
      command,
      options.inputFileName,
      options.outputFileName
    );
    console.log("parsedCommand", parsedCommand);
    await this.ffmpeg.exec(parsedCommand);
    const data = await this.ffmpeg.readFile(options.outputFileName);
    const blob = new Blob([data], { type: "image/gif" });
    return blob;
  }
}
```