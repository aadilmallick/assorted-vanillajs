# COmplete starter pack for Node.js

## CLI + color logs + file managing

```ts
import { execFile, spawn, spawnSync } from 'node:child_process'
import * as path from 'node:path'
import fs from 'node:fs/promises'
import os from 'node:os'

interface ProcessOptions {
  cwd?: string
  quiet?: boolean
  detached?: boolean
}

class LinuxError extends Error {
  constructor(command: string, extraData?: string) {
    super(`Running the '${command}' command caused this error`)
    console.error(extraData)
  }
}

export class Print {
  private static colors = {
    RED: '\x1b[31m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    MAGENTA: '\x1b[35m',
    CYAN: '\x1b[36m',
  }

  private static RESET = '\x1b[0m'
  static red = (...args: unknown[]) =>
    console.log(Print.colors.RED, ...args, Print.RESET)

  static green = (...args: unknown[]) =>
    console.log(Print.colors.GREEN, ...args, Print.RESET)

  static yellow = (...args: unknown[]) =>
    console.log(Print.colors.YELLOW, ...args, Print.RESET)

  static blue = (...args: unknown[]) =>
    console.log(Print.colors.BLUE, ...args, Print.RESET)

  static magenta = (...args: unknown[]) =>
    console.log(Print.colors.MAGENTA, ...args, Print.RESET)

  static cyan = (...args: unknown[]) =>
    console.log(Print.colors.CYAN, ...args, Print.RESET)
}

export class FileManager {
  static async exists(filePath: string) {
    try {
      await fs.access(filePath)
      return true // The file exists
    }
    catch (_error) {
      return false // The file does not exist
    }
  }

  static async readFileAsBase64(filePath: string) {
    return await fs.readFile(filePath, { encoding: 'base64' })
  }

  static async readFileAsBuffer(filePath: string) {
    return await fs.readFile(filePath)
  }

  static async createDirectory(
    directoryPath: string,
    options?: {
      overwrite?: boolean
    },
  ) {
    if (await this.exists(directoryPath)) {
      if (options?.overwrite) {
        await fs.rm(directoryPath, { recursive: true, force: true })
        await fs.mkdir(directoryPath, { recursive: true })
      }
    }
    else {
      await fs.mkdir(directoryPath, { recursive: true })
    }
  }

  static async createTextFile(
    filepath: string,
    content: string,
    options?: {
      overwrite?: boolean
    },
  ) {
    if ((await this.exists(filepath)) && options?.overwrite) {
      await fs.rm(filepath)
    }
    await fs.writeFile(filepath, content, {
      encoding: 'utf-8',
    })
  }

  static async createFileFromBase64(
    filepath: string,
    content: string,
    options?: {
      overwrite?: boolean
    },
  ) {
    if ((await this.exists(filepath)) && options?.overwrite) {
      await fs.rm(filepath)
    }
    await fs.writeFile(filepath, content, {
      encoding: 'base64',
    })
  }

  static async createFileFromBuffer(
    filepath: string,
    content: Buffer,
    options?: {
      overwrite?: boolean
    },
  ) {
    if ((await this.exists(filepath)) && options?.overwrite) {
      await fs.rm(filepath)
    }
    await fs.writeFile(filepath, content)
  }

  static async createFileFromBinaryData(
    filepath: string,
    content: Buffer,
    options?: {
      override?: boolean
    },
  ) {
    if ((await this.exists(filepath)) && options?.override) {
      await fs.rm(filepath)
    }
    await fs.writeFile(filepath, content, {
      encoding: 'binary',
    })
  }

  static async readTextFile(
    filepath: string,
    encoding: BufferEncoding = 'utf-8',
  ): Promise<string> {
    if (!(await this.exists(filepath))) {
      throw new Error(`File not found: ${filepath}`)
    }
    return await fs.readFile(filepath, { encoding })
  }

  static async listFiles(directoryPath: string): Promise<string[]> {
    if (!(await this.exists(directoryPath))) {
      throw new Error(`Directory not found: ${directoryPath}`)
    }
    const entries = await fs.readdir(directoryPath, { withFileTypes: true })
    return entries.filter(entry => entry.isFile()).map(entry => entry.name)
  }

  static async listDirectories(directoryPath: string): Promise<string[]> {
    if (!(await this.exists(directoryPath))) {
      throw new Error(`Directory not found: ${directoryPath}`)
    }
    const entries = await fs.readdir(directoryPath, { withFileTypes: true })
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
  }

  static async copyFile(
    sourcePath: string,
    destinationPath: string,
  ): Promise<void> {
    if (!(await this.exists(sourcePath))) {
      throw new Error(`Source file not found: ${sourcePath}`)
    }
    await fs.copyFile(sourcePath, destinationPath)
  }

  static async moveFile(
    sourcePath: string,
    destinationPath: string,
  ): Promise<void> {
    if (!(await this.exists(sourcePath))) {
      throw new Error(`Source file not found: ${sourcePath}`)
    }
    await fs.rename(sourcePath, destinationPath)
  }

  static async getFileSize(filepath: string): Promise<number> {
    if (!(await this.exists(filepath))) {
      throw new Error(`File not found: ${filepath}`)
    }
    const stats = await fs.stat(filepath)
    return stats.size
  }

  static getAbsolutePath(filePath: string) {
    return path.join(process.cwd(), path.normalize(filePath))
  }
}

export default class CLI {
  static isLinux() {
    const platform = os.platform()
    return platform === 'linux'
  }

  static isWindows() {
    const platform = os.platform()
    return platform === 'win32'
  }

  static getAbsolutePath(filePath: string) {
    return path.join(__dirname, path.normalize(filePath))
  }

  /**
   * Synchronous linux command execution. Returns the stdout and status code
   */
  static linux_sync(command: string, args: string[] = [], cwd = process.cwd()) {
    try {
      const { status, stdout, stderr } = spawnSync(command, args, {
        encoding: 'utf8',
        cwd,
      })
      if (stderr) {
        throw new LinuxError(command, stderr)
      }
      return { stdout, status }
    }
    catch (e) {
      console.error(e)
      throw new LinuxError(command)
    }
  }

  /**
   * Synchronous linux command execution. Returns the stdout and status code
   */
  static linux_shell_sync(
    command: string,
    args: string[] = [],
    cwd = process.cwd(),
  ) {
    try {
      const { status, stdout, stderr } = spawnSync(command, args, {
        encoding: 'utf8',
        shell: true,
        cwd,
      })
      if (stderr) {
        throw new LinuxError(command, stderr)
      }
      return { stdout, status }
    }
    catch (e) {
      console.error(e)
      throw new LinuxError(command)
    }
  }

  /**
   * Asynchronous command execution for executable files
   *
   * @param filepath the path to the executable
   * @param command any commands to pass to the executable
   * @param options cli options
   * @returns stdout or stderr
   */
  static run_executable(
    filepath: string,
    command: string,
    options?: ProcessOptions,
  ): Promise<string> {
    const args = command
      .match(/(?:[^\s"]+|"[^"]*")+/g)
      ?.map(arg => arg.replace(/"/g, ''))
    if (!args) {
      throw new Error('Invalid command')
    }
    return new Promise((resolve, reject) => {
      execFile(
        filepath,
        args,
        {
          maxBuffer: 500 * 1_000_000,
          ...options,
        },
        (error, stdout, stderr) => {
          if (error) {
            Print.yellow(`Error executing ${path.basename(filepath)}:`, error)
            reject(stderr)
          }
          else {
            resolve(stdout)
          }
        },
      )
    })
  }

  /**
   * Asynchronous command execution for bash shell
   *
   * @param command the command to run
   * @param options cli options
   * @returns stdout or stderr
   */
  static linuxAsync(
    command: string,
    options?: ProcessOptions,
  ): Promise<string> {
    try {
      // send back stderr and stdout
      return new Promise((resolve, reject) => {
        const child = spawn(command, {
          shell: true,
          ...options,
        })
        let stdout = ''
        let stderr = ''

        child.stdout?.on('data', (data) => {
          if (!options?.quiet) console.log(data.toString())
          stdout += data.toString()
        })

        child.stderr?.on('data', (data) => {
          if (!options?.quiet) console.log(data.toString())
          stderr += data.toString()
        })

        child.on('close', (code) => {
          if (code !== 0) {
            reject(new LinuxError(command, stderr))
          }
          else {
            resolve(stdout)
          }
        })
      })
    }
    catch (_e) {
      console.error(_e)
      throw new LinuxError(command)
    }
  }
}
```

