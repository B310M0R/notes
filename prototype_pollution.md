# Prototype pollution
Prototype pollution is a JavaScript vulnerability that enables an attacker to add arbitrary properties to global object prototypes, which may then be inherited by user-defined objects.  
JS object:
```
const user =  {
    username: "wiener",
    userId: 01234,
    isAdmin: false
}
```
You can access the properties of an object by using either dot notation or bracket notation to refer to their respective keys: 
```
user.username     // "wiener"
user['userId']    // 01234
```
As well as data, properties may also contain executable functions. In this case, the function is known as a "method". 
```
const user =  {
    username: "wiener",
    userId: 01234,
    exampleMethod: function(){
        // do something
    }
}
```
Prototypes:
```
let myObject = {};
Object.getPrototypeOf(myObject);    // Object.prototype

let myString = "";
Object.getPrototypeOf(myString);    // String.prototype

let myArray = [];
Object.getPrototypeOf(myArray);	    // Array.prototype

let myNumber = 1;
Object.getPrototypeOf(myNumber);    // Number.prototype
```
Objects automatically inherit all of the properties of their assigned prototype, unless they already have their own property with the same key. This enables developers to create new objects that can reuse the properties and methods of existing objects.  
The built-in prototypes provide useful properties and methods for working with basic data types. For example, the String.prototype object has a toLowerCase() method  
Whenever you reference a property of an object, the JavaScript engine first tries to access this directly on the object itself. If the object doesn't have a matching property, the JavaScript engine looks for it on the object's prototype instead  
We can check such behaviour in browser console:
```
let myObject = {};
myObject.
```
And after dot we will see all pre-defined properties from prototype  
Even though there are no properties or methods defined for the object itself, it has inherited some from the built-in Object.prototype.  
everything in JavaScript is an object under the hood, this chain ultimately leads back to the top-level Object.prototype, whose prototype is simply null.   
Objects inherit properties not just from their immediate prototype, but from all objects above them in the prototype chain  
Modifying prototypes:
```
let searchTerm = "  example ";
searchTerm.removeWhitespace();    // "example"
```
## How do prototype pollution vulnerabilities arise?
Prototype pollution vulnerabilities typically arise when a JavaScript function recursively merges an object containing user-controllable properties into an existing object, without first sanitizing the keys. This can allow an attacker to inject a property with a key like __proto__, along with arbitrary nested properties.  
Due to the special meaning of `__proto__` in a JavaScript context, the merge operation may assign the nested properties to the object's prototype instead of the target object itself. As a result, the attacker can pollute the prototype with properties containing harmful values, which may subsequently be used by the application in a dangerous way.  
It's possible to pollute any prototype object, but this most commonly occurs with the built-in global `Object.prototype`.  
## Prototype pollution sources
* The URL via either the query or fragment string (hash) 
* JSON-based input
* Web messages
## Prototype pollution via the URL
```
https://vulnerable-website.com/?__proto__[evilProperty]=payload
```
```
targetObject.__proto__.evilProperty = 'payload';
```
During this assignment, the JavaScript engine treats `__proto__` as a getter for the prototype. As a result, evilProperty is assigned to the returned prototype object rather than the target object itself. Assuming that the target object uses the default Object.prototype, all objects in the JavaScript runtime will now inherit evilProperty, unless they already have a property of their own with a matching key.  
In practice, injecting a property called evilProperty is unlikely to have any effect. However, an attacker can use the same technique to pollute the prototype with properties that are used by the application, or any imported libraries.  
## Prototype pollution via JSON input
```
{
    "__proto__": {
        "evilProperty": "payload"
    }
}
```