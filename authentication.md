# Authentication attacks
## Brute-force
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