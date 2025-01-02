import { ref, computed, watchEffect, watch, reactive } from "./reactive";

// let x = ref(1)
// let y = ref(2)
// let z = ref(3)
// let sum = computed(() => { // should not recompute when z changes
//   console.log("compute sum")
//   return x.value + y.value
// })
// let double = computed(() => {
//   console.log("double")
//   return sum.value * 2
// })
// watch(sum, (newValue, oldValue) => {
//   console.log("watch sum, new value is:", newValue, ", old value is:", oldValue)
//   return false
// }, { instant: true })
// watchEffect(() => {
//   console.log("x=", x.value, ",y=", y.value, ",x+y=", sum.value, ",double=", double.value)
// })
// console.log("x++", x.value++)
// console.log("z++", z.value++)

let o = reactive({ a: 1, b: 2, o: { c: 3, o: { c: 999 } } } as any)
let p = reactive([1, 2, 3])
watchEffect(() => {
  console.log("o.a=", o.a, ",o.b=", o.b, ",o.o.c=", o.o.c, ",o.o.o.c=", o.o.o.c, ",o.o.o=", o.o.o)
  // console.log("p=", p)
})
watch(p, (newValue, oldValue, prop) => {
  console.log(`p[${prop}]=`, newValue)
}, { instant: false })

// o.o.o.c++
// o.o.c++
o.o.o = 1
o.o.o++
o.o.o = { c: 888, i: 1 }
// o.o.o.d++;
// p.push(9)
// console.log(p)
// p.push(0)
// console.log(p)
// p.sort()
// p[0]++ // reactive