### sanitize filename

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

## Proxies

```ts
/**
 * Creates a reactive proxy that monitors changes to multiple properties, triggers callback when any of those
 * properties change.
 */
function createReactiveProxyMultipleProps<T extends Record<string, any>>(
  state: T,
  onSet: (state: T, propertyChanged: keyof T, newValue: T[keyof T]) => void,
) {
  const proxy = new Proxy(state, {
    set(target, p, newValue, receiver) {
      onSet(target, p as keyof T, newValue as T[keyof T])
      return Reflect.set(target, p, newValue, receiver)
    },
  })
  return proxy
}

/**
 * Class for managing state with reactive properties and change subscriptions
 * @template T The type of the state object (must be a record with string keys)
 * @example
 * ```typescript
 * const manager = new StateManager({ count: 0 });
 * manager.onChange('count', (newValue) => console.log(`Count is now ${newValue}`));
 * manager.state.count = 1; // Logs: "count changed to 1" and "Count is now 1"
 * ```
 */

export class StateManager<T extends Record<string, any>> {
  private cbs: Record<keyof T, (newValue: T[keyof T]) => void> = {} as Record<
    keyof T,
    (newValue: T[keyof T]) => void
  >

  constructor(state: T) {
    this.state = createReactiveProxyMultipleProps(
      state,
      (state, propertyChanged, newValue) => {
        console.log(`${String(propertyChanged)} changed to ${newValue}`)
        if (this.cbs[propertyChanged]) {
          this.cbs[propertyChanged](newValue)
        }
      },
    )
  }

  onChange<K extends keyof T>(key: K, callback: (newValue: T[K]) => void) {
    this.cbs[key] = callback as (newValue: T[keyof T]) => void
  }

  state: T
}
```

