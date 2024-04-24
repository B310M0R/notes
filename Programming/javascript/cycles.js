//cycles
// for
let i = 0

for (i; i < 5; i++) {
    console.log(i)
}
// it's better not to use cycle for with arrays. Better use methods forEach() and map()

// while
while (i < 10) {
    i++
    console.log(i)
}

// do while
do {
    i++
    console.log(i)
} while (i < 10)
// this cycle will run at least once even if condition is false

// for in
let myObj = {
    key0: 0,
    key1: 1,
    key2: 2
}
for (key in myObj) {
    console.log(key, myObj[key])
}
// alternative with forEach method
Object.keys(myObj).forEach(key => {
    console.log(key, myObj[key])
})
//Object.keys(<object>) takes all keys from object
// we can get all values of object without keys, using Object.values(<object>) construction
// Object.values or Object.keys converts object into array of objects' keys or values

// for of

for (const el of 'Hello') {
    console.log(el)
}

for (const el of ['Hello', 100, true]) {
    console.log(el)
}
// for of cycle is used with iterable entities
// objects aren't iterable, so we can't use for of cycle with them


