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
