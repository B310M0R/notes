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