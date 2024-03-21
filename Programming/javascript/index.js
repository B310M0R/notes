console.log('Properties of object console:')
console.dir(console)
// console is an object, log - method (function), which outputs smth to console, dir - method that lists all properties of some object. The whole line of code is an expression.
console.table(console)
// table outputs properties in a table view
let simpleVar = 'let variable could be changed'
const MY_CONSTANT = "Constant couldn't be"
var var3 = 'test'
// var is depreceated. Use let and const
// let changable, const - not
console.log(simpleVar)
console.log(MY_CONSTANT)
console.log(var3)

simpleVar = 'new value of let var'
//MY_CONSTANT = 'error!'

console.log(simpleVar)
//console.log(MY_CONSTANT)

simpleVar = false
console.log(simpleVar)
//we could change type of variables
