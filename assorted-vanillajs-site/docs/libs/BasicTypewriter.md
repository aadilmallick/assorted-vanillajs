# BasicTypewriter

```ts
export class BasicTypeWriter {
  private speed;
  private currentIndex: number = 1;
  private text: string = "";
  constructor(public element: HTMLElement, charsPerSecond: number = 20) {
    this.speed = 1000 / charsPerSecond;
    this.text = element.innerText;
  }

  write() {
    // get substring of text
    const curText = this.text.slice(0, this.currentIndex);

    // end recursive loop if we have reached the end of the text
    if (this.currentIndex > this.text.length) {
      return;
    }
    this.element.innerText = curText;

    // recursive setTimeout call
    setTimeout(() => {
      this.currentIndex++;
      this.write();
    }, this.speed);
  }

  // sets timeout delay for changing typewriter effect speed
  setSpeed(charsPerSecond: number) {
    this.speed = 1000 / charsPerSecond;
  }
}
```
