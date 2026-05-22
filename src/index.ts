export type Constructor<T = unknown> = new (...args: unknown[]) => T;
export type Token<T = unknown> = symbol | Constructor<T>;

export interface FullProvider<T = unknown> {
  token: Token<T>;
  useClass?: Constructor<T>;
  useValue?: T;
  useFactory?: (...args: unknown[]) => T;
  isSingleton?: boolean;
}

export type Provider<T = unknown> = Constructor<T> | FullProvider<T>;

const REGISTRY: Map<Token<unknown>, FullProvider<unknown>> = new Map();
const SINGLETONS: Map<Token<unknown>, unknown> = new Map();

const isFullProvider = (p: unknown): p is FullProvider =>
  typeof p === 'object' &&
  p !== null &&
  'token' in (p as Record<string, unknown>);

const regFull = <T>(provider: FullProvider<T>): Token<T> => {
  REGISTRY.set(provider.token, provider);
  return provider.token;
};

export const toFullProvider = <T>(item: Provider<T>): FullProvider<T> =>
  isFullProvider(item) ? item : { token: item, useClass: item };

export const regSingleton = <T>(item: Provider<T>) =>
  regFull({ ...toFullProvider(item), isSingleton: true });

export const regTransient = <T>(item: Provider<T>) =>
  regFull({ ...toFullProvider(item), isSingleton: false });

export const di = <T>(token: Token<T>): T => {
  const existing = SINGLETONS.get(token as Token<unknown>);
  if (existing) {
    return existing as T;
  }
  const provider = REGISTRY.get(token);
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
    SINGLETONS.set(token, instance);
  }

  return instance as T;
};


export const singleton = <T extends Constructor>() =>
  (target: T): T => {
    regSingleton(target);
    return target;
  };

export const transient = <T extends Constructor>() =>
  (target: T): T => {
    regTransient(target);
    return target;
  };

export const clearRegistry = () => {
  REGISTRY.clear();
  SINGLETONS.clear();
};
