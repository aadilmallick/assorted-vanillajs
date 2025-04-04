# Image Resizer and Converter

A utility class for resizing, converting, and downloading images in various formats. This class provides methods to manipulate image dimensions while maintaining aspect ratio, convert between different image formats, and handle image downloads.

## Class Methods

### `resize(image: File | Blob, ratio: number): Promise<Blob>`

Resizes an image by applying a scaling ratio while maintaining aspect ratio.

**Parameters:**

- `image`: The image file or blob to resize
- `ratio`: The scaling factor (must be greater than 0)

**Returns:** Promise resolving to a Blob containing the resized image

**Example:**

```typescript
const resizedImage = await ImageConverter.resize(imageFile, 0.5); // Resize to 50%
```

### `resizeToWidth(image: File | Blob, width: number): Promise<Blob>`

Resizes an image to a specific width while maintaining aspect ratio.

**Parameters:**

- `image`: The image file or blob to resize
- `width`: Target width in pixels (must be greater than 20)

**Returns:** Promise resolving to a Blob containing the resized image

**Example:**

```typescript
const resizedImage = await ImageConverter.resizeToWidth(imageFile, 800);
```

### `resizeToDims(image: File | Blob, width: number, height: number): Promise<Blob>`

Resizes an image to specific dimensions.

**Parameters:**

- `image`: The image file or blob to resize
- `width`: Target width in pixels (must be greater than 20)
- `height`: Target height in pixels

**Returns:** Promise resolving to a Blob containing the resized image

**Example:**

```typescript
const resizedImage = await ImageConverter.resizeToDims(imageFile, 800, 600);
```

### `getOriginalDimensions(blobUrl: string): Promise<{width: number, height: number}>`

Retrieves the original dimensions of an image from its blob URL.

**Parameters:**

- `blobUrl`: The blob URL of the image

**Returns:** Promise resolving to an object containing width and height

**Example:**

```typescript
const dimensions = await ImageConverter.getOriginalDimensions(blobUrl);
console.log(dimensions.width, dimensions.height);
```

### `downloadBlob(blob: Blob | File, name?: string): void`

Downloads a blob or file to the user's device.

**Parameters:**

- `blob`: The blob or file to download
- `name`: Optional custom filename for the download

**Example:**

```typescript
ImageConverter.downloadBlob(imageBlob, "resized-image.png");
```

### `resizeAndDownload(image: File | Blob, ratio: number, name?: string): Promise<{success: boolean}>`

Resizes an image and triggers its download.

**Parameters:**

- `image`: The image file or blob to resize and download
- `ratio`: The scaling factor
- `name`: Optional custom filename for the download

**Returns:** Promise resolving to an object indicating success status

**Example:**

```typescript
const result = await ImageConverter.resizeAndDownload(
  imageFile,
  0.5,
  "resized.png"
);
```

### `convertImage(image: File | Blob, type: "png" | "jpeg" | "webp" = "png"): Promise<Blob>`

Converts an image to a different format.

**Parameters:**

- `image`: The image file or blob to convert
- `type`: Target format ("png", "jpeg", or "webp", defaults to "png")

**Returns:** Promise resolving to a Blob containing the converted image

**Example:**

```typescript
const webpImage = await ImageConverter.convertImage(imageFile, "webp");
```

## Error Handling

The class includes basic error handling for invalid inputs:

- Throws error for invalid ratio (≤ 0)
- Throws error for width too small (≤ 20)
- Handles failed image processing and conversion errors

## Browser Support

This class uses modern web APIs including:

- FileReader
- Canvas API
- Blob API
- URL API

Make sure to check browser compatibility before using in production.

```ts
export default class ImageConverter {
  static async resize(image: File | Blob, ratio: number) {
    if (ratio <= 0) {
      throw new Error("Invalid ratio");
    }
    return await this.processImage(image, {
      getNewDims: (width, height) => {
        return {
          width: Math.floor(width * ratio),
          height: Math.floor(height * ratio),
        };
      },
    });
  }

  static async resizeToWidth(image: File | Blob, width: number) {
    if (width <= 20) {
      throw new Error("Width too small");
    }
    return await this.processImage(image, {
      getNewDims: (w, h) => {
        const ratio = width / w;
        return {
          width: w * ratio,
          height: h * ratio,
        };
      },
    });
  }

  static async resizeToDims(image: File | Blob, width: number, height: number) {
    if (width <= 20) {
      throw new Error("Width too small");
    }
    return await this.processImage(image, {
      getNewDims: (w, h) => {
        return {
          width: width,
          height: height,
        };
      },
    });
  }

  static getOriginalDimensions(blobUrl: string): Promise<{
    width: number;
    height: number;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = function () {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        resolve({ width, height });
      };
      img.src = blobUrl;
    });
  }

  static downloadBlob(blob: Blob | File, name?: string) {
    // 1. create blob url
    const blobUrl = URL.createObjectURL(blob);

    let filename = "";
    if ("name" in blob) {
      filename = blob.name;
    } else {
      filename = `${crypto.randomUUID()}.${blob.type.split("/")[1]}`;
    }

    // 2. create a download link and automatically click it
    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", name || filename);
    link.click();

    URL.revokeObjectURL(blobUrl);
  }

  static async resizeAndDownload(
    image: File | Blob,
    ratio: number,
    name?: string
  ) {
    try {
      const blob = await ImageConverter.resize(image, ratio);
      if (!blob) {
        throw new Error("Failed to resize the image");
      }
      ImageConverter.downloadBlob(blob, name);
      return { success: true };
    } catch (e) {
      return { success: false };
    }
  }

  static async convertImage(
    image: File | Blob,
    type: "png" | "jpeg" | "webp" = "png"
  ) {
    return await this.processImage(image, {
      type,
    });
  }

  private static processImage(
    image: File | Blob,
    options?: {
      type?: "png" | "jpeg" | "webp";
      getNewDims?: (
        width: number,
        height: number
      ) => {
        width: number;
        height: number;
      };
    }
  ): Promise<Blob> {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();

      // Read the file
      reader.readAsDataURL(image);

      // Manage the `load` event
      reader.addEventListener("load", function (e) {
        // Create new image element
        const ele = new Image();
        ele.addEventListener("load", function () {
          // Create new canvas
          const canvas = document.createElement("canvas");

          // Draw the image that is scaled to `ratio`
          const context = canvas.getContext("2d")!;
          let w = ele.naturalWidth;
          let h = ele.naturalHeight;
          if (options?.getNewDims) {
            const newDims = options.getNewDims(w, h);
            w = newDims.width;
            h = newDims.height;
          }
          canvas.width = w;
          canvas.height = h;
          context.drawImage(ele, 0, 0, w, h);

          // Get the data of resized image
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject("Failed to convert canvas to blob");
                return;
              }
              resolve(blob);
            },
            options?.type ? `image/${options.type}` : image.type
          );
        });

        // Set the source
        ele.src = e.target!.result as string;
      });

      reader.addEventListener("error", function () {
        reject();
      });
    });
  }
}
```

### Docs
