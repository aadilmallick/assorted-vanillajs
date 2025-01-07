# PromisesManager

A class for working better with promises.

```ts
export class PromisesManager {
  static async concurrentPool<T>(promises: T[], maxPoolCount = 50) {
    let results = [] as T[];
    for (let i = 0; i < promises.length; i += maxPoolCount) {
      const promiseSlice = promises.slice(
        i,
        Math.min(i + maxPoolCount, promises.length)
      );
      const resultSlice = await Promise.allSettled(promiseSlice);
      const validResults = resultSlice
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);
      resultSlice
        .filter((result) => result.status === "rejected")
        .forEach((result) => {
          console.log(`Promise rejected: ${result.reason}`);
        });
      results = results.concat(validResults);
    }
    return results;
  }

  /**
   * Retries a promise function up to a specified number of attempts on failure.
   * @param promiseFn Function returning a promise to retry.
   * @param retries Number of retry attempts.
   * @param delay Delay in milliseconds between retries.
   */
  static async retry<T>(
    promiseFn: () => Promise<T>,
    retries = 3,
    delay = 1000
  ): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await promiseFn();
      } catch (error) {
        lastError = error;
        if (attempt < retries) {
          console.warn(
            `Retrying (${attempt + 1}/${retries}) after error:`,
            error
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  }

  /**
   * Executes promises sequentially, ensuring that one promise finishes before the next starts.
   * @param promiseFns Array of functions returning promises.
   */
  static async sequential<T>(promiseFns: (() => Promise<T>)[]): Promise<T[]> {
    const results: T[] = [];
    for (const promiseFn of promiseFns) {
      try {
        results.push(await promiseFn());
      } catch (error) {
        console.error("Promise failed in sequence:", error);
      }
    }
    return results;
  }

  /**
   * Wraps a promise with a timeout, rejecting it if it doesn't resolve within the specified time.
   * @param promise The promise to wrap.
   * @param timeout Timeout duration in milliseconds.
   * @param timeoutMessage Optional custom timeout error message.
   */
  static withTimeout<T>(
    promise: Promise<T>,
    timeout: number,
    timeoutMessage = "Promise timed out"
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(timeoutMessage)),
        timeout
      );
      promise
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }
}
```
