import { getRaw, getSymbol } from "../symbols";

export interface Ref<T> {
  get value(): T,
  set value(value: T),
  [getRaw]: T,
  readonly [getSymbol]: Symbol
}

export type Computed<T> = Ref<T>

export type Reactive<T extends Object> = T;

export type ReactiveData<T> = Ref<T> | Computed<T> | Reactive<any>;
