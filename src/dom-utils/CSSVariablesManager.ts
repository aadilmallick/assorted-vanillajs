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
