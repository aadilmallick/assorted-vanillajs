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
