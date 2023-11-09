# Access Control  
## Unprotected admin functionality
Links to some pages could be accessible from UI from certain users, but also could be accessible when directly request them  
So even if we don't see the link to admin page, we can try to navigate into it throug /admin/ path  
Such pages could probably found in robots.txt  

Sometimes admin panel could be obfuscated. But it could be detected from JS of site (inspect the source code)

## Parameter-based access control methods
Security could be provided by some user-controlled such as cookies. But sometimes sites are realizing their access control with parameters such as `?admin=true` or `?role=1`  
Check responses from updating user. They can reveal some parameters needed for privelege escalation  

## Broken access control resulting from platform misconfiguration
Some platforms could implement security restrictions in such way:  
`DENY: POST, /admin/deleteUser, managers`

One of the ways to override this is to use some custom headers such as X-Original-Url or X-Rewrite-Url.  
These headers are overriding original URL of request, so we can exploit things in such way:  
```
POST / HTTP/1.1
X-Original-URL: /admin/deleteUser
...
```
Such headers could be possibly detected by TRACE requests  
If such request requires a parameter (for example `?username=carlos`) add it to original url

## Request method changing
We can try to access admin functionality and try to change request method (POST -> POSTX) and use function "change request method" in repeater in order to create GET request with same functionality which will be able to bypass security protections.  

## URL-matching discrepancies
We can bypass accesss controls with changing URL's which we accesss  
For example endpoint /admin/deleteUser could be protected, but we can try to access /ADMIN/DELETEUSER or /admin/deleteUser/  
Also in some Spring frameworks we can access such endpoints adding file extension (e.g. .anything) and this will map us to needed endpoint

## Horizontal privilege escalation
```
https://insecure-website.com/myaccount?id=123
```
Attacker can change id parameter and access another account resources(IDOR)  
App can use some non-predictable values such as GUID. In such case we need to find another GUID disclosed somewhere on the site (from other users messages for example)  
Sometimes when user tries to access restricted resource, he is redirected to login page. It worth to check this redirect, because sometimes it can leak some information  
Sometimes horixontal privesc could lead to vertical (if we are getting into admin account)  

## Referer based vuilns
Some access control systems could only check Referer header in order to permit or prohibit request  
For example /admin endpoint could be stronlgly protected, but /admin/deleteUser can only check Referer header and if it's based on /admin Referer, it would pass request  
