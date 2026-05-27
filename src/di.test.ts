import assert from 'node:assert';
import {beforeEach, describe, it} from 'node:test';

// Import from your DI module – adjust the path as needed
import {
  clearRegistry,
  di,
  regSingleton,
  regTransient,
  singleton,
  transient,
} from './di';

// Reset the registry before each test to avoid cross-test pollution
beforeEach(() => {
  clearRegistry();
});

describe('@singleton() decorator', () => {
  it('should register the class as a singleton and return the same instance', () => {
    @singleton()
    class MyService {
      id = Math.random();
    }

    const a = di(MyService);
    const b = di(MyService);
    assert.strictEqual(a, b);
    assert.strictEqual(a.id, b.id);
  });

  it('should set args via di', () => {
    @singleton()
    class ServiceA {
      x = 1;
    }

    @singleton()
    class ServiceB {
      y = 2;
    }

    @singleton()
    class ServiceC {
      z: number;

      constructor(a = di(ServiceA), b = di(ServiceB)) {
        this.z = a.x + b.y;
      }
    }

    const c = di(ServiceC);
    assert.strictEqual(c.z, 3);
  });

  it('should return different instances for different singleton classes', () => {
    @singleton()
    class ServiceA {}

    @singleton()
    class ServiceB {}

    const a = di(ServiceA);
    const b = di(ServiceB);
    assert.notStrictEqual(a, b);
  });
});

describe('@transient() decorator', () => {
  it('should register the class as transient and return different instances', () => {
    @transient()
    class MyController {}

    const a = di(MyController);
    const b = di(MyController);
    assert.notStrictEqual(a, b);
  });

  it('should have independent state between transient instances', () => {
    @transient()
    class Counter {
      count = 0;
      inc() {
        this.count++;
      }
    }

    const c1 = di(Counter);
    const c2 = di(Counter);
    c1.inc();
    assert.strictEqual(c1.count, 1);
    assert.strictEqual(c2.count, 0);
  });
});

describe('di() error handling', () => {
  it('should throw when resolving an unregistered token', () => {
    class Unknown {}
    assert.throws(() => di(Unknown), /not registered/);
  });
});

describe('mixed usage with manual registration', () => {
  it('should resolve a class registered via decorator', () => {
    @singleton()
    class DbConnection {
      connect() {
        return 'connected';
      }
    }

    const conn = di(DbConnection);
    assert.strictEqual(conn.connect(), 'connected');
  });

  it('should work identically when using manual regSingleton', () => {
    class ManualService {
      name = 'manual';
    }
    regSingleton(ManualService);

    const a = di(ManualService);
    const b = di(ManualService);
    assert.strictEqual(a, b);
    assert.strictEqual(a.name, 'manual');
  });
});

describe('other provider types (non-decorator)', () => {
  it('should handle useValue as singleton', () => {
    const TOKEN = Symbol('value');
    regSingleton({token: TOKEN, useValue: 42});
    assert.strictEqual(di(TOKEN), 42);
  });

  it('should call useFactory each time for transient', () => {
    let callCount = 0;
    const TOKEN = Symbol('factory');
    regTransient({
      token: TOKEN,
      useFactory: () => ++callCount,
    });
    assert.strictEqual(di(TOKEN), 1);
    assert.strictEqual(di(TOKEN), 2); // transient, factory called each time
  });
});
