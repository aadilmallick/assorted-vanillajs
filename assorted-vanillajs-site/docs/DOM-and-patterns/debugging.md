# Debugging

## Color Logger

We use this code to print colors to the console in a browser context. This is useful for debugging and logging messages in a more readable way.

```ts
const defaultConsoleStyles = {
  error: "color: red; font-weight: bold;",
  info: "color: blue; font-weight: bold;",
  success: "color: green; font-weight: bold;",
};

export const BasicColorLogger = createColorLogger(defaultConsoleStyles);

export function createColorLogger<T extends Record<string, string>>(
  consoleStyles: T
) {
  const temp: Partial<
    Record<keyof typeof consoleStyles, (message: any) => void>
  > = {};
  for (const [key, value] of Object.entries(consoleStyles)) {
    temp[key as keyof typeof consoleStyles] = (message: any) => {
      console.log(`%c${message}`, value);
    };
  }

  const ColorLogger = temp as Record<
    keyof typeof consoleStyles,
    (message: any) => void
  >;
  return ColorLogger;
}
```

Here is an example usage:

```ts
import {
  BasicColorLogger,
  createColorLogger,
} from "assorted-vanillajs/color-logger";

BasicColorLogger.error("This is an error message");

const customLogger = createColorLogger({
  warn: "color: orange; font-weight: bold; font-size: 2rem; text-transform: uppercase;",
  info: "color: blue; font-weight: bold;",
});

customLogger.warn("This is a warning");
customLogger.info("This is an info message");
```
