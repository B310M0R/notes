// Scope
let a 
let b 

function myFn() {
    let b
    a = true
    b = 10
    console.log(a) //true
    console.log(b) // 10
}

myFn()
console.log(a) //true
console.log(b) //undefined
// it's not recommended to change global variables from function. Inner variables for inner scope.
//variables that are created without let or const (just a = 10) are automatically created in global scope. 
// it's better not to do that

// Sctrict mode
'use strict' // this must be written at the top of program
function myFn(){
    //a = true // error
    let a = true
    console.log(a)
}
myFn()
// also we can use strict mode not in global scope, but inside of function

// Operators
// text operators: typeof, instanceof, new, delete
const user = {
    name: 'Bob',
    age: 21,
    gender: 'helicopter'
}

delete user.gender
console.log(user)
// delete operator deletes object's property

const type = typeof user.age
typeof 10
typeof 'abc'
console.log(type)
typeof 1 === 3
// typeof defines type of objects's property

// instance = instanceof user.age
// console.log(instance) 
// with instanceof we can check reference of object to a class

const button = {
    width: 200,
    text: 'Buy'
}
const redButton = {
    ...button,
    color: 'red'
}
//... operator is used to copy properties of one object into another
console.table(redButton)

//also we can combine objects with ... operator

greeting = `${hello} ${world}`
// template string

