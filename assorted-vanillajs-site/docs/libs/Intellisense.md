

```ts
export class Intellisense {
  static html(strings: TemplateStringsArray, ...values: any[]) {
    let str = "";
    strings.forEach((string, i) => {
      str += string + (values[i] || "");
    });
    return str;
  }

  static css(strings: TemplateStringsArray, ...values: any[]) {
    let str = "";
    strings.forEach((string, i) => {
      str += string + (values[i] || "");
    });
    return str;
  }

  static sql(strings: TemplateStringsArray, ...values: any[]) {
    let str = "";
    strings.forEach((string, i) => {
      str += string + (values[i] || "");
    });
    return str;
  }
}
```