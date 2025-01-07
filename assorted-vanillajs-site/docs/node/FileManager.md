# FIleManager

```ts
import fs from "node:fs/promises";

export class FileManager {
  static async exists(filePath: string) {
    try {
      await fs.access(filePath);
      return true; // The file exists
    } catch (_) {
      return false; // The file does not exist
    }
  }

  static async removeFile(filepath: string) {
    if (await this.exists(filepath)) {
      await fs.rm(filepath);
    }
  }

  static async createFile(
    filepath: string,
    content: string,
    options?: {
      override?: boolean;
    }
  ) {
    if ((await this.exists(filepath)) && options?.override) {
      await fs.rm(filepath);
    }
    await fs.writeFile(filepath, content);
  }

  static async createDirectory(
    directoryPath: string,
    options?: {
      overwrite?: boolean;
    }
  ) {
    if (await this.exists(directoryPath)) {
      if (options?.overwrite) {
        await fs.rm(directoryPath, { recursive: true, force: true });
        await fs.mkdir(directoryPath, { recursive: true });
      }
    } else {
      await fs.mkdir(directoryPath, { recursive: true });
    }
  }

  static async readFile(
    filepath: string,
    encoding: BufferEncoding = "utf-8"
  ): Promise<string> {
    if (!(await this.exists(filepath))) {
      throw new Error(`File not found: ${filepath}`);
    }
    return await fs.readFile(filepath, { encoding });
  }

  static async listFiles(directoryPath: string): Promise<string[]> {
    if (!(await this.exists(directoryPath))) {
      throw new Error(`Directory not found: ${directoryPath}`);
    }
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });
    return entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
  }

  static async listDirectories(directoryPath: string): Promise<string[]> {
    if (!(await this.exists(directoryPath))) {
      throw new Error(`Directory not found: ${directoryPath}`);
    }
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  }

  static async copyFile(
    sourcePath: string,
    destinationPath: string
  ): Promise<void> {
    if (!(await this.exists(sourcePath))) {
      throw new Error(`Source file not found: ${sourcePath}`);
    }
    await fs.copyFile(sourcePath, destinationPath);
  }

  static async moveFile(
    sourcePath: string,
    destinationPath: string
  ): Promise<void> {
    if (!(await this.exists(sourcePath))) {
      throw new Error(`Source file not found: ${sourcePath}`);
    }
    await fs.rename(sourcePath, destinationPath);
  }

  static async getFileSize(filepath: string): Promise<number> {
    if (!(await this.exists(filepath))) {
      throw new Error(`File not found: ${filepath}`);
    }
    const stats = await fs.stat(filepath);
    return stats.size;
  }
}
```

## sanitize filename

```ts
/**
 * Sanitizes a string to make it safe for use as a filename by removing invalid characters.
 * @param {string} filename - The input string to sanitize.
 * @returns {string} - The sanitized filename.
 */
export function sanitizeFilename(filename: string) {
  // Regular expression to match invalid filename characters
  const invalidCharsRegex = /[\/\\\:\*\?\"\<\>\|]/g;
  const nonAlphanumericRegex = /[^a-zA-Z0-9\-\s\.]/g;
  let newFilename = "";

  // Replace invalid characters with an empty string
  newFilename = filename.replace(invalidCharsRegex, "");
  newFilename = newFilename.replace(nonAlphanumericRegex, "");
  newFilename = crypto.randomUUID().slice(0, 12) + "-" + newFilename;
  newFilename = newFilename.replace(/\s/g, "_");
  return newFilename.slice(0, Math.min(50, newFilename.length));
}
```
