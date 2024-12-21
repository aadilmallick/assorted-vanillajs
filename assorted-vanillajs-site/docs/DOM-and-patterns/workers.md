# Workers

Here is an easy way to use and work with workers.

```ts
export class WorkerModel<
  ChannelName extends string,
  PayloadType extends Record<string, any> = {}
> {
  // public access to worker so you can do worker specific things like worker.terminate()
  constructor(public worker: Worker, public channelName: ChannelName) {}

  onError(callback: (err: ErrorEvent) => void) {
    this.worker.addEventListener("error", callback);
  }

  postMessage(payload: PayloadType) {
    // automatically add "type" property to message we are sending
    this.worker.postMessage({
      type: this.channelName,
      payload,
    });
  }

  terminate() {
    this.worker.terminate();
  }

  // listen for a specific message
  onMessage(
    // add callback type which takes in payload of the specific message we are listening on
    callback: (payload: PayloadType) => void
  ) {
    this.worker.addEventListener("message", (event) => {
      const data = event.data as { type: ChannelName; payload: PayloadType };

      if (data.type === this.channelName) {
        // pass payload into callback
        callback(data.payload);
      }
    });
  }
}
```
