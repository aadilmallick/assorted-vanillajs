import { CSSVariablesManager } from "../dom-utils/CSSVariablesManager";

interface Variables {
  size: `${number}rem`;
  color: string;
  time: `${number}s`;
  loaderBackground: string;
}

export default class PageLoader {
  id = `page-loader-${crypto.randomUUID()}`;
  loaderContainerSelector = `#${this.id}.loader-container`;
  HTMLcontent = `
    <div class="loader-container" id="${this.id}">
        <div class="loader"></div>
    </div>
  `;

  cssVariables: Variables = {
    size: "4rem" as `${number}rem`,
    color: "orange",
    time: "1.5s" as `${number}s`,
    loaderBackground: "#222",
  };

  private CSSLoaderContent = `
    ${this.loaderContainerSelector} {
        /* variables to configure */
        --size: 4rem;
        --color: orange;
        --time: 1.5s;
        --loader-background: #222;

        /* take up whole screen */
        position: fixed;
        inset: 0;
        background-color: var(--loader-background);
        display: grid;
        place-content: center;
        opacity: 1;
        transition: opacity 1s ease-in-out;
        z-index: 9000;

        /* fade out styles */
        &.hide-loader {
            opacity: 0;
            pointer-events: none;
        }
    }

    ${this.loaderContainerSelector} .loader {
        /* creates spinner */
        height: var(--size);
        width: var(--size);
        border-radius: 9999px;
        border: rgba(255, 255, 255, 0.3) solid 0.25rem;
        position: relative;
        z-index: 1;
        animation: loader var(--time) infinite linear;
        &::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 9999px;
            border-left: var(--color) solid 0.25rem;
            animation: loader var(--time) infinite linear;
            z-index: 2;
        }
    }

    @keyframes loader {
        0% {
            transform: rotate(0deg) scale(1);
        }
        50% {
            transform: rotate(180deg) scale(1.2);
        }
        to {
            transform: rotate(360deg) scale(1);
        }
    }
  `;

  private CSSBodyContent = `
    body:has(:not(${this.loaderContainerSelector}.hide-loader)) {
        overflow: hidden;
        height: 100vh;
    }

    body:has(${this.loaderContainerSelector}.hide-loader) {
        overflow: visible;
        height: fit-content;
    }
  `;

  private loaderElement: HTMLDivElement;

  constructor(options?: Partial<PageLoader["cssVariables"]>) {
    this.handleOptions(options);
    let loaderElement = document.querySelector<HTMLDivElement>(
      this.loaderContainerSelector
    );
    if (!loaderElement) {
      loaderElement = this.injectLoader();
    }
    this.loaderElement = loaderElement;
    const stylesManager = new CSSVariablesManager<Variables>(
      this.loaderElement
    );
    stylesManager.set("size", this.cssVariables.size);
    stylesManager.set("color", this.cssVariables.color);
    stylesManager.set("time", this.cssVariables.time);
    stylesManager.set("loaderBackground", this.cssVariables.loaderBackground);
  }

  private handleOptions(options?: Partial<PageLoader["cssVariables"]>) {
    if (options) {
      options.size && (this.cssVariables.size = options.size);
      options.color && (this.cssVariables.color = options.color);
      options.time && (this.cssVariables.time = options.time);
      options.loaderBackground &&
        (this.cssVariables.loaderBackground = options.loaderBackground);
    }
  }

  private injectLoader() {
    const style = document.createElement("style");
    style.innerHTML = `
      ${this.CSSLoaderContent}
      ${this.CSSBodyContent}
    `;
    document.head.appendChild(style);
    document.body.insertAdjacentHTML("afterbegin", this.HTMLcontent);
    return document.querySelector(
      this.loaderContainerSelector
    ) as HTMLDivElement;
  }

  private hideLoader() {
    setTimeout(() => {
      this.loaderElement.classList.add("hide-loader");
    }, 500);
    setTimeout(() => {
      this.loaderElement.remove();
    }, 1500);
  }

  loadPage() {
    if (document.readyState !== "loading") {
      this.hideLoader();
      return;
    }
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        this.hideLoader();
      },
      {
        once: true,
      }
    );
  }
}
