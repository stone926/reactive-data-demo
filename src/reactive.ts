import type { Computed, Reactive, ReactiveData, Ref } from "./types/data"
import type { ComputedFunction, Effect, ReactiveFunction, RefFunction, WatchAllCallback, WatchAllFunction, WatchCallback, WatchEffectCallback, WatchEffectFunction, WatchFunction } from "./types/function"
import { refSymbol, computedSymbol, reactiveSymbol, getRaw, getSymbol } from "./symbols"

type ObjKey = string | Symbol

const subscribers = new WeakMap<Symbol, Map<ObjKey, Set<Effect>>>()
const watchAllSubscribers = new Set<WatchAllCallback>()
const specificSubscribersPre = new Map<Symbol, WatchCallback[]>()

let activeEffect: Effect | null = null;

const getSubscribers = (symbol: Symbol, key: ObjKey) => {
  if (!subscribers.has(symbol)) { // if ref is not in subscribers
    subscribers.set(symbol, new Map())
  }
  const map = subscribers.get(symbol) as Map<ObjKey, Set<Effect>>
  if (!map.has(key)) { // if ref is in subscribers but its key is not
    map.set(key, new Set())
  }
  return map.get(key) as Set<Effect>
}

const track = (symbol: Symbol, key: ObjKey) => {
  if (activeEffect === null) return
  getSubscribers(symbol, key).add(activeEffect)
}

const trigger = (symbol: Symbol, key: ObjKey) => {
  getSubscribers(symbol, key).forEach(effect => effect())
}

const specificTrigger = <T>(newValue: T, oldValue: T, symbol: Symbol, prop: ObjKey | undefined = undefined) => {
  if (!specificSubscribersPre.has(symbol)) return true
  let shouldUpdate = true;
  (specificSubscribersPre.get(symbol) as WatchCallback[]).forEach(effect => {
    shouldUpdate = (effect(newValue, oldValue, prop) ?? true) && shouldUpdate
  })
  return shouldUpdate
}

const allTrigger = <T>(changed: ReactiveData<T>, newValue: T, oldValue: T, prop: ObjKey | undefined = undefined) => {
  let shouldUpdate = true;
  watchAllSubscribers.forEach(effect => {
    shouldUpdate = (effect(changed, newValue, oldValue, prop) ?? true) && shouldUpdate
  })
  return shouldUpdate
}

const ref: RefFunction = (value) => {
  return {
    [getSymbol]: refSymbol(),
    [getRaw]: value,
    get value() {
      track(this[getSymbol], "value")
      return this[getRaw];
    },
    set value(newValue) {
      if (Object.is(value, newValue)) return;
      let shouldUpdate = specificTrigger(newValue, this[getRaw], this[getSymbol])
      shouldUpdate = allTrigger(this, newValue, this[getRaw], undefined) && shouldUpdate
      if (shouldUpdate) {
        this[getRaw] = newValue;
        trigger(this[getSymbol], "value")
      }
    }
  }
}

const computed: ComputedFunction = <T>(compute: () => T) => {
  let computedObj: Ref<undefined | T> = ref(undefined)
  computedObj[getSymbol] = computedSymbol()
  watchEffect(() => {
    computedObj.value = compute()
  })
  return computedObj as Computed<T>;
}

const watchEffect: WatchEffectFunction = (effect, options) => {
  let prevEffect = activeEffect;
  activeEffect = effect
  effect()
  activeEffect = prevEffect
}

const watch: WatchFunction = (watched, effect, options) => {
  if (specificSubscribersPre.has(watched[getSymbol])) {
    (specificSubscribersPre.get(watched[getSymbol]) as WatchCallback[]).push(effect)
  } else {
    specificSubscribersPre.set(watched[getSymbol], [effect])
  }
  if (options?.instant) {
    effect(watched[getRaw], watched[getRaw], undefined)
  }
}

const watchAll: WatchAllFunction = (effect) => {
  watchAllSubscribers.add(effect)
}

const reactive: ReactiveFunction = <T extends Object>(obj: T) => {
  const symbol = reactiveSymbol()
  const map = new Map<ObjKey, Reactive<T>>()
  const isObject = (obj: any) => typeof obj === "object" && obj !== null
  return new Proxy(obj, {
    set(target: any, prop, newValue, receiver) {
      if (Object.is(target[prop], newValue)) return true;
      let shouldUpdate = specificTrigger(newValue, target[prop], symbol, prop)
      shouldUpdate = allTrigger(receiver, newValue, target[prop], prop) && shouldUpdate
      if (!shouldUpdate) return true
      if (isObject(target[prop]) && map.has(prop)) {
        if (isObject(newValue)) {
          map.set(prop, reactive(newValue))
        } else {
          map.delete(prop)
          target[prop] = newValue
        }
      } else {
        target[prop] = newValue
      }
      trigger(symbol, prop)
      return true
    },
    get(target: any, prop, receiver) {
      if (prop === getSymbol) return symbol
      if (prop === getRaw) return target
      track(symbol, prop)
      if (isObject(target[prop])) {
        if (map.has(prop)) {
          return map.get(prop)
        } else {
          let r = reactive(target[prop])
          map.set(prop, r)
          return r
        }
      }
      return target[prop]
    },
  });
}

export {
  ref, computed, watchEffect, watch, reactive, watchAll
}