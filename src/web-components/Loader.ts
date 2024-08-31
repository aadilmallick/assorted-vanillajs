import { CSSVariablesManager, DOM } from "../main";
import WebComponent from "./WebComponent";

export class LoadingSpinner extends WebComponent {
  static CSS = `
          @keyframes spin {
              to {
                  transform: rotate(360deg);
              }
          }
  
        .loader {
              --size: 2rem;
              --color: gray;
              animation: spin 0.75s infinite steps(var(--count));
  
              height: var(--size);
              position: relative;
              width: var(--size);
  
              span {
                  background: var(--color);
                  height: 25%;
                  left: 50%;
                  position: absolute;
                  top: 50%;
                  transform: translate(-50%, -50%)
                              rotate(calc(((360 / var(--count)) * var(--index)) * 1deg))
                              translate(0, -125%);
                  width: 10%;
  
                  opacity: calc(var(--index) / var(--count));
              }
         }
      `;
  private numBars: number;
  private rootElement: HTMLElement;

  static registerSelf() {
    WebComponent.register("loading-spinner", LoadingSpinner);
  }

  constructor() {
    super({
      templateId: "loading-spinner",
      HTMLContent: `<div class="loader"></div>`,
      cssContent: LoadingSpinner.CSS,
    });
    this.rootElement = this.$(".loader")!;
    const loaderVariablesManager = new CSSVariablesManager<{
      count: number;
      size: `${number}rem`;
      color: string;
    }>(this.rootElement);

    const numBars = Number(this.getAttribute("data-num-bars") || 10);
    this.numBars = numBars;

    const loaderColor = this.getAttribute("data-color");
    const loaderSize = this.getAttribute("data-size");
    loaderVariablesManager.set("count", numBars);
    loaderColor && loaderVariablesManager.set("color", loaderColor);
    loaderSize &&
      loaderVariablesManager.set(
        "size",
        loaderSize.endsWith("rem") ? (loaderSize as `${number}rem`) : `2rem`
      );
    this.constructSpinner();
  }

  private constructSpinner() {
    const spans = [] as string[];
    for (let i = 0; i < this.numBars; i++) {
      spans.push(`<span style="--index: ${i}"></span>\n`);
    }
    DOM.addElementsToContainer(
      this.$(".loader")!,
      spans.map((span) => DOM.createDomElement(span))
    );
  }
}
