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
### Lov-level example
Total price could be limited by maximum integer value (2147483647 or another value). We can try to but items on sum more then this value to try to override this number and go to 0  
We can send lot of requests "bruting" price of items with null payloads in intruder  
