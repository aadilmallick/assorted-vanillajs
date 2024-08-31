# Assorted-vanillajs

- [Assorted-vanillajs](#assorted-vanillajs)
  - [main library](#main-library)
    - [DOM utilities](#dom-utilities)
      - [DOM manipulation](#dom-manipulation)
      - [Abort controller manager](#abort-controller-manager)
      - [Fullscreen Model](#fullscreen-model)
      - [LocalStorage](#localstorage)
    - [Event utilities](#event-utilities)
    - [Pattern utils](#pattern-utils)
      - [Subject and OBservers](#subject-and-observers)
  - [Color Logger](#color-logger)

This is a treeshakeable (kinda) library of reusable vanilla TypeScript components and utilities that you can use again and again in your apps.

The main library has several sublibraries, each with its own set of components and utilities. You can import the whole library or just the parts you need.

This is also intended to be a shadcn style type of library, where the source code is here in the README, and you can just copy it and modify it on your own.

```bash
npm i assorted-vanillajs
```

- `"assorted-vanillajs"` : includes everything in the [src/dom-utils/](src/dom-utils/) folder, which includes things like DOM manipulation, CSS Variables management, debouncing, throttling, proxies, design patterns, and custom events.
- `"assorted-vanillajs/color-logger"` : Utility classes for logging colors to the console
- `"assorted-vanillajs/card-gradient"` : Utility classes for applying a hover effect on some kind of card component. Not really that useful in my opinion.
- `"assorted-vanillajs/border-gradient"` : Utility classes for applying any type of border gradient animation to an element with JavaScript.
- `"assorted-vanillajs/text-animations"` : Utility classes for creating text animations on an element, like an auto-incrementing follower counter, or type-writer effects.
- `"assorted-vanillajs/web-components"` : Utility classes for creating web components including prebuilt ones like loading spinners. The abstract `WebComponent` class is also included so you can build your own webcomponents.
- `"assorted-vanillajs/animated-toast"` : Utility class for creating toast notifications
- `"assorted-vanillajs/page-loader"` : Utility class for providing a page loader to wait for the DOM to load.
- `"assorted-vanillajs/web-api-utils"` : An assortment of classes that provide wrappers for web API tasks, like resizing images with canvas, copying images and reading images from clipboard, and more.

## main library

### DOM utilities

#### DOM manipulation

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

#### Abort controller manager

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

#### Fullscreen Model

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

#### LocalStorage

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

### Event utilities

```ts
export class CustomEventManager<T = any> extends EventTarget {
  private listener?: EventListenerOrEventListenerObject;
  constructor(private name: string) {
    super();
  }

  onTriggered(callback: (event: Event & { detail: T }) => void) {
    this.listener = (e) => {
      callback(e as Event & { detail: T });
    };
    this.addEventListener(this.name, this.listener);
  }

  removeListener() {
    if (this.listener) this.removeEventListener(this.name, this.listener);
  }

  dispatch(data: T, eventInitDict?: CustomEventInit<T>) {
    this.dispatchEvent(
      new CustomEvent(this.name, { ...eventInitDict, detail: data })
    );
  }
}

export class CustomEventElementClass<T> {
  private listener?: EventListener;
  constructor(
    private event: CustomEvent<T>,
    private element: HTMLElement | Window = window
  ) {}

  listen(cb: (e: CustomEvent<T>) => void) {
    this.listener = cb as EventListener;
    this.element.addEventListener(this.event.type, cb as EventListener);
  }

  dispatch() {
    this.element.dispatchEvent(this.event);
  }

  removeListener() {
    if (this.listener) {
      this.element.removeEventListener(this.event.type, this.listener);
    }
  }
}
```

- `CustomEventElementClass` : A class for creating a special `EventTarget` scoped to a class, and not to any element. This makes it more of a pattern and less based on the DOM.
- `CustomEventElementManager` : A class for creating custom events on elements and dispatching them.

### Pattern utils

#### Subject and OBservers

This follows the Observer design pattern, and is more useful if you implement it on your own.

```ts
export class Subject<T> {
  private observers: Observable<T>[] = [];
  addObserver(observer: Observable<T>) {
    this.observers.push(observer);
  }
  removeObserver(observer: Observable<T>) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }
  notify(data: T) {
    this.observers.forEach((observer) => observer.update(data));
  }
}

interface Observable<T> {
  update(data: T): void;
}

export class ConcreteObserver<T> implements Observable<T> {
  update(data: T) {
    console.log(data);
  }
}
```

## Color Logger

```ts
const defaultConsoleStyles = {
  error: "color: red; font-weight: bold;",
  info: "color: blue; font-weight: bold;",
  success: "color: green; font-weight: bold;",
};

export const BasicColorLogger = createColorLogger(defaultConsoleStyles);

export function createColorLogger<T extends Record<string, string>>(
  consoleStyles: T
) {
  const temp: Partial<
    Record<keyof typeof consoleStyles, (message: any) => void>
  > = {};
  for (const [key, value] of Object.entries(consoleStyles)) {
    temp[key as keyof typeof consoleStyles] = (message: any) => {
      console.log(`%c${message}`, value);
    };
  }

  const ColorLogger = temp as Record<
    keyof typeof consoleStyles,
    (message: any) => void
  >;
  return ColorLogger;
}
```

Here is an example usage:

```ts
import {
  BasicColorLogger,
  createColorLogger,
} from "assorted-vanillajs/color-logger";

BasicColorLogger.error("This is an error message");

const customLogger = createColorLogger({
  warn: "color: orange; font-weight: bold; font-size: 2rem; text-transform: uppercase;",
  info: "color: blue; font-weight: bold;",
});

customLogger.warn("This is a warning");
customLogger.info("This is an info message");
```
