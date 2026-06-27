import assert from 'node:assert';
import {beforeEach, describe, it} from 'node:test';
import {DiContainer} from './container';

let container: DiContainer;

beforeEach(() => {
  container = new DiContainer();
});

describe('DiContainer', () => {
  describe('reg()', () => {
    it('should register a useClass provider and return its token', () => {
      class MyService {}
      const token = container.reg({
        token: MyService,
        useClass: MyService,
        isSingleton: true,
      });
      assert.strictEqual(token, MyService);
      assert.strictEqual(container.has(MyService), true);
      const instance = container.get(MyService);
      assert.ok(instance instanceof MyService);
    });

    it('should register a useValue provider', () => {
      const TOKEN = Symbol('value');
      const token = container.reg({
        token: TOKEN,
        useValue: 42,
        isSingleton: true,
      });
      assert.strictEqual(token, TOKEN);
      assert.strictEqual(container.get(TOKEN), 42);
    });

    it('should register a useFactory provider', () => {
      const TOKEN = Symbol('factory');
      const token = container.reg({
        token: TOKEN,
        useFactory: () => 'from factory',
        isSingleton: true,
      });
      assert.strictEqual(token, TOKEN);
      assert.strictEqual(container.get(TOKEN), 'from factory');
    });
  });

  describe('regSingleton()', () => {
    it('should register as singleton and return same instance', () => {
      class MyService {
        id = Math.random();
      }
      container.regSingleton(MyService);

      const a = container.get(MyService);
      const b = container.get(MyService);
      assert.strictEqual(a, b);
      assert.strictEqual(a.id, b.id);
    });

    it('should work with FullProvider object using useClass', () => {
      class MyService {}
      const TOKEN = Symbol('singleton');
      container.regSingleton({token: TOKEN, useClass: MyService});

      const a = container.get(TOKEN);
      const b = container.get(TOKEN);
      assert.strictEqual(a, b);
      assert.ok(a instanceof MyService);
    });

    it('should work with FullProvider using useValue', () => {
      const TOKEN = Symbol('value');
      container.regSingleton({token: TOKEN, useValue: {x: 1}});

      assert.deepStrictEqual(container.get(TOKEN), {x: 1});
    });

    it('should work with FullProvider using useFactory', () => {
      let callCount = 0;
      const TOKEN = Symbol('factory');
      container.regSingleton({token: TOKEN, useFactory: () => ++callCount});

      assert.strictEqual(container.get(TOKEN), 1);
      assert.strictEqual(container.get(TOKEN), 1);
    });
  });

  describe('regTransient()', () => {
    it('should register as transient and return different instances', () => {
      class MyController {}
      container.regTransient(MyController);

      const a = container.get(MyController);
      const b = container.get(MyController);
      assert.notStrictEqual(a, b);
    });

    it('should have independent state between transient instances', () => {
      class Counter {
        count = 0;
        inc() {
          this.count++;
        }
      }
      container.regTransient(Counter);

      const c1 = container.get(Counter);
      const c2 = container.get(Counter);
      c1.inc();
      assert.strictEqual(c1.count, 1);
      assert.strictEqual(c2.count, 0);
    });

    it('should call useFactory each time for transient', () => {
      let callCount = 0;
      const TOKEN = Symbol('transient-factory');
      container.regTransient({token: TOKEN, useFactory: () => ++callCount});

      assert.strictEqual(container.has(TOKEN), true);

      assert.strictEqual(container.get(TOKEN), 1);
      assert.strictEqual(container.get(TOKEN), 2);
      assert.strictEqual(container.get(TOKEN), 3);
    });
  });

  describe('get()', () => {
    it('should throw when resolving an unregistered token', () => {
      class Unknown {}
      assert.throws(() => container.get(Unknown), /not registered/);
    });

    it('should throw for an unregistered symbol token', () => {
      const TOKEN = Symbol('unregistered');
      assert.throws(() => container.get(TOKEN), /not registered/);
    });

    it('should throw for invalid provider without useValue, useClass, or useFactory', () => {
      const TOKEN = Symbol('invalid');
      container.reg({token: TOKEN, isSingleton: true});
      assert.throws(() => container.get(TOKEN), /Invalid provider/);
    });
  });

  describe('mixed registrations', () => {
    it('should resolve multiple tokens independently', () => {
      class ServiceA {}
      class ServiceB {}

      container.regSingleton(ServiceA);
      container.regSingleton(ServiceB);
      assert.strictEqual(container.has(ServiceA), true);
      assert.strictEqual(container.has(ServiceB), true);

      const a = container.get(ServiceA);
      const b = container.get(ServiceB);
      assert.notStrictEqual(a, b);
      assert.ok(a instanceof ServiceA);
      assert.ok(b instanceof ServiceB);
    });

    it('should resolve singleton and transient differently', () => {
      class MyService {}
      const TOKEN_A = Symbol('singleton');
      const TOKEN_B = Symbol('transient');

      container.regSingleton({token: TOKEN_A, useClass: MyService});
      container.regTransient({token: TOKEN_B, useClass: MyService});

      const a1 = container.get(TOKEN_A);
      const a2 = container.get(TOKEN_A);
      const b1 = container.get(TOKEN_B);
      const b2 = container.get(TOKEN_B);

      assert.strictEqual(a1, a2);
      assert.notStrictEqual(b1, b2);
    });
  });

  describe('clear()', () => {
    it('should clear all registrations and cached singletons', () => {
      class MyService {}
      container.regSingleton(MyService);
      container.get(MyService);
      container.clear();

      assert.throws(() => container.get(MyService), /not registered/);
    });

    it('should allow re-registration after clear', () => {
      class MyService {}
      container.regSingleton(MyService);
      container.clear();
      container.regSingleton(MyService);

      const instance = container.get(MyService);
      assert.ok(instance instanceof MyService);
    });
  });
});