## Intellisense

```ts
export class Intellisense {
  private static interpolateTemplate(strings: TemplateStringsArray, values: any[]): string {
    let str = ''
    strings.forEach((string, i) => {
      str += string + (values[i] || '')
    })
    return str
  }

  static html(strings: TemplateStringsArray, ...values: any[]) {
    return this.interpolateTemplate(strings, values)
  }

  static css(strings: TemplateStringsArray, ...values: any[]) {
    return this.interpolateTemplate(strings, values) 
  }

  static sql(strings: TemplateStringsArray, ...values: any[]) {
    return this.interpolateTemplate(strings, values)
  }
}
```

## Express Utils

### Zod Validation + route error handling


```ts
import { z, ZodError, ZodIssue } from 'zod'

interface ParsedZodIssue {
  path: string
  message: string
  code: string
}

interface ParsedZodError {
  errors: ParsedZodIssue[]
}

function parseZodError(error: ZodError): ParsedZodError {
  return {
    errors: error.errors.map((issue: ZodIssue) => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    })),
  }
}

export class Validation<T extends Record<string, any>> {
  constructor(public schema: z.ZodObject<T>) {}

  createObjectWithAutocomplete(obj: T) {
    return obj
  }

  isOfType(value: unknown): value is T {
    return this.schema.safeParse(value).success
  }

  validateSchema(value: unknown) {
    return this.schema.parse(value)
  }

  pick(value: unknown, keys: (keyof T)[]) {
    const obj: Partial<Record<keyof T, true>> = {}
    for (const key of keys) {
      obj[key] = true
    }
    return this.schema
      .pick(obj as unknown as Parameters<z.ZodObject<T>['pick']>[0])
      .parse(value)
  }

  omit(value: unknown, keys: (keyof T)[]) {
    const obj: Partial<Record<keyof T, true>> = {}
    for (const key of keys) {
      obj[key] = true
    }
    return this.schema
      .omit(obj as unknown as Parameters<z.ZodObject<T>['omit']>[0])
      .parse(value)
  }

  static getZodErrorInfo(error: unknown) {
    const isZodError = error instanceof ZodError
      || (error instanceof Error && error.message.includes('ZodError'))
    if (isZodError) {
      return parseZodError(error as ZodError)
    }
    if (error instanceof Error) {
      return {
        message: error.message,
      }
    }
    return null
  }
}
```

```ts
import { Request, Response } from 'express'
import { Validation } from '../app/db/validation'

export function zodErrorHandlerWrapper(
  fn: (req: Request, res: Response) => Promise<void>,
  options?: {
    onError?: (error: Error) => Promise<void> | void
  },
) {
  return async (req: Request, res: Response) => {
    try {
      await fn(req, res)
    }
    catch (error) {
      console.error(`Error occurred at ${req.originalUrl}:`, error)
      if (options?.onError) {
        await options.onError(error as Error)
      }
      const data = Validation.getZodErrorInfo(error)
      res.status(500).json({
        error: 'Internal server error',
        ...data,
      })
    }
  }
}
```