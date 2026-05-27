# @tecp/di

A lightweight, zero-dependency Dependency Injection container for TypeScript.

## Install

```bash
pnpm add @tecp/di
```

## Usage

### Decorator registration

```ts
import { di, singleton, transient } from '@tecp/di';

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
import { di, regSingleton, regTransient } from '@tecp/di';

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
import { di, regSingleton, regTransient } from '@tecp/di';

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
import { di, regSingleton, clearRegistry } from '@tecp/di';

clearRegistry(); // reset all registrations
```

## DiContainer

The top-level functions (`di`, `regSingleton`, etc.) operate on a global singleton instance of `DiContainer`. For isolated scopes (e.g. testing, multi-tenant), create your own instance:

```ts
import { DiContainer } from '@tecp/di/container';

const container = new DiContainer();

container.regSingleton(Logger);
const logger = container.get(Logger);
```

```ts
import { DiContainer } from '@tecp/di/container';

const container = new DiContainer();

container.regSingleton({ token: CONFIG, useValue: { db: 'sqlite' } });
container.regTransient(MyController);

const cfg = container.get(CONFIG);
const ctrl = container.get(MyController);
```

### Instance methods

| Method | Description |
|---|---|
| `reg(provider)` | Register a `FullProvider`; returns the token |
| `regSingleton(provider)` | Register a singleton provider |
| `regTransient(provider)` | Register a transient provider |
| `get(token)` | Resolve a token to its instance |
| `clear()` | Reset all registrations and cached singletons |

## API

| Function | Description |
|---|---|
| `regSingleton(provider)` | Register a singleton provider on the global container |
| `regTransient(provider)` | Register a transient provider on the global container |
| `di(token)` | Resolve a token to its instance from the global container |
| `singleton()` | Decorator — registers class as singleton on the global container |
| `transient()` | Decorator — registers class as transient on the global container |
| `clearRegistry()` | Reset all registrations on the global container |

A provider can be a class constructor or a `FullProvider` object with `token`, `useClass`, `useValue`, `useFactory`, and `isSingleton` fields.
