import {
  type FullProvider,
  type Provider,
  type Token,
  toFullProvider,
} from './common';

export class DiContainer {
  private registry: Map<Token<unknown>, FullProvider<unknown>> = new Map();
  private singletons: Map<Token<unknown>, unknown> = new Map();

  reg<T>(provider: FullProvider<T>): Token<T> {
    this.registry.set(provider.token, provider);
    return provider.token;
  }

  regSingleton<T>(item: Provider<T>) {
    return this.reg({...toFullProvider(item), isSingleton: true});
  }

  regTransient<T>(item: Provider<T>) {
    return this.reg({...toFullProvider(item), isSingleton: false});
  }

  has<T = unknown>(token: Token<T>): boolean {
    return this.registry.has(token);
  }

  get<T>(token: Token<T>): T {
    const existing = this.singletons.get(token as Token<unknown>);
    if (existing) {
      return existing as T;
    }
    const provider = this.registry.get(token);
    if (!provider) {
      throw new Error(`${String(token)} not registered`);
    }

    let instance: unknown;
    if (provider.useValue !== undefined) {
      instance = provider.useValue;
    } else if (provider.useClass) {
      instance = new provider.useClass();
    } else if (provider.useFactory) {
      instance = provider.useFactory();
    } else {
      throw new Error(`Invalid provider for token: ${String(token)}`);
    }

    if (provider.isSingleton) {
      this.singletons.set(token, instance);
    }

    return instance as T;
  }

  clear() {
    this.registry.clear();
    this.singletons.clear();
  }
}
