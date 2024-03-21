# JavaScript
Almost every entity in JS is an object. Object is a set of properties "key: value"  
Any expression always returns a value. Example fo expresions are:
```
'abc'
10
5 + 2
c = 10
'Good' + 'Evening'
a < b
myFunction(c, d)
```
## Names of variables
`PascalCase` - types and classes  
`CONST_VAR` - constants that are predefined and won't change  
`camelCase` - all other variables  

## Types
Primitive types - classics, strings, numbers etc
Linked types - objects. Arrays are objects as well.   
Feature of linked types is that they aren't keeping some value itself, they just keep link to the memory where the value is placed.
```
const objectA = {
    a: 10,
    b: false
}
// In such case objectA variable doesn't have any value inside of it.
// It just has smth like 0x1abd which is a link/reference to the real object
```

The important thing to understand is that we can create as many links to some object as we want and all of them will affect this object. For example:
```
const copyOfObjectA = objectA
copyOfObjectA.a = 20
// Now the OBJECT itself is changed and all links to it will have another value for a
```

In order not to do mistakes and rewrite some important variables, it;s better to use const always when it's possible
In case of functions we can use arrow functions to protect function from overwriting:
```
const a = () => {
    console.log('Hello world')
}
a = 10 //error
```

## Global objects
* window (browser)
* global (nodejs)
By default it's a large objects with lot of properties which are accessible by user.  

`globalThis` - unified object for both node and browser
### Properties of global objects
we can use `window.console` in place of `console`