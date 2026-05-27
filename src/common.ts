export type Constructor<T = unknown> = new (...args: any[]) => T;
export type Token<T = unknown> = symbol | Constructor<T>;

export interface FullProvider<T = unknown> {
  token: Token<T>;
  useClass?: Constructor<T>;
  useValue?: T;
  useFactory?: (...args: unknown[]) => T;
  isSingleton?: boolean;
}

export type Provider<T = unknown> = Constructor<T> | FullProvider<T>;

export const isFullProvider = (p: unknown): p is FullProvider =>
  typeof p === 'object' &&
  p !== null &&
  'token' in (p as Record<string, unknown>);

export const toFullProvider = <T>(item: Provider<T>): FullProvider<T> =>
  isFullProvider(item) ? item : {token: item, useClass: item};
