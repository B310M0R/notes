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
