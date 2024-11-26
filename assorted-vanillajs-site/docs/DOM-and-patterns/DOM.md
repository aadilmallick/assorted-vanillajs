# DOM utils

## DOM manipulations

A class for creating DOM elements from HTML strings, selecting elements, and adding elements to a container.

```ts
export class DOM {
  static createDomElement(html: string) {
    const dom = new DOMParser().parseFromString(html, "text/html");
    return dom.body.firstElementChild as HTMLElement;
  }
  static $ = (selector: string): HTMLElement | null =>
    document.querySelector(selector) as HTMLElement | null;
  static $$ = (selector: string): NodeListOf<HTMLElement> =>
    document.querySelectorAll(selector);

  static selectWithThrow = (selector: string): HTMLElement => {
    const el = DOM.$(selector);
    if (!el) {
      throw new Error(`Element not found: ${selector}`);
    }
    return el;
  };

  static addElementsToContainer(
    container: HTMLElement,
    elements: HTMLElement[]
  ) {
    const fragment = document.createDocumentFragment();
    elements.forEach((el) => fragment.appendChild(el));
    container.appendChild(fragment);
  }
}
```

- `DOM.createDomElement(html: string): HTMLElement` : Creates a DOM element from an HTML string
- `DOM.$(selector: string): HTMLElement | null` : Selects an element from the DOM
- `DOM.$$(selector: string): NodeListOf<HTMLElement>` : Selects all elements from the DOM
- `DOM.selectWithThrow(selector: string): HTMLElement` : Selects an element from the DOM and throws an error if it doesn't exist
- `DOM.addElementsToContainer(container: HTMLElement, elements: HTMLElement[])` : Adds an array of elements to a container

## Abort controller manager

A class for managing an `AbortController` instance and its signal.

```ts
export class AbortControllerManager {
  private controller = new AbortController();

  get signal() {
    return this.controller.signal;
  }

  abort() {
    this.controller.abort();
  }
}
```

## Fullscreen Model

A class for managing fullscreen mode in the browser.

```ts
export class FullscreenModel {
  constructor(private element: HTMLElement) {}

  async enterFullscreen() {
    if (this.isFullscreenEnabled) {
      await this.element.requestFullscreen();
    }
  }

  async exitFullscreen() {
    await document.exitFullscreen();
  }

  onFullscreenChange(callback: (isFullScreen: boolean) => void) {
    document.addEventListener("fullscreenchange", () => {
      callback(
        this.fullScreenElement !== null || this.fullScreenElement !== undefined
      );
    });
  }

  get fullScreenElement() {
    return document.fullscreenElement;
  }

  get isFullscreenEnabled() {
    return document.fullscreenEnabled;
  }
}
```

## LocalStorage

A class for managing local storage in the browser.

```ts
export class LocalStorageBrowser<T extends Record<string, any>> {
  constructor(private prefix: string = "") {}

  private getKey(key: keyof T & string): string {
    return this.prefix + key;
  }

  public set<K extends keyof T & string>(key: K, value: T[K]): void {
    window.localStorage.setItem(this.getKey(key), JSON.stringify(value));
  }

  public get<K extends keyof T & string>(key: K): T[K] | null {
    const item = window.localStorage.getItem(this.getKey(key));
    return item ? JSON.parse(item) : null;
  }

  public removeItem(key: keyof T & string): void {
    window.localStorage.removeItem(this.getKey(key));
  }

  public clear(): void {
    window.localStorage.clear();
  }
}
```

Here is an example usage:

```ts
import { LocalStorageBrowser } from "assorted-vanillajs";

interface User {
  name: string;
  age: number;
}

const storage = new LocalStorageBrowser<User>("user_");

storage.set("name", "John Doe");
```

## Date Model

```ts
export class DateModel {
  /**
   *
   * @param time the timestring like 20:35 to convert into a date
   */
  static convertTimeToDate(time: string) {
    const date = new Date();
    const [hours, minutes] = time.split(":");
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    return date;
  }

  /**
   *
   * @param dateMillis the date in milliseconds to convert into a time string
   */
  static convertDateToTime(dateMillis: number) {
    const date = new Date(dateMillis);
    const hours = `${date.getHours()}`.padStart(2, "0");
    const minutes = `${date.getMinutes()}`.padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  static militaryToStandardTime(militaryTime: string) {
    const [hours, minutes] = militaryTime.split(":");
    let hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    hour = hour % 12 || 12;

    // Format the time string
    const formattedTime = `${hour}:${minutes.padStart(2, "0")} ${ampm}`;
    return formattedTime;
  }
}
```

## HTML and CSS template string intellisense

```ts
export function html(strings: TemplateStringsArray, ...values: any[]) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (values[i] || "");
  });
  return str;
}

export function css(strings: TemplateStringsArray, ...values: any[]) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (values[i] || "");
  });
  return str;
}
```

## CSS Variables Manager

```ts
export class CSSVariablesManager<
  T extends Record<string, any> = Record<string, string>
> {
  constructor(private element: HTMLElement) {}

  private formatName(name: string) {
    if (name.startsWith("--")) {
      return name;
    }
    return `--${name}`;
  }

  set<K extends keyof T>(name: K, value: T[K]) {
    this.element.style.setProperty(
      this.formatName(name as string),
      String(value)
    );
  }

  get(name: keyof T) {
    return this.element.style.getPropertyValue(this.formatName(name as string));
  }
}
```

Here is an example usage:

```ts
import { CSSVariablesManager } from "assorted-vanillajs";

const element = document.querySelector(".element") as HTMLElement;
const cssVariables = new CSSVariablesManager(element);

cssVariables.set("color", "red");
```

## MatchMedia

```ts
export class MatchMedia {
  static isMobile() {
    const match = window.matchMedia("(pointer:coarse)");
    return match && match.matches;
  }

  static isDarkMode() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }
}
```

## DOM lifecycle

```ts
export class DOMLifecycleManager {
  static documentIsReady() {
    return new Promise<boolean>((resolve) => {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => resolve(true));
      } else {
        resolve(true);
      }
    });
  }

  static onWindowClosed(callback: () => void) {
    window.addEventListener("unload", callback);
  }

  static beforeWindowClosed(callback: () => void) {
    window.addEventListener("beforeunload", callback);
  }

  static preventWindowClose(message: string) {
    window.addEventListener("beforeunload", (e) => {
      e.preventDefault();
      return message;
    });
  }
}
```
