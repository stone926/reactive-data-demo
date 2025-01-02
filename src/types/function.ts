import type { Computed, Ref, ReactiveData, Reactive } from "./data";

export type RefFunction = <T>(value: T) => Ref<T>;
export type ComputedFunction = <T>(compute: () => T) => Computed<T>;
export type WatchEffectFunction = (effect: WatchEffectCallback, options?: WatchEffectOptions) => void;
export type WatchFunction = <T>(watched: WatchSource<T>, effect: WatchCallback, options?: WatchOptions) => void;
export type WatchAllFunction = (effect: WatchAllCallback, options?: WatchAllOptions) => void;
export type ReactiveFunction = <T extends Object>(obj: T) => Reactive<T>

export type Effect = () => void
export type WatchEffectCallback = Effect
export type WatchCallback = <T>(newValue: T, oldValue: T, prop: Symbol | string | undefined) => boolean | void
export type WatchAllCallback = <T>(changed: ReactiveData<T>, newValue: T, oldValue: T, prop: Symbol | string | undefined) => boolean | void
export type WatchSource<T> = ReactiveData<T>

export interface WatchEffectOptions {

}
export interface WatchOptions {
  instant?: boolean
}
export interface WatchAllOptions {
  instant?: boolean
}  