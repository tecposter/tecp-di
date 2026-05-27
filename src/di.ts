import type {Constructor, Provider, Token} from './common';
import {DiContainer} from './container';

const DI_CTN = new DiContainer();

export const regSingleton = <T>(item: Provider<T>) => DI_CTN.regSingleton(item);
export const regTransient = <T>(item: Provider<T>) => DI_CTN.regTransient(item);
export const di = <T>(token: Token<T>): T => DI_CTN.get(token);

export const singleton =
  <T extends Constructor>() =>
  (target: T): T => {
    regSingleton(target);
    return target;
  };

export const transient =
  <T extends Constructor>() =>
  (target: T): T => {
    regTransient(target);
    return target;
  };

export const clearRegistry = () => DI_CTN.clear();
