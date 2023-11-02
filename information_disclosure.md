# Information Disclosure
## Ways to Exploit
### Fuzzing
Fuzz all aprameters with unexpected data. Error responses and time of response - are main points of interest

### Burp Scanner 
### Burp Engagement tools
We can click on any request and use one of many engagement toolsw which are able to:
* search some strings
* find comments
* discover content (dirbuster)

### Files for web crawlers
* robots.txt
* sitemap.xml

### Directory listings
It is the feature of website, when it lists some contents which doesn't have index on site  

### Debugging data
Debug data stored to a separate file and leaked to production could be very useful (debug files, log files etc.)  
One of interesting locations - /cgi-bin/phpinfo.php  

### User-account pages
GET /user/personal-info?user=carlos  
We can simply try to change user parameter to get info about another user (IDOR vuln)  

### Source code disclosure via backup files
We can find some backup files within a temporary text editor files, adding ~ at the beginning of the file or using another extension (.php.bak)  
Check /backup/ dir  

### Information disclosure due to insecure configuration
Some third-party tools could be insecurely configured  
And sometimes we are able to use debugging TRACE requests (if they are allowed) in order do siclose some auth headers  
For example if admin interface is available only to local users, we can use TRACE request to check what headers are used to specify user's ip (for example it's X-Custom-Ip-Authorization)  
In such case we cxan change custom header in order to get access to admin interface  

### Version control history
/.git directory  
Next we can try to download full git log commit history  
Also we can use automated tools such as GitHack, GitHacker, GitTools or simply download it with wget:  
`wget --mirror -I .git example.com/.git/`
Then check it with `git status` and `git log`  
If we see deleted files in git status we can use `git restore .` or `git checkout --`  
Then we can use `git reset --hard <commit>` to move back to previous commit. Interesting commits we can found via `git log` command.  

