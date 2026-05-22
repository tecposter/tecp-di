const REGISTRY = new Map();
const SINGLETONS = new Map();
const isFullProvider = (p) => typeof p === 'object' &&
    p !== null &&
    'token' in p;
const regFull = (provider) => {
    REGISTRY.set(provider.token, provider);
    return provider.token;
};
export const toFullProvider = (item) => isFullProvider(item) ? item : { token: item, useClass: item };
export const regSingleton = (item) => regFull({ ...toFullProvider(item), isSingleton: true });
export const regTransient = (item) => regFull({ ...toFullProvider(item), isSingleton: false });
export const di = (token) => {
    const existing = SINGLETONS.get(token);
    if (existing) {
        return existing;
    }
    const provider = REGISTRY.get(token);
    if (!provider) {
        throw new Error(`${String(token)} not registered`);
    }
    let instance;
    if (provider.useValue !== undefined) {
        instance = provider.useValue;
    }
    else if (provider.useClass) {
        instance = new provider.useClass();
    }
    else if (provider.useFactory) {
        instance = provider.useFactory();
    }
    else {
        throw new Error(`Invalid provider for token: ${String(token)}`);
    }
    if (provider.isSingleton) {
        SINGLETONS.set(token, instance);
    }
    return instance;
};
export const singleton = () => (target) => {
    regSingleton(target);
    return target;
};
export const transient = () => (target) => {
    regTransient(target);
    return target;
};
export const clearRegistry = () => {
    REGISTRY.clear();
    SINGLETONS.clear();
};
