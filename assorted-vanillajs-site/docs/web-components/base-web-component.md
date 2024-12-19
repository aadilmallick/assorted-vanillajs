# Base Web Component class

All web components should inherit from this class.

```ts
type Selector = {
  <K extends keyof HTMLElementTagNameMap>(selectors: K):
    | HTMLElementTagNameMap[K]
    | null;
  <K extends keyof SVGElementTagNameMap>(selectors: K):
    | SVGElementTagNameMap[K]
    | null;
  <K extends keyof MathMLElementTagNameMap>(selectors: K):
    | MathMLElementTagNameMap[K]
    | null;
  <K extends keyof HTMLElementDeprecatedTagNameMap>(selectors: K):
    | HTMLElementDeprecatedTagNameMap[K]
    | null;
  <E extends Element = Element>(selectors: string): E | null;
};

/**
 * Tips for using this class:
 *
 * 1. Always call connectedCallback() and always do super.connectedCallback() in the child class.
 * Always do DOM stuff in connectedCallback() and not in the constructor.
 */

export default abstract class WebComponent<
  T extends readonly string[] = readonly string[]
> extends HTMLElement {
  protected shadow: ShadowRoot;
  protected styles: HTMLStyleElement;
  protected template: HTMLTemplateElement;
  public $: Selector;

  static register(name: string, _class: CustomElementConstructor): void {
    if (!customElements.get(name)) {
      customElements.define(name, _class);
    }
  }

  /**
   * Might be blocked depending on CSP
   * @param str the string to interpolate
   * @param params  the object with the values to interpolate
   * @returns
   */
  static interpolate<V extends Record<string, any>>(str: string, params: V) {
    const names = Object.keys(params);
    const values = Object.values(params);
    return new Function(...names, `return \`${str}\`;`)(...values) as string;
  }

  static createTemplate(templateId: string, HTMLContent: string) {
    const template = document.createElement("template");
    template.id = templateId;
    template.innerHTML = HTMLContent;
    return template;
  }

  async loadExternalCSS(filepath: string) {
    const request = await fetch(filepath);
    const css = await request.text();
    this.styles.textContent = css;
  }

  private templateId: string;
  constructor(options: {
    templateId: string; // template id
    HTMLContent?: string; // html content of template
    cssFileName?: string; // filename of css to apply on template, if provided
    cssContent?: string; // css content to apply on template, if provided
  }) {
    // 1. always call super()
    super();
    this.templateId = options.templateId;
    // 2. create shadow DOM and create template
    this.shadow = this.attachShadow({ mode: "open" });
    this.$ = this.shadow.querySelector.bind(this.shadow);

    this.styles = document.createElement("style");
    this.template = WebComponent.createTemplate(
      options.templateId,
      options.HTMLContent ??
        (this.constructor as typeof WebComponent).HTMLContent
    );

    // 3. attach styles
    if (options.cssContent) this.styles.textContent = options.cssContent;
    else if (options.cssFileName) this.loadExternalCSS(options.cssFileName);
    else
      this.styles.textContent = (
        this.constructor as typeof WebComponent
      ).CSSContent;
  }

  static get HTMLContent() {
    return "";
  }

  static get CSSContent() {
    return "";
  }

  // called when element is inserted to the DOM
  connectedCallback() {
    this.createComponent();
    console.log(`${this.templateId}: connectedCallback finished executing`);
  }

  private createComponent() {
    const content = this.template.content.cloneNode(true);
    this.shadow.appendChild(this.styles);
    this.shadow.appendChild(content);
    // create utility selector
  }

  // triggered when element is removed from document
  disconnectedCallback() {
    console.log("disconnected");
  }

  // triggered when element is moved to new document (only with iframes)
  adoptedCallback() {
    console.log("adopted");
  }

  // region ATTRIBUTES

  // override this getter to specify which attributes to observe
  static get observedAttributes() {
    return [] as readonly string[];
  }

  // gets an attribute from the observedAttributes
  getObservableAttr(attrName: T[number]) {
    const attr = this.attributes.getNamedItem(attrName);
    return attr?.value;
  }

  // sets an attribute from the observedAttributes
  setObservableAttr(attrName: T[number], value: string) {
    this.setAttribute(attrName, value);
  }

  // removes an attribute from the observedAttributes
  removeObservableAttr(attrName: T[number]) {
    this.removeAttribute(attrName);
  }

  // listens to changes of attributes from the observedAttributes
  attributeChangedCallback(
    attrName: T[number],
    oldVal: string,
    newVal: string
  ) {
    console.log("attributeChangedCallback run", attrName, oldVal, newVal);
  }
}
```

This is an example of how you can inherit from this class:

```ts
import { css, CSSVariablesManager, DOM, html } from "../Dom";
import WebComponent from "./WebComponent";

interface Props {
  "data-size"?: `${number}rem`;
  "data-color"?: string;
  "data-time"?: `${number}s`;
  "data-loader-background"?: string;
}

const defaults: Props = {
  "data-size": "4rem",
  "data-color": "orange",
  "data-time": "1.5s",
  "data-loader-background": "#222",
};
type PropsArray = (keyof Props)[];
const observableAttributes = Object.keys(defaults) as PropsArray;
const tagName = "page-loader";

export class PageLoaderElement extends WebComponent<PropsArray> {
  /**
   * Scoped shadow-DOM CSS styling for element
   */
  static override get CSSContent() {
    return css``;
  }

  /**
   * HTML content for element
   */
  static override get HTMLContent() {
    return html``;
  }

  /**
   * Register element to custom elements
   */
  static registerSelf() {
    WebComponent.register(tagName, PageLoaderElement);
  }

  constructor() {
    super({
      templateId: tagName,
    });
  }

  /**
   * Deal with DOM insertions and querying here
   * when element first gets added to DOM
   */
  override connectedCallback(): void {
    super.connectedCallback();
  }

  /**
   * Essential getter to listen to changes on
   * the special observed attributes.
   */
  static override get observedAttributes() {
    return observableAttributes;
  }

  /**
   *
   * Deal with any observable attribute changes here
   */
  override attributeChangedCallback(
    attrName: keyof Props,
    oldVal: string,
    newVal: string
  ): void {}
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [tagName]: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & Props,
        HTMLElement
      >;
    }
  }
}
```

Setting the HTML content and CSS Styling should be pretty straight forward, but let's talk about the overrides:

- `connectedCallback()`: This is where you should do all your DOM manipulation. This is the first method that gets called when the element is added to the DOM.
- `observedAttributes`: This is a getter that returns an array of strings. These strings are the names of the attributes that you want to observe. When these attributes change, the `attributeChangedCallback` method gets called.
- `attributeChangedCallback()`: This is where you should handle the changes of the observed attributes. The method receives the attribute name, the old value and the new value.
- `registerSelf()`: This is a static method that registers the element to the custom elements registry. You should call this method in your main script file.

Your constructor should just be a place to set up class variables, not do anything DOM related. Always call `super()` in the constructor.

Let's talk about some useful methods and properties you inherit from the base web component class:

- `this.$`: This is a utility selector that you can use to query the shadow DOM. It's a function that you can call with a CSS selector string and it will return the element that matches the selector.
- `this.getObservableAttr(attrName)`: This is a method that you can use to get the value of an observed attribute.
- `this.setObservableAttr(attrName, value)`: This is a method that you can use to set the value of an observed attribute.
- `this.removeObservableAttr(attrName)`: This is a method that you can use to remove an observed attribute.
