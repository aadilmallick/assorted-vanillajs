# BlobDownloader

```ts
export class BlobDownloader {
  static downloadBlob(blob: Blob, filename: string) {
    let url = URL.createObjectURL(blob);

    let a = document.createElement("a");

    a.style.display = "none";
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  }
}
```
