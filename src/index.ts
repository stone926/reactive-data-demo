import { ref, computed, watchEffect, watch, reactive, watchAll } from "./reactive";

let x = ref(1)
let y = ref(2)
let z = ref(3)
let sum = computed(() => { // should not recompute when z changes
  console.log("compute sum")
  return x.value + y.value
})
let double = computed(() => {
  console.log("double")
  return sum.value * 2
})
watchAll((changed, newValue, oldValue, prop) => {
  console.log(changed, newValue, oldValue, prop)
})
watch(sum, (newValue, oldValue) => {
  console.log("watch sum, new value is:", newValue, ", old value is:", oldValue)
  // return false
}, { instant: true })
watchEffect(() => {
  console.log("x=", x.value, ",y=", y.value, ",x+y=", sum.value, ",double=", double.value)
})
console.log("x++", x.value++)
console.log("z++", z.value++)

let o = reactive({ a: 1, b: 2, o: { c: 3, o: { c: 999 } } } as any)
let p = reactive([1, 2, 3])
watchEffect(() => {
  console.log("o.a=", o.a, ",o.b=", o.b, ",o.o.c=", o.o.c, ",o.o.o.c=", o.o.o.c, ",o.o.o=", o.o.o)
  // console.log("p=", p)
})
watch(p, (newValue, oldValue, prop) => {
  console.log(`p[${prop}]=`, newValue)
}, { instant: false })

let { o: j, p: k } = reactive({ o: { o: 1 }, p: 2 })
// j is reactive, while k is not
watchEffect(() => {
  console.log("j.o=", j.o, ",k=", k)
})
watch(j as any, (newValue, oldValue, prop) => {
  console.log("j.", prop, "=", newValue)
}, { instant: true })
j.o++



