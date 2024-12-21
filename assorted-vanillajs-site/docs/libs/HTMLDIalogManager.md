# DialogManager

```ts
class DialogManager {
  constructor(private dialog: HTMLDialogElement) {}

  onClose(cb: (returnValue?: string) => void) {
    this.dialog.addEventListener("close", (e) => {
      const d = e.target as HTMLDialogElement;
      e.target && cb(d.returnValue);
    });
  }

  public get isOpen() {
    return this.dialog.open;
  }

  open() {
    this.dialog.showModal();
  }

  close() {
    this.dialog.close();
  }
}
```
