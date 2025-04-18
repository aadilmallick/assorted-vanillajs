export class DOM {
  static createDomElement(html: string) {
    const dom = new DOMParser().parseFromString(html, "text/html");
    return dom.body.firstElementChild as HTMLElement;
  }
  static $ = (selector: string): HTMLElement | null =>
    document.querySelector(selector);
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
