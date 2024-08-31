import { CSSVariablesManager } from "../dom-utils/CSSVariablesManager";
import { throttle } from "../dom-utils/timerUtils";

export default class CardGradientHoverCreator {
  private overlay: HTMLElement;
  private overlayVariablesManager: CSSVariablesManager<{
    opacity: number;
    x: `${number}px`;
    y: `${number}px`;
  }>;
  private listener?: (e: MouseEvent) => void;
  private readonly styleTagId = "card-gradient-hover-creator-style";

  private addCSS() {
    const css = `
    ${this.selector}.overlay-container {
          position: relative;
          max-width: 400px;
  
          .overlay {
                  position: absolute;
                  inset: 0;
              }
  
              .overlay > * {
              background: linear-gradient(
                  45deg,
                  hsl(0, 100%, 50%),
                  hsl(60, 100%, 50%),
                  hsl(120, 100%, 50%),
                  hsl(180, 100%, 50%),
                  hsl(240, 100%, 50%),
                  hsl(300, 100%, 50%),
                  hsl(360, 100%, 50%)
              );
          border-color: white;
          }
  
          .overlay {
          position: absolute;
          inset: 0;
  
          /* visual only, don't steal clicks or interactions */
          pointer-events: none;
          user-select: none;
  
          /* JavaScript will make this visible. This ensures progressive enhancement */
          opacity: var(--opacity, 0);
  
          -webkit-mask: radial-gradient(
              25rem 25rem at var(--x) var(--y),
              #000 1%,
              transparent 50%
          );
          mask: radial-gradient(
              25rem 25rem at var(--x) var(--y),
              #000 1%,
              transparent 50%
          );
  
          /* smooooooth */
          transition: 400ms mask ease;
          will-change: mask;
              }
      }
      `;

    if (document.getElementById(this.styleTagId)) {
      return;
    }
    const style = document.createElement("style");
    style.id = this.styleTagId;
    style.innerHTML = css;
    document.head.appendChild(style);
  }

  constructor(
    private element: HTMLElement,
    private selector: string,
    private fps: "60" | "30" | "15" = "30"
  ) {
    this.element.classList.add("overlay-container");
    const cloneText = this.element.innerHTML;
    this.addCSS();
    this.overlay = this.createDomElement(`
          <div class="overlay" aria-hidden="true">
          ${cloneText}
          </div>
          `);
    this.element.insertAdjacentElement("beforeend", this.overlay);
    this.overlayVariablesManager = new CSSVariablesManager(this.overlay);
    this.initListener();
  }

  initListener() {
    const throttledMouseMove = throttle(
      this.onOverlayHover.bind(this),
      1000 / +this.fps
    );
    if (this.listener) {
      this.removeListener();
    }
    document.addEventListener("mousemove", throttledMouseMove);
  }

  removeListener() {
    if (this.listener) {
      document.removeEventListener("mousemove", this.listener);
      this.listener = undefined;
    }
  }

  private onOverlayHover = (e: MouseEvent) => {
    const x = e.pageX - this.element.offsetLeft;
    const y = e.pageY - this.element.offsetTop;
    this.overlayVariablesManager.set("x", `${x}px`);
    this.overlayVariablesManager.set("y", `${y}px`);
    this.overlayVariablesManager.set("opacity", 1);
  };

  private createDomElement(html: string) {
    const dom = new DOMParser().parseFromString(html, "text/html");
    return dom.body.firstElementChild as HTMLElement;
  }
}
