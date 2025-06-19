# Design Patterns

## Subject and Observers

This follows the Observer design pattern, and is more useful if you implement it on your own.

```ts
export class Subject<T> {
  private observers: Observable<T>[] = [];
  addObserver(observer: Observable<T>) {
    this.observers.push(observer);
  }
  removeObserver(observer: Observable<T>) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }
  notify(data: T) {
    this.observers.forEach((observer) => observer.update(data));
  }
}

interface Observable<T> {
  update(data: T): void;
}

export class ConcreteObserver<T> implements Observable<T> {
  update(data: T) {
    console.log(data);
  }
}
```

### Async reactive store

```ts
class AsyncReactiveStore<T extends Record<string, any>> {
  public data: T;
  private subscribers: Function[];
  constructor(initialData: T) {
    this.data = initialData;
    this.subscribers = [];
  }

  // Subscribe to changes in the data
  subscribe(callback: (key: keyof T, value: T[keyof T]) => Promise<void>) {
    if (typeof callback !== "function") {
      throw new Error("Callback must be a function");
    }
    this.subscribers.push(callback);
  }

  // Update the data and wait for all updates to complete
  async set(key: keyof T, value: T[keyof T]) {
    this.data[key] = value;

    // Call the subscribed function and wait for it to resolve
    const updates = this.subscribers.map(async (callback) => {
      await callback(key, value);
    });

    await Promise.allSettled(updates);
  }
}
```

## Proxies

```ts
import { CustomEventManager } from "./events";
export function createReactiveProxy<T extends string, V>(
  key: T,
  value: V,
  onSet: (newValue: V) => void
) {
  const proxy = new Proxy({ [key]: value } as Record<T, V>, {
    set(target, p, newValue, receiver) {
      onSet(newValue);
      return Reflect.set(target, p, newValue, receiver);
    },
  });
  return proxy;
}

export function createReactiveProxyMultipleProps<T extends Record<string, any>>(
  state: T,
  onSet: (state: T, propertyChanged: keyof T, newValue: T[keyof T]) => void
) {
  const proxy = new Proxy(state, {
    set(target, p, newValue, receiver) {
      onSet(target, p as keyof T, newValue as T[keyof T]);
      return Reflect.set(target, p, newValue, receiver);
    },
  });
  return proxy;
}

export function createReactiveProxyWithEvent<T extends string, V>(
  key: T,
  value: V,
  eventName: string
) {
  const proxyEvent = new CustomEventManager<Record<T, V>>(eventName);
  const proxy = new Proxy({ [key]: value } as Record<T, V>, {
    set(target, p, newValue, receiver) {
      proxyEvent.dispatch(target);
      return Reflect.set(target, p, newValue, receiver);
    },
  });
  return { proxy, proxyEvent };
}

export function createReactiveFunction<T extends CallableFunction>(
  func: T,
  onCall: (argsList: any[]) => void
) {
  const proxy = new Proxy(func, {
    apply(targetFunc, thisArg, argArray) {
      onCall(argArray);
      return Reflect.apply(targetFunc, thisArg, argArray);
    },
  });
  return proxy;
}
```

Here is an example usage:

```ts
import { createReactiveProxy } from "assorted-vanillajs/proxies";

const reactiveProxy = createReactiveProxy("name", "John Doe", (newValue) => {
  console.log(`Name changed to ${newValue}`);
});

reactiveProxy.name = "Jane Doe";
```

## Debounce and throttle

```ts
export function debounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
) {
  let timeoutId: ReturnType<Window["setTimeout"]>;
  return ((...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, delay);
  }) as T;
}

export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  wait: number = 300
) {
  let inThrottle: boolean,
    lastFn: ReturnType<typeof setTimeout>,
    lastTime: number;
  return function (this: any, ...args: any[]) {
    const context = this;
    if (!inThrottle) {
      fn.apply(context, args);
      lastTime = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFn);
      lastFn = setTimeout(() => {
        if (Date.now() - lastTime >= wait) {
          fn.apply(context, args);
          lastTime = Date.now();
        }
      }, Math.max(wait - (Date.now() - lastTime), 0));
    }
  } as T;
}
```

Here is when to use debounce vs throttle:

- Use debounce when you want to wait for a pause in the input before calling the function.
- Use throttle when you want to limit the number of times a function is called in a given time period.

## Messaging pattern

Use this pattern to create basic messaging pattern that is compatible with workers, service workers, and is based on the reducer pattern:

```ts
export class MessageSystem<T extends Record<string, any>> {
  getDispatchMessage<K extends keyof T>(key: K, payload: T[K]) {
    return {
      type: key,
      payload,
    };
  }

  messageIsOfType<K extends keyof T>(key: K, message: any): message is T[K] {
    if (!message || !message.type) {
      return false;
    }
    return message.type === key;
  }
}

const appMessageSystem = new MessageSystem<{
  ping: {
    ping: string;
  };
}>();
```