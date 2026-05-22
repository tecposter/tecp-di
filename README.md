# @tec/di

A lightweight, zero-dependency Dependency Injection container for TypeScript.

## Install

```bash
pnpm add @tec/di
```

## Usage

### Decorator registration

```ts
import { di, singleton, transient } from '@tec/di';

@singleton()
class DbService {
  query(sql: string) {
    return `result of ${sql}`;
  }
}

@transient()
class RequestContext {
  id = Math.random();
}

const a = di(DbService);
const b = di(DbService);
console.log(a === b); // true

const c = di(RequestContext);
const d = di(RequestContext);
console.log(c === d); // false
```

### Manual registration

```ts
import { di, regSingleton, regTransient } from '@tec/di';

class Logger {
  log(msg: string) {
    console.log(msg);
  }
}

regSingleton(Logger);
const l1 = di(Logger);
const l2 = di(Logger);
console.log(l1 === l2); // true
```

### Value and factory providers

```ts
import { di, regSingleton, regTransient } from '@tec/di';

const CONFIG = Symbol('config');

regSingleton({ token: CONFIG, useValue: { db: 'sqlite' } });
console.log(di(CONFIG)); // { db: 'sqlite' }

let n = 0;
const COUNTER = Symbol('counter');
regTransient({ token: COUNTER, useFactory: () => ++n });
console.log(di(COUNTER)); // 1
console.log(di(COUNTER)); // 2
```

### Testing

```ts
import { di, regSingleton, clearRegistry } from '@tec/di';

clearRegistry(); // reset all registrations
```

## API

| Function | Description |
|---|---|
| `regSingleton(provider)` | Register a singleton provider |
| `regTransient(provider)` | Register a transient provider |
| `di(token)` | Resolve a token to its instance |
| `singleton()` | Decorator — registers class as singleton |
| `transient()` | Decorator — registers class as transient |
| `clearRegistry()` | Reset all registrations |

A provider can be a class constructor or a `FullProvider` object with `token`, `useClass`, `useValue`, `useFactory`, and `isSingleton` fields.
