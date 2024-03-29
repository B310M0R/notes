//Functions
let a = 5
let b = 3

function sum(a, b) {
    const c = a + b
    return c    // if function doesn't have return, it will return undefined
}

let res = sum(a, b)
console.log(res)

res = sum(1, 2)
console.log(res)
// --------------------------------------------------------------------------
const user1 = {
    name: 'Bob',
    age: 17
}
console.log(user1)

function increaseAge(user) {
    user.age++
    return user.age
}

increaseAge(user1)
console.log(user1)
// functions can modify (mutate) objects
// it's not recommended to modify external objects inside function

function correctIncreaseAge(user) {
    const updatedUser = Object.assign({}, user)
    updatedUser.age++
    return updatedUser
}

updatedUser1 = correctIncreaseAge(user1)
console.log(updatedUser1)
// Better way is to use object copies and not to mutate objects itself

function regularFn() {
    console.log('Hello World')
}

function fnWithCallback (callback) {
    callback
}

fnWithCallback(regularFn())
// Functions which take another function as argument is called callback function

setTimeout(regularFn, 1000)

let anonFn = function(a, b) {
let c = a + b
return c
}
// unnamed function or functional expression. Anonymous functions
// we can assign anonymous function to a variaeble

setTimeout(function() {
    console.log("anonymous")
}, 2000)
// we can use anon funcs as callback funcs

//Arrow functions
const arrowFunction = (a, b) => {
    let c = a + b
    return c
}
// no name, begins with params
// anon functions (such as func exressions ad arrow funcs) are used to assign function to a const var in order to prevent possible changes

setTimeout(() => {
    console.log("arrow function as callback")
}, 3000)

//tl; dr for arrow functions
a => {
    // function body
}
// we can skip () if we have only 1 parameter

(a, b) => a + b
//we can skip {} if function's body contains only ONE expression

function multByFactor(value, mult = 1) {
    return value * mult
}
multByFactor(5) // 5
// mult = 1 is a default value for parameter

const newPost = (post, addedAt = Date()) => ({
    ...post,
    addedAt             // here we alsoi use short xyntax to add object property, because parameter and property name are the same
})

postOne = {
    id: 232,
    author: 'user1'
}

modPostOne = newPost(postOne)
console.log(modPostOne)
//here we use function as default parameter value
// also we use ({}) syntax to implicitly return object from a function. Such syntax show that it's not a regular function body, but an object
// we can use simple {} syntax, but in such case we need to add return statement
