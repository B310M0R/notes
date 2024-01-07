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
    }
```
### Aliases
Aliases pass some unique names for multiple properties:
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
                "name": "Juice Extractor",
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
