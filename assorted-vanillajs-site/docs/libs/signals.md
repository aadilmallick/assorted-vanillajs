# signals

Here are custom reactive signals that can be used in a vanilla JavaScript project.

```ts
const context = [] as Effect[];
type Effect = {
  execute: () => void;
};

export function createSignal<T>(value: T) {
  const subscriptions = new Set<Effect>();
  /**
   *
   * When we read a signal, we want to add an observer
   */
  const read = () => {
    const observer = context.at(-1);
    if (observer) subscriptions.add(observer);
    return value;
  };

  /**
   *m Everytime we write to the signal (change its value), we also want to notify any registered effects that use that value.
   Thus we'll call effect.execute().
   */
  const write = (newValue: T) => {
    value = newValue;
    for (const effect of [...subscriptions]) {
      effect.execute();
    }
  };

  return [read, write] as const;
}

export function createEffect(cb: () => void) {
  const effect: Effect = {
    execute() {
      context.push(effect);
      cb();
      context.pop();
    },
  };

  effect.execute();
}

export function createMemo<T>(cb: () => T) {
  const [signal, setSignal] = createSignal(cb());
  createEffect(() => {
    setSignal(cb());
  });
  return signal;
}
```