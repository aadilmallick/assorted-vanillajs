# console logging

These are utilities that make the debugging and console logging easier.

## PrintAdvanced

This class provides advanced console logging capabilities (terminal only) with color formatting and optional bold/italic styles.

```ts
interface PrintAdvancedColors {
  colors: {
    RED: string;
    GREEN: string;
    YELLOW: string;
    BLUE: string;
    MAGENTA: string;
    CYAN: string;
  };
  // object of functions that are lowercase of the colors
  print: {
    [k in Lowercase<keyof PrintAdvancedColors["colors"]>]: (
      ...args: any[]
    ) => void;
  };
}

export class PrintAdvanced implements PrintAdvancedColors {
  public readonly colors = {
    RED: "\x1b[31m",
    GREEN: "\x1b[32m",
    YELLOW: "\x1b[33m",
    BLUE: "\x1b[34m",
    MAGENTA: "\x1b[35m",
    CYAN: "\x1b[36m",
  };
  private BOLD = "";
  private ITALIC = "";
  private RESET = "\x1b[0m";
  public readonly print = {} as PrintAdvancedColors["print"];
  constructor({
    shouldBold = false,
    shouldItalic = false,
  }: {
    shouldBold?: boolean;
    shouldItalic?: boolean;
  } = {}) {
    if (shouldBold) {
      this.BOLD = "\x1b[1m";
    }
    if (shouldItalic) {
      this.ITALIC = "\x1b[3m";
    }

    for (let color in this.colors) {
      // autogenerate functions on the fly
      this.print[color.toLowerCase() as keyof PrintAdvancedColors["print"]] = (
        ...args: any[]
      ) => {
        console.log(
          `${this.BOLD}${this.ITALIC}${
            this.colors[color as keyof PrintAdvanced["colors"]]
          }${args.join(" ")}${this.RESET}`
        );
      };
    }
  }
}
```
