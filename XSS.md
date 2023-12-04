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
