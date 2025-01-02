import { getRaw, getSymbol } from "../symbols";

interface ReactiveBase<T> {
  [getRaw]: T,
  [getSymbol]: Symbol
}

export type Ref<T> = {
  get value(): T,
  set value(value: T)
} & ReactiveBase<T>

export type Computed<T> = Ref<T>

export type Reactive<T> = T extends Object ? (T & ReactiveBase<T>) : never;

export type ReactiveData<T> = Ref<T> | Computed<T> | Reactive<T>;
