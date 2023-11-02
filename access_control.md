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