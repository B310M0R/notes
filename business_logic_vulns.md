# Business logic vulnerabilities

## Excessive trust in client-side controls
This issue comes when developers don't assume that client will be able to send data over anything except web browser (e.g. tampering tools or proxy tools such as Burp)  
For example we can change price of added to card item from 1000$ to 1$  
Another example - 2FA bypass  
If request to 2FA verification has parameter such as verify, where we specify user for which we generate 2FA, we can generate it for another user and bypass 2FA  

## Failing to handle unconventional input
Example - negative numeric values in transactions  
Also try another unexpected values such as extremely long or short strings, and unsupported data types  
We can post a quantity of item to negative value  
### Low-level example
Total price could be limited by maximum integer value (2147483647 or another value). We can try to but items on sum more then this value to try to override this number and go to 0  
We can send lot of requests "bruting" price of items with null payloads in intruder  

To detect content of target (admin panels etc) we can use Burp - Target - Engagement tools - discover content  

### Example with long email address
If we have email server with some domain, we can try to use very long name in email address in order to try reach limit  
<very long string>@mail.server  
If we see that website truncates our email (for example to 255 chars) we can use this to bypass some restrictions.  
For example, if access to admin panel is limited by some domain emails (@corporate.com), we can use something like ((255 - len(corporate.com)) * a)@corporate.com.our-real-email.net. So if website has limit of 255 chars, our real email will be truncated to corporate.com  

## Inconsistent security controls
For example, if admin access is restricted by email domain, we can change our email from settings if it's allolwed by security policies  

## Using non-mandatory input
If we remove some parameter from form, we can receive an error which will describe part of executed code  
Remove only one parameter at time  
Try deleting name of parameter as well as its value  
Tamper URL, POST and cookies parameters  
For example we are able to change password of another user without parameter "current password"  
Or we can use reset password functionality with changing username for whom we are changing pass  
