# OPFS

## Origin private file system class

```ts
class OPFS {
  private root!: FileSystemDirectoryHandle;
  async openDirectory() {
    this.root = await navigator.storage.getDirectory();
  }

  public get directory() {
    return this.root;
  }

  async getDirectoryContents() {
    this.validate();
    const data = [] as { name: string; fileHandle: FileSystemHandle }[];
    for await (let [name, handle] of this.root) {
      data.push({ name, fileHandle: handle });
    }
    return data;
  }

  private validate(): this is { root: FileSystemDirectoryHandle } {
    if (!this.root) {
      throw new Error("Root directory not set");
    }
    return true;
  }
  async createFile(filename: string) {
    this.validate();
    const file = await this.root.getFileHandle(filename, { create: true });
    return file;
  }

  async getFileHandle(filename: string) {
    this.validate();
    const file = await this.root.getFileHandle(filename);
    return file;
  }

  async deleteFile(filename: string) {
    this.validate();
    await this.root.removeEntry(filename);
  }

  async getFile(filename: string) {
    const fileHandle = await this.getFileHandle(filename);
    return await fileHandle.getFile();
  }

  async getFileAsURL(filename: string) {
    return URL.createObjectURL(await this.getFile(filename));
  }

  static async writeToFileHandle(
    file: FileSystemFileHandle,
    data: string | Blob | ArrayBuffer
  ) {
    const writable = await file.createWritable();
    await writable.write(data);
    await writable.close();
  }
}

const openDirectoryButton = document.getElementById("open-directory-button");
const opfs = new OPFS();
openDirectoryButton?.addEventListener("click", async () => {
  await opfs.openDirectory();
  console.log("Directory opened");
  console.log(opfs.directory);
});
```

## File handle

```ts
type FileAcceptType = {
  description: string;
  accept: Record<string, string[]>; // MIME type to file extension
};

export class FileSystemManager {
  static async openSingleFile(types: FileAcceptType[]) {
    const [fileHandle] = await window.showOpenFilePicker({
      types,
      excludeAcceptAllOption: true,
      multiple: false,
    });
    return fileHandle;
  }

  static async openMultipleFiles(types: FileAcceptType[]) {
    const fileHandles = await window.showOpenFilePicker({
      types,
      excludeAcceptAllOption: true,
      multiple: true,
    });
    return fileHandles;
  }

  static async openDirectory() {
    const dirHandle = await window.showDirectoryPicker();
    return await dirHandle.values();
  }

  static async saveTextFile(text: string) {
    const fileHandle = await window.showSaveFilePicker({
      types: [
        {
          description: "Text files",
          accept: {
            "text/*": [".txt", ".md", ".html", ".css", ".js", ".json"],
          },
        },
      ],
    });
    await this.writeData(fileHandle, text);
  }

  static async saveFile(options: {
    data: any;
    types?: FileAcceptType[];
    name?: string;
    startIn?:
      | "desktop"
      | "documents"
      | "downloads"
      | "pictures"
      | "videos"
      | "music";
  }) {
    const fileHandle = await window.showSaveFilePicker({
      types: options.types,
      suggestedName: options.name,
      startIn: options.startIn,
    });
    await this.writeData(fileHandle, data);
  }

  private static async writeData(fileHandle: any, data: any) {
    const writable = await fileHandle.createWritable();
    await writable.write(data);
    await writable.close();
  }
}
```
