import { CustomEventManager } from "./eventUtils";

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

export class ObservableStore<T extends CallableFunction> {
  private observers: Set<T> = new Set();
  notify(...args: any[]) {
    this.observers.forEach((observer) => observer(...args));
  }
  notifyAndReturn(...args: any[]) {
    const returnValues = Array.from(this.observers).map((observer) =>
      observer(...args)
    );
    return returnValues;
  }
  addObserver(observer: T) {
    this.observers.add(observer);
  }
  removeObserver(observer: T) {
    this.observers.delete(observer);
  }
}

// export class Command<T> {
//   constructor(public name: string, public data: T) {}

//   equals(command: Command<T>) {
//     return this.name === command.name;
//   }

//   // put all commands for app here
//   static CommandsMap = {};
// }

// export class CommandExecutor<T> {
//   constructor(public command: Command<T>) {}
//   getExecutor() {
//     return ((
//       args: this["command"]["data"],
//       cb: (args: this["command"]["data"]) => void
//     ) => {
//       cb(args);
//     }).bind(null, this.command.data);
//   }
// }

export class Command<T> {
  constructor(
    public name: string,
    public data: T,
    public cb: (data: T) => void
  ) {}

  equals(command: Command<T>) {
    return this.name === command.name;
  }

  // put all commands for app here
  static CommandsMap = {};
}

export class CommandExecutor {
  static execute<T>(command: Command<T>) {
    command.cb(command.data);
  }
}
