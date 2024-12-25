# CSSHilights

```ts
export class HighlightManager {
  static createHighlight(ranges: Range[], highlightName: string) {
    if (CSS.highlights.has(highlightName)) return;
    const highlight = new Highlight(...ranges);
    CSS.highlights.set(highlightName, highlight);
    return highlight;
  }

  static clearAllHighlights() {
    CSS.highlights.clear();
  }

  static deleteHighlight(highlightName: string) {
    return CSS.highlights.delete(highlightName);
  }
}
```
