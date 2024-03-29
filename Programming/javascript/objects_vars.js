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

const objectA = {
    a: 10
}
console.log(objectA.a)

const copyOfObjectA = objectA
copyOfObjectA.a = 20
console.log(objectA.a)
// link to the object will change the whole object, so all other links will be changed as well

copyOfObjectA.b = 'abc'
console.log(copyOfObjectA.b)
// we also can add any new object property via link to the object

// Objects
const myCity = {
    city: 'New York',
    popular: true,
    country: 'USA'
}
// order of properties doesn't matter

console.log(myCity.city)
console.log(myCity.popular)
//with dot we address some properties (dot notation)

myCity.city = 'Los Angeles'
console.log(myCity.city)
//also with dot notation we can change and reassign properties

myCity.population = 323832
console.log(myCity)
// also we can assign new properties. No matter that object is created with const, we can change it.
// We change object, not a variable. We can't reasign myCity to another object or value, but we can change object
// with which variable is associated. It's called mutation

delete myCity.population
console.log(myCity)
// delete could be used to delete some properties of an object

myCity['population'] = 12312
const myCityPropertyName = 'country'
myCity[myCityPropertyName] = 'USA'
console.log(myCity)
// we can use [] to work with properties. It's useful if we want to add property which is generated with some variable (myCityPropertyName)

delete myCity.country
delete myCity.popular

const information = {
    isPopular: true,
    country: 'USA'
}

myCity.info = information
myCity.info.isPopular = true
console.log(myCity)
// example of nested object. Value of object's property could be another value. Also we need two dots to modify "inside" property
// also we can combine dot notation with []. myCity.info['isPopular']

const name = 'Denys'
let friends = 0
let userProfile = {
    name: name,
    friends: friends,
    isRegistered: false
}
console.log(userProfile)
// we can use variables to assign them into properties

userProfile = {
    name,
    friends,
    isRegistered: false
}
console.log(userProfile)
// we can use shorter notation for same variables and properties
userProfile = {
    name,
    friends,
    isRegistered: false,
    greeting: function () {
        console.log('Hello!')
    }
}
userProfile.greeting()
// example of method
//We can also use shorter way to add method: greeting() {<function body>}

jsonOneLine = '{"glossary":{"title":"example glossary","GlossDiv":{"title":"S","GlossList":{"GlossEntry":{"ID":"SGML","SortAs":"SGML","GlossTerm":"Standard Generalized Markup Language","Acronym":"SGML","Abbrev":"ISO 8879:1986","GlossDef":{"para":"A meta-markup language, used to create markup languages such as DocBook.","GlossSeeAlso":["GML","XML"]},"GlossSee":"markup"}}}}}'
console.log(jsonOneLine)
parsedJson = JSON.parse(jsonOneLine)
console.log(parsedJson.glossary.GlossDiv)
// we had parsed json one-liner into javascript object and from that point we can reference any object and property.

newJsonObject = JSON.stringify(parsedJson)
console.log(newJsonObject)
// JSON.stringify() is a reverse function

const person = {
    name: 'Bob',
    age: 42
}

const person2 = Object.assign({}, person)
person2.name = 'Oscar'
console.log(person)
console.log(person2)
// It's a way to protect object from mutation and use it's as a template for another object.
// In such case we create object person2 from object person, mutate it, but object person lasts intacted
// note: Object is a type, class and prototype for all objects at one time
// Object.assign is a method of object Object and used to create new objects.
// note: If original object has nested objects inside of it, referrences to this objects are kept in new object.
// So this method helps only to avoid mutation of root properties

const person3 = { ...person }
person3.name='Alice'
console.log(person)
console.log(person2)
console.log(person3)
// ... operator is alternative to Object.assign(). Nested objects still will not be affected.
// this operator is called spread. It divides object by its properties and at the moment build them up into a new object

const person4 = JSON.parse(JSON.stringify(person))
person4.name='Vlada'
console.log(person4)
//This method helps to protect nested objects as well
// we convert object into JSON string with stringify() and then parse it to normal JS object with parse()
