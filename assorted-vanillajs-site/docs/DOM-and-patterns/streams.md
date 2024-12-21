# Streams

This is all about streams:

```ts
class ReadableStreamManager<T extends Uint8Array<ArrayBufferLike>> {
  constructor(public stream: ReadableStream<T>) {}

  // consuming stream methods with async for loop
  async consumeStream() {
    const chunks = [] as T[];
    for await (const chunk of this.stream) {
      chunks.push(chunk);
    }
    return chunks;
  }

  async consumeStreamAsBlob(type: string) {
    const chunks = await this.consumeStream();
    return this.typedArrayToBlob(chunks, type);
  }

  async onConsumeStream(cb: (chunk: T) => Promise<void>) {
    for await (const chunk of this.stream) {
      await cb(chunk);
    }
  }

  typedArrayToBlob(typedArrayData: T[], type: string) {
    return new Blob(typedArrayData, { type });
  }

  // dealing with compression and decompression
  async getCompressedStream() {
    return await ReadableStreamManager.getCompressedStream(this.stream);
  }

  static async getCompressedTextStream(text: string) {
    const encoder = new TextEncodingManager();
    const encodedText = encoder.encodeText(text);
    const compressedStream = new CompressionStream("gzip");
    const writer = compressedStream.writable.getWriter();

    // Write data to the compression stream
    await writer.write(encodedText);
    await writer.close();
    return compressedStream.readable;
  }

  static async getCompressedStream(stream: ReadableStream) {
    const compressedReadableStream = stream.pipeThrough(
      new CompressionStream("gzip")
    );
    return compressedReadableStream;
  }

  static async getDecompressedStream(stream: ReadableStream) {
    const ds = new DecompressionStream("gzip");
    const decompressedStream = stream.pipeThrough(ds);
    return decompressedStream;
  }

  async decompressStream() {
    return await ReadableStreamManager.decompressStream(this.stream);
  }

  static async decompressStream(stream: ReadableStream) {
    const ds = new DecompressionStream("gzip");
    const decompressedStream = stream.pipeThrough(ds);
    return await new Response(decompressedStream).blob();
  }

  static async decompressBlob(blob: Blob) {
    const ds = new DecompressionStream("gzip");
    const decompressedStream = blob.stream().pipeThrough(ds);
    return await new Response(decompressedStream).blob();
  }

  static async streamToResponse(stream: ReadableStream) {
    return new Response(stream);
  }
}

// to encode text
export class TextEncodingManager {
  encoder = new TextEncoder();
  decoder = new TextDecoder();

  encodeText(text: string) {
    return this.encoder.encode(text);
  }

  decodeText(data: Uint8Array) {
    return this.decoder.decode(data);
  }
}
```
