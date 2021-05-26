import type { Context, Filter, Middleware } from 'grammy';

type TextMiddleware<C extends Context> = Middleware<Filter<C, ':text'>>;

export type { TextMiddleware };
