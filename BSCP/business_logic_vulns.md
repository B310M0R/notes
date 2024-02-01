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

## Insufficient workflow validation
Sometimes wehen we post somehting (for example, buying an item) we are redirected to0 confirmation page after we payed for an item  
We can try to add product to cart and repeat request to confirmation page, bypassing paying stage  
Another example - we can bypass some auth stages. If we have role selection stage after login, we can intercept both of these requests, forward login and drop role selection. After it we possibly may have default role (admin)  

## Discounts flaws
Example: we receive discount, when buying items on more then $1000. We can try add to cart items on $1000, apply discount and then remove items.  

### Infinite money flaw
If we have discount coupons and gift cards, we can buy gift cards with discount and then activate them receiving full money (e.g. buying 10$ gift card for 7$ with discount and after activation receiving 10$ again)  
To automate this process we can use workflow similar to this:  
```
Proejct options - sessions - session handling rules - add
In Scope tab select Include all URLs
Go back to details tab - Rule Actions - Run a macro
POST /cart
POST /cart/coupon
POST /cart/checkout
GET /cart/order-confirmation?order-confirmed=true
POST /gift-card

Next select request ET /cart/order-confirmation?order-confirmed=true
Click Configure Item and Add custom parameter. Select parameter with gift card in bottom of the page  
Add custom parameter to POST /gift-card. It must derived from from prior response
```

Then run this macro to GET /my-account in Intruder with NULL payloads.

## Encryption oracle
This is dangerous issue, when user's input is encrypted and he can access this encrypted view and in this way getting understanding of encryption mechanism  
For example if we have encrypted cookie, but we have some another encrypted parameter (e.g. notification) which is sent in encrypted view, but displayed as plain text, we can replace this notification parameter with cookie to decrypt it.  
