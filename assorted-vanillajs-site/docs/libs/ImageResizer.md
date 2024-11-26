# Image Resizer

```ts
export default class ImageResizer {
  static resize(image: File, ratio: number): Promise<Blob | null> {
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
          const w = ele.width * ratio;
          const h = ele.height * ratio;
          canvas.width = w;
          canvas.height = h;
          context.drawImage(ele, 0, 0, w, h);

          // Get the data of resized image
          canvas.toBlob((blob) => {
            resolve(blob);
          }, image.type);
        });

        // Set the source
        ele.src = e.target!.result as string;
      });

      reader.addEventListener("error", function () {
        reject();
      });
    });
  }

  static downloadBlob(blob: Blob, name: string) {
    // 1. create blob url
    const blobUrl = URL.createObjectURL(blob);

    // 2. create a download link and automatically click it
    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", name);
    link.click();

    URL.revokeObjectURL(blobUrl);
  }

  static async resizeAndDownload(image: File, ratio: number, name?: string) {
    try {
      const blob = await ImageResizer.resize(image, ratio);
      if (!blob) {
        throw new Error("Failed to resize the image");
      }
      ImageResizer.downloadBlob(blob, name || `resized-${image.name}`);
      return { success: true };
    } catch (e) {
      return { success: false };
    }
  }
}
```
