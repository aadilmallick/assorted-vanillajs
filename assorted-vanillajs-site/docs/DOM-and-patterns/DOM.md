# DOM utils

## DOM manipulations

A class for creating DOM elements from HTML strings, selecting elements, and adding elements to a container.

```ts
export class DOM {
  /**
   * Adding elements
   * */
  static createDomElement(html: string) {
    const dom = new DOMParser().parseFromString(html, "text/html");
    return dom.body.firstElementChild as HTMLElement;
  }
  static addStyleTag(css: string) {
    const styles = document.createElement("style");
    styles.textContent = css;
    document.head.appendChild(styles);
    return styles;
  }
  static addElementsToContainer(
    container: HTMLElement,
    elements: HTMLElement[]
  ) {
    const fragment = document.createDocumentFragment();
    elements.forEach((el) => fragment.appendChild(el));
    container.appendChild(fragment);
  }

  /**
   * querying elements
   * */
  static $ = (selector: string): HTMLElement | null =>
    document.querySelector(selector);
  static $$ = (selector: string): NodeListOf<HTMLElement> =>
    document.querySelectorAll(selector);

  static $throw = (selector: string): HTMLElement => {
    const el = DOM.$(selector);
    if (!el) {
      throw new Error(`Element not found: ${selector}`);
    }
    return el;
  };

  static createQuerySelectorWithThrow(
    containerElement: HTMLElement | ShadowRoot
  ) {
    const select = containerElement.querySelector.bind(
      containerElement
    ) as Selector;
    return ((_class: keyof HTMLElementTagNameMap) => {
      const query = select(_class);
      if (!query) throw new Error(`Element with selector ${_class} not found`);
      return query;
    }) as Selector;
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

  get isAborted() {
    return this.controller.signal.aborted;
  }

  reset() {
    this.controller = new AbortController();
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
  constructor(private element: HTMLElement, defaultValues?: T) {
    if (defaultValues) {
      Object.entries(defaultValues).forEach(([key, value]) => {
        this.set(key, value);
      });
    }
  }

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

  static get pageIsFocused() {
    return document.hasFocus();
  }

  static get pageIsVisible() {
    return !document.hidden;
  }

  static onVisibilityChange(callback: (isVisible: boolean) => void) {
    document.addEventListener("visibilitychange", () => {
      callback(this.pageIsVisible);
    });
  }

  static onMemoryAboutToUnload(callback: () => void) {
    window.addEventListener("freeze", callback);
  }

  static preventWindowClose(message: string) {
    window.addEventListener("beforeunload", (e) => {
      e.preventDefault();
      return message;
    });
  }
}
```

## Scroll Manager

```ts
export class ScrollManager {
  public get totalWindowHeight(): number {
    const scrollHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight
    );
    return scrollHeight;
  }
  public get totalWindowWidth(): number {
    const scrollWidth = Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.body.clientWidth,
      document.documentElement.clientWidth
    );
    return scrollWidth;
  }
  public get windowHeight(): number {
    return document.documentElement.clientHeight;
  }
  public get scrollY(): number {
    return window.scrollY;
  }
  public get scrollX(): number {
    return window.scrollX;
  }
  public scrollToTop() {
    window.scrollTo(0, 0);
  }
  public scrollToBottom() {
    window.scrollTo(0, this.totalWindowHeight);
  }
  public scrollToElement(element: HTMLElement) {
    element.scrollIntoView({ behavior: "smooth" });
  }
  public scrollToPosition(position: number) {
    window.scrollTo(0, position);
  }
  public scrollDownBy(position: number) {
    window.scrollBy(0, position);
  }
}
```

## Navigator stuff

### Permissions

```ts
type ChromePermissionName =
  | PermissionName
  | "microphone"
  | "camera"
  | "local-fonts"
  | "clipboard-read"
  | "clipboard-write";
export class NavigatorPermissions {
  static async checkPermission(permissionName: ChromePermissionName) {
    const result = await navigator.permissions.query({
      name: permissionName as PermissionName,
    });
    return result.state;
  }
}
```

### Connectivity

```ts
export class NavigatorConnection {
  static get isOnline() {
    return navigator.onLine;
  }

  static get bandwidth() {
    return navigator.connection.downlink;
  }

  onNetworkChange(callback: (type: "4g" | "3g" | "2g" | "slow-2g") => void) {
    navigator.connection.addEventListener("change", () => {
      callback(navigator.connection.effectiveType);
    });
  }

  onConnectivityChange(callback: (isOnline: boolean) => void) {
    const offlineCb = () => callback(false);
    const onlineCb = () => callback(true);
    window.addEventListener("offline", offlineCb);
    window.addEventListener("online", onlineCb);
    return {
      unsubscribe() {
        window.removeEventListener("offline", offlineCb);
        window.removeEventListener("online", onlineCb);
      },
    };
  }
}
```

### User agent

```ts
export class NavigatorUserAgent {
  static get userAgentString() {
    return navigator.userAgent;
  }

  static get isOnMobile() {
    return navigator.userAgentData.mobile;
  }

  static get OS(): "windows" | "mac" | "linux" | "android" | "ios" | "other" {
    return navigator.userAgentData.platform;
  }
}
```

### Sharing

```ts
export class NavigatorShare {
  static async share(data: {
    title: string;
    text: string;
    url: string;
    files?: File[];
  }) {
    try {
      if (!this.canShare(data)) return false;
      await navigator.share(data);
      return true;
    } catch (error) {
      console.error("Error sharing", error);
      return false;
    }
  }

  static canShare(data: {
    title: string;
    text: string;
    url: string;
    files?: File[];
  }) {
    return navigator.canShare(data);
  }
}
```

## Create custom selector

```ts
function createSelector(containerElement: HTMLElement, className: string) {
  const element = (containerElement || document).querySelector(className);
  if (!element) throw new Error(`Element with class ${className} not found`);
  return ((_class: keyof HTMLElementTagNameMap) => {
    const query = element.querySelector(_class);
    if (!query)
      throw new Error(
        `Parent ${className}: Element with selector ${_class} not found`
      );
    return query;
  }) as InstanceType<typeof HTMLElement>["querySelector"];
}
```
