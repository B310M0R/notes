# JWT
## JWT vs JWS vs JWE
he JWT spec is extended by both the JSON Web Signature (JWS) and JSON Web Encryption (JWE) specifications, which define concrete ways of actually implementing JWTs.  
In other words, a JWT is usually either a JWS or JWE token. When people use the term "JWT", they almost always mean a JWS token. JWEs are very similar, except that the actual contents of the token are encrypted rather than just encoded.  
JWT attacks involve a user sending modified JWTs to the server in order to achieve a malicious goal. Typically, this goal is to bypass authentication and access controls by impersonating another user who has already been authenticated.  
## Exploiting flawed JWT signature verification
if the server doesn't verify the signature properly, there's nothing to stop an attacker from making arbitrary changes to the rest of the token.  
## Accepting arbitrary signatures
JWT libraries typically provide one method for verifying tokens and another that just decodes them. For example, the Node.js library jsonwebtoken has verify() and decode().  
Occasionally, developers confuse these two methods and only pass incoming tokens to the decode() method. This effectively means that the application doesn't verify the signature at all.  
In such case we can simply modify JWT token on token.dev and pass it to impersonate another user  
## Accepting tokens with no signature
Among other things, the JWT header contains an alg parameter. This tells the server which algorithm was used to sign the token and, therefore, which algorithm it needs to use when verifying the signature. 
```
{
    "alg": "HS256",
    "typ": "JWT"
}
```
JWTs can be signed using a range of different algorithms, but can also be left unsigned. In this case, the alg parameter is set to none, which indicates a so-called "unsecured JWT"  
So we can simply remove algorithm and send unsigned token  
Due to the obvious dangers of this, servers usually reject tokens with no signature. However, as this kind of filtering relies on string parsing, you can sometimes bypass these filters using classic obfuscation techniques, such as mixed capitalization and unexpected encodings.  
Even if the token is unsigned, the payload part must still be terminated with a trailing dot.  
## Brute-forcing secret keys
Some signing algorithms, such as HS256 (HMAC + SHA-256), use an arbitrary, standalone string as the secret key  
We can try to bruteforce it with well-known secrets [dictionary](https://github.com/wallarm/jwt-secrets/blob/master/jwt.secrets.list)  
Also we can use hashcat to bruteforce secret.  
```
hashcat -a 0 -m 16500 <jwt> <wordlist>
```
After cracking a secret, we can modify our key and change signature on jwt.io
## JWT header parameter injections
According to the JWS specification, only the alg header parameter is mandatory. In practice, however, JWT headers (also known as JOSE headers) often contain several other parameters. The following ones are of particular interest to attackers. 
* jwk (JSON Web Key) - Provides an embedded JSON object representing the key. 
* jku (JSON Web Key Set URL) - Provides a URL from which servers can fetch a set of keys containing the correct key
* kid (Key ID) - Provides an ID that servers can use to identify the correct key in cases where there are multiple keys to choose from. Depending on the format of the key, this may have a matching kid parameter.  
## Injecting self-signed JWTs via the jwk parameter
Ideally, servers should only use a limited whitelist of public keys to verify JWT signatures. However, misconfigured servers sometimes use any key that's embedded in the jwk parameter.  
You can exploit this behavior by signing a modified JWT using your own RSA private key, then embedding the matching public key in the jwk header.  
Although you can manually add or modify the jwk parameter in Burp  

* With the extension loaded, in Burp's main tab bar, go to the JWT Editor Keys tab.
* Generate a new RSA key.
* Send a request containing a JWT to Burp Repeater.
* In the message editor, switch to the extension-generated JSON Web Token tab and modify the token's payload however you like.
* Click Attack, then select Embedded JWK. When prompted, select your newly generated RSA key.
* Send the request to test how the server responds.
You can also perform this attack manually by adding the jwk header yourself. However, you may also need to update the JWT's kid header parameter to match the kid of the embedded key.  
```
{
    "kid": "ed2Nf8sb-sD6ng0-scs5390g-fFD8sfxG",
    "typ": "JWT",
    "alg": "RS256",
    "jwk": {
        "kty": "RSA",
        "e": "AQAB",
        "kid": "ed2Nf8sb-sD6ng0-scs5390g-fFD8sfxG",
        "n": "yy1wpYmffgXBxhAUJzHHocCuJolwDqql75ZWuCQ_cb33K2vh9m"
    }
}
```
## Injecting self-signed JWTs via the jku parameter
Instead of embedding public keys directly using the jwk header parameter, some servers let you use the jku (JWK Set URL) header parameter to reference a JWK Set containing the key. When verifying the signature, the server fetches the relevant key from this URL.  
Example of JWK set:
```
{
    "keys": [
        {
            "kty": "RSA",
            "e": "AQAB",
            "kid": "75d0ef47-af89-47a9-9061-7c02a610d5ab",
            "n": "o-yy1wpYmffgXBxhAUJzHHocCuJolwDqql75ZWuCQ_cb33K2vh9mk6GPM9gNN4Y_qTVX67WhsN3JvaFYw-fhvsWQ"
        },
        {
            "kty": "RSA",
            "e": "AQAB",
            "kid": "d8fDFo-fS9-faS14a9-ASf99sa-7c1Ad5abA",
            "n": "fc3f-yy1wpYmffgXBxhAUJzHql79gNNQ_cb33HocCuJolwDqmk6GPM4Y_qTVX67WhsN3JvaFYw-dfg6DH-asAScw"
        }
    ]
}
```

JWK Sets like this are sometimes exposed publicly via a standard endpoint, such as /.well-known/jwks.json. 
Steps for attack:
* generate RSA key
* Copy it as JWK
* store on exploit server JWK set
* modify values of JWT
* add jku parameter with url of exploit server's JWK set
* change kid of JWT token in order to be same as in JWK set
* sign JWT with generated RSA key
* pwn!
## Injecting self-signed JWTs via the kid parameter
Verification keys are often stored as a JWK Set. In this case, the server may simply look for the JWK with the same kid as the token  
If this parameter is also vulnerable to directory traversal, an attacker could potentially force the server to use an arbitrary file from its filesystem as the verification key.  
```
{
    "kid": "../../path/to/file",
    "typ": "JWT",
    "alg": "HS256",
    "k": "asGsADas3421-dfh9DGN-AFDFDbasfd8-anfjkvc"
}
```
This is especially dangerous if the server also supports JWTs signed using a symmetric algorithm. In this case, an attacker could potentially point the kid parameter to a predictable, static file, then sign the JWT using a secret that matches the contents of this file.   
You could theoretically do this with any file, but one of the simplest methods is to use /dev/null, which is present on most Linux systems. As this is an empty file, reading it returns an empty string. Therefore, signing the token with a empty string will result in a valid signature.  
Signing with an empty string is a signing with null byte (base64 encoded -`AA==`)