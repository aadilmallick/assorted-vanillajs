# ContentScriptUI

For chrome extension content scripts, here is a UI component that you can customize without shadow DOM.

```ts
import { css, CSSVariablesManager, DOM, html } from "../Dom";
import WebComponent from "./WebComponent";

interface StaticProps {
  "data-iframe-url": string;
}

const observableAttributes = [] as readonly string[];
export class ContentScriptUI extends WebComponent {
  static tagName = "content-script-ui" as const;
  static cameraId = "ez-screen-recorder-camera" as const;
  static elementContainerName = "camera-iframe-container" as const;

  constructor() {
    super({
      templateId: ContentScriptUI.tagName,
    });
  }

  static override get CSSContent() {
    return css``;
  }

  static registerSelf() {
    WebComponent.register(this.tagName, this);
  }

  static override get HTMLContent() {
    return html``;
  }

  static manualCreation() {
    // 1) add css to head
    const styles = document.createElement("style");
    styles.textContent = this.CSSContent;
    styles.id = `${this.tagName}-camera-iframe-styles`;
    document.head.appendChild(styles);

    // 2) add element to body
  }

  static manualDestruction() {
    // 1) remove styles
    // 2) remove elements
  }

  override connectedCallback(): void {
    super.connectedCallback();
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [ContentScriptUI.tagName]: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & StaticProps,
        HTMLElement
      >;
    }
  }
}
```
