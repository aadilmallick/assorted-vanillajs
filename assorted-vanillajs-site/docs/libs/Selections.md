# Selections

```ts
export class SelectionManager {
  static getSelection() {
    const selection = document.getSelection();
    if (!selection) return "";
    return selection.toString();
  }

  static onSelect(
    callback: (selection: string, selectObject: Selection) => void
  ) {
    document.addEventListener("mouseup", () => {
      const selection = document.getSelection();
      if (!selection) return;
      callback(selection?.toString() || "", selection);
    });
  }

  static clearSelection() {
    document.getSelection()?.removeAllRanges();
  }

  static selectRange(range: Range) {
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);
    return range.toString();
  }

  static createBasicRange(element: HTMLElement, start: number, end: number) {
    const range = new Range();
    range.setStart(element, start);
    range.setEnd(element, end);
    return range;
  }
}

export class RangeModel {
  range = new Range();

  selectElement(element: HTMLElement) {
    this.range.selectNodeContents(element);
  }

  setStart(node: Node, offset: number) {
    this.range.setStart(node, offset);
  }

  setEnd(node: Node, offset: number) {
    this.range.setEnd(node, offset);
  }

  getText() {
    return this.range.toString();
  }

  getContents() {
    return this.range.cloneContents();
  }

  deleteContents() {
    this.range.deleteContents();
  }
}
```
