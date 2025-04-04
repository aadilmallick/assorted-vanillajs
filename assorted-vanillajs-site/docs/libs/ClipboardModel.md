# ClipboardModel

A utility class for interacting with the system clipboard, providing methods to read and write various types of data including text, HTML, and images.

## Class Methods

### `readText(): Promise<string | null>`

Reads plain text from the system clipboard.

**Returns:** Promise resolving to the clipboard text content or null if the operation fails

**Example:**

```typescript
const text = await ClipboardModel.readText();
if (text) {
  console.log("Clipboard text:", text);
}
```

### `readClipboardDataAsText(): Promise<string | null>`

Reads text data from the clipboard using the Clipboard API.

**Returns:** Promise resolving to the clipboard text content or null if no text data is available

**Example:**

```typescript
const text = await ClipboardModel.readClipboardDataAsText();
if (text) {
  console.log("Clipboard text:", text);
}
```

### `readClipboardDataAsHTML(): Promise<string | null>`

Reads HTML content from the clipboard using the Clipboard API.

**Returns:** Promise resolving to the clipboard HTML content or null if no HTML data is available

**Example:**

```typescript
const html = await ClipboardModel.readClipboardDataAsHTML();
if (html) {
  console.log("Clipboard HTML:", html);
}
```

### `readClipboardDataAsImage(options?: { asBlob?: boolean }): Promise<Blob | string | null>`

Reads image data from the clipboard using the Clipboard API.

**Parameters:**

- `options`: Optional configuration object
  - `asBlob`: If true, returns the image as a Blob. If false, returns a blob URL string

**Returns:** Promise resolving to either a Blob, blob URL string, or null if no image data is available

**Example:**

```typescript
// Get as blob URL
const imageUrl = await ClipboardModel.readClipboardDataAsImage();
if (imageUrl) {
  const img = new Image();
  img.src = imageUrl;
}

// Get as blob
const imageBlob = await ClipboardModel.readClipboardDataAsImage({
  asBlob: true,
});
if (imageBlob) {
  // Use the blob directly
}
```

### `copyText(text: string): Promise<void>`

Copies text to the system clipboard.

**Parameters:**

- `text`: The text string to copy to the clipboard

**Example:**

```typescript
await ClipboardModel.copyText("Hello, World!");
```

### `hasTextCopied(): Promise<boolean>`

Checks if the clipboard contains text data.

**Returns:** Promise resolving to true if text data is available in the clipboard

**Example:**

```typescript
const hasText = await ClipboardModel.hasTextCopied();
if (hasText) {
  // Handle text data
}
```

### `hasImageCopied(): Promise<boolean>`

Checks if the clipboard contains image data.

**Returns:** Promise resolving to true if image data is available in the clipboard

**Example:**

```typescript
const hasImage = await ClipboardModel.hasImageCopied();
if (hasImage) {
  // Handle image data
}
```

### `copyImage(path: string, mimeType: `image/${string}`): Promise<void>`

Copies an image to the clipboard from a given path.

**Parameters:**

- `path`: The path or URL of the image to copy
- `mimeType`: The MIME type of the image (e.g., "image/png", "image/jpeg")

**Example:**

```typescript
await ClipboardModel.copyImage("path/to/image.png", "image/png");
```

## Browser Support

This class uses the modern Clipboard API which is supported in most modern browsers. However, some features may require:

- HTTPS context
- User permission
- Browser support for specific MIME types

## Error Handling

The class includes basic error handling:

- Returns null for failed read operations
- Handles cases where clipboard data is not available
- Manages different image formats and conversions

## Private Methods

The class includes several private utility methods:

- `copyBlobToClipboard`: Handles copying blob data to clipboard
- `createClipboardItem`: Creates a ClipboardItem from blob data
- `setCanvasImage`: Converts image path to blob using canvas

## Class

```ts
export default class ClipboardModel {
  static async readText() {
    try {
      return await navigator.clipboard.readText();
    } catch (err) {
      return null;
    }
  }

  static async readClipboardDataAsText() {
    if (await ClipboardModel.hasTextCopied()) {
      const [clipboardItem] = await navigator.clipboard.read();
      let blob = await clipboardItem.getType("text/plain");
      return blob.text();
    }
    return null;
  }

  static async readClipboardDataAsHTML() {
    if (await ClipboardModel.hasTextCopied()) {
      const [clipboardItem] = await navigator.clipboard.read();
      let blob = await clipboardItem.getType("text/html");
      return blob.text();
    }
    return null;
  }

  static async readClipboardDataAsImage(options?: { asBlob?: boolean }) {
    if (await ClipboardModel.hasImageCopied()) {
      const [clipboardItem] = await navigator.clipboard.read();
      const mimeType = clipboardItem.types.find((type) =>
        type.startsWith("image/")
      );
      if (!mimeType) return null;
      const blob = await clipboardItem.getType(mimeType);
      if (options?.asBlob) {
        return blob;
      }
      const blobUrl = URL.createObjectURL(blob);
      return blobUrl;
    }
    return null;
  }

  static async copyText(text: string) {
    await navigator.clipboard.writeText(text);
  }

  static async hasTextCopied() {
    const [clipboardItem] = await navigator.clipboard.read();
    const typeMapping = clipboardItem.types.map((type) => type.split("/")[0]);
    return typeMapping.includes("text");
  }

  static async hasImageCopied() {
    const [clipboardItem] = await navigator.clipboard.read();
    const typeMapping = clipboardItem.types.map((type) => type.split("/")[0]);
    return typeMapping.includes("image");
  }

  static async copyImage(path: string, mimeType: `image/${string}`) {
    if (mimeType === "image/png") {
      const response = await fetch(path);
      const imageBlob = await response.blob();
      await ClipboardModel.copyBlobToClipboard(imageBlob, mimeType);
    } else {
      const imageBlob = await ClipboardModel.setCanvasImage(path);
      await ClipboardModel.copyBlobToClipboard(imageBlob, mimeType);
    }
  }

  private static async copyBlobToClipboard(blob: Blob, mimeType: string) {
    const data = [ClipboardModel.createClipboardItem(blob, mimeType)];
    await navigator.clipboard.write(data);
  }

  private static createClipboardItem(blob: Blob, mimeType: string) {
    const _blob = new Blob([blob], { type: mimeType });
    return new ClipboardItem({ [mimeType]: _blob });
  }

  private static setCanvasImage(path: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const c = document.createElement("canvas");
      const ctx = c.getContext("2d")!;

      img.onload = function () {
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        c.toBlob((blob) => {
          if (!blob) {
            reject("Failed to convert canvas to blob");
          } else {
            resolve(blob);
          }
        }, `image/png`);
      };
      img.src = path;
    });
  }
}
```
