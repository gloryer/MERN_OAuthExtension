# Implementation Guide


The proposed context-aware OAuth protocol has been implemented and can be found [here]. This document aims to provide guidance for a quick start. It walks through the general concepts and some implementation details of the following entities: 

  - Authorization Server
  - Resource Server
  - Environmental situation oracles (ESO)
  
Note that we use HTTP as the communication protocol in the implementation. 
Please refer to `griffin_doc.pdf` for the full documentation. 
This implementation guide will use the terminology in protocol design. 


## Tech

The implementation uses a number of open source projects/libraries to work properly:

* [MongoDB] - Cloud-based database
* [node.js] - evented I/O for the backend
* [Express] - fast node.js network app framework [@tjholowaychuk]
* [Postman] - A tool for testing server APIs
* [JWT] - JSON Web Token

## Authorization Server 
### Installation 
Requirements: 
- [Installing node.js and npm] 
1. Installing packages at root folder (MERN_OAuthExtension>)
```javascript
$ npm i express body-parser mongoose concurrently jsonwebtoken crypto-js
$ npm i -g npm
$ npm i --save lodash
$ npm i -D nodemon
```
2. Configuration of MongoDB
Specify the mongoURI in `./configure/default.json`

```json
{  
  "mongoURI": "mongodb+srv://<dbuser>:<dbpassword>@cluster0-4nhxz.mongodb.net/test?retryWrites=true&w=majority"
}
  ```
3. Specify the port number (optional) 

```javascript
// Change the following line in ./server.js. The default port is 5000.
const port =process.env.PORT || <port>;
```
4. Run the server at root folder (MERN_OAuthExtension>)
```javascript
npm run server 
```
```javascript
//If the server runs successfully, you should see the following messages.
Server started on port 5000
MongoDB Connected...
```

5. Store the credentials (private key of the server, public keys of registered client) in `./configure/default.json`. 
### API Reference
- `/api/authorization`: Client sends a post request to this API for authorization. If authorization is granted, the server responds with access tokens. 
- `/api/policy`: Sysadmin can send get, post and delete request to this API to query the current policy rules, create new rules and delete existing rules. 
- `/api/subjectAttributes`: Sysadmin can send get, post and delete request to this API to query the current subject attributes, create new subject attributes and delete existing subject attributes. 

In the following sections, we will give some necesarry explanation for the back-end server implementation, followed by examples of API usage.  If you want to start testing the APIs right away, please go to  examples of API usage. 

### Overview
The authorization server is implemented as a node.js server, listened on port 5000 in the local computer. The AS provides the authorization and token generation service. We implement ABAC model for authorization and JSON web token for access token and ESO token.  The implemented AS includes three endpoints, policy decision point (PDP),  policy administration point (PAP), policy information point (PIP) to control access. Once request is permitted, AS will invoke the token generation service to generate access token and ESO token if necessary. 

  - `policy decision point (PDP)`:  Grant or deny the request based on attributes possessed by the requester. 
  - `policy administration point (PAP)`: Interface for creating, managing and storing the policies. 
  - `policy information point (PIP)`: Provides the attribute data required for policy evaluation. 
  - `token service`: Create jwt tokens which contains sufficient information of the authorization. 
  - `ESO configuration`: The ESO registers its  description (which context it tracks) and URL to AS. AS maintains these information in the JSON file (not implemented yet, currently we only have one ESO server). To acquire the URL information of an eso server, AS simply looks up the context description and uses the matched URL for eso token. 
### Policy Language Model 

The policy should conform the following model: 

\<`Policy`> ::=\<`Rule`> | \<`Rule`> \<`Policy`>

\<`Rule`>::= \<`subjectAttributes`>\<`objectAttributes`>\<`authorization`>\<`actionAttributes`>\<`environmentContext`>\<`Default`> 

The `Policy` consists of a set of `Rules`. A `Rule` must have the following form: 

- `subjectAttributes`: Attributes of the subject.
- `objectAttributes`: Attributes of the object. 
- `authorization`: The result of policy evaluation.
- `actionAttributes`: `actionAttributes`  specifies the action scope and the authorization conditions associated with the action.  The authorization conditions should be performed by the policy enforcement point  in conjunction with the enforcement of an authorization decision. 
- `EnvironmentContext` (optional): The external context to be evaluated when client accesses resources on RS. 
- `Default`: Indicating the default decision  if the attributes of the requester or attibutes of the object does not match with the attibutes in `Rule`. 

### Policy Implementation

Our AS can support any policy content as long as the expression of the policy conforms to the  policy language model. This means that the AS can handle multiple application at the same time.  For ease of access, the policy in each application should be contained seperately. In our implementaion, we simply add a key `application`  for each `Rules` to filter all the rules related to one application.  

Policies are a set of rules which are JSON objects taking the following form: 

- `Type`: `"ABAC policy"`.
- `name`: Name of the policy.
- `application`
- `subjectAttributes`
- `objectAttributes`
- `authorization`
- `actionAttributes`
- `environmentContext` 
- `Default`

The following examples shows two sample rules. One for health care application and one for payment application

#### Health Care Sample Rule
All Nurse practitioners and doctors in the Cardiology Department can view the Medical Records of Heart Patient when they work at the hospital. 

 
```json
{
  "type":"ABAC policy",
  "name":"HeartPatientRecord",
  "application":"Health"
  "rules":{
    "subjectAttribute":{
      "role":["Doctor","Nurse"],
      "department":"Cardiology"
    },
    "objectAttribute":{
      "resourceType":["Heart"]
    },
    "authorization":"permit",
    "actionAttributes":{
      "actions":["view"]
    },
    "context":["clientlocationhospital"],
    "Default":{
      "authorization":"deny"
    }
  }
}
```

#### Payment Sample Rule
Client App A can one time charge $10 ON Alice's checking account and tranfer $100 from Alice's checking account to account 56829181.
 
```json
{
  "type":"ABAC policy",
  "name":"client_Apayment",
  "application":"Payment",
  "rules":{
    "subjectAttributes":{
      "id":"client_A"
    },
    "objectAttributes":{
      "owner":"Alice",
      "account":"Checking"
    },
    "authorization":"Permit",
    "actionAttributes":{
      "actions":["withdraw","transfer"],
      "withdraw":{
        "amount":"10",
        "currency":"CAD",
        "occurance":"1"
      },
      "transfer":{
         "limit":"100",
         "currency":"CAD",
         "toaccount":"56829181"
      }
    },
    "environmentContext":[],
    "Default":{
      "authorization":"Deny"
    }
  }
}
```
 Multiple actions are allowed in one rule.  The ` actions `contains a list of strings representing different actions. Each action has an object which parameterizes all the authorization conditions.  The example above shows two allowed actions and the associated consitions. 


### Subject Attributes Implementation 
Each subject in each application is a JSON object  taking the following form: 

- `subject_id`
- `application`
- `customizedAttributes`

The following examples shows two sample subjects and their attibutes. 
```json
{
  "subject_id": "1000",
  "application": "Health",
  "customizedAttributes": {
    "role": ["Doctor"],
    "department": ["Cardiology"],
    "name": "John Smith"
  }
}
```
```json
{
  "subject_id": "client_B",
  "application": "Payment",
  "customizedAttributes":{}
}
```



### Client Claims

Client sends http post request to `api/authoriazation` of the AS to obtain an access token and potentially eso token. The request header of this request must contain the following fields:

- `grant-type `: client_credentials
- `client-assertion-type`: urn:ietf:params:oauth:client-assertion-type:jwt-bearer
- `client-assertion`: client claim token (jwt format)

Below shows an example of the decoded claim token from client:  

```json
{
  "expireIn": "30 days",
  "client_id": "1000",
  "audience": "http://localhost:5000/authorization",
  "issuer": "John",
  "objectAttributes": {
    "resourceType": ["Heart"]
  },
  "structured_scope": {
    "actions": ["view"]
  },
  "application": "Health",
  "iat": 1567202685
}
```
Client claim token contains  client signature for authentication purpose. The jwt token can be constructed easily by using ` jsonwebtoken` library. 
### Authorization Evaluation 

AS will first validate all fields in the client request. The client is authenticated by creating jwt using client credentials. Then, the AS decodes the jwt token from the client, get the client_id and look up the associated subject attributed with the client_id. With the found subject attributes, AS evaluates it with all the available policies one by one. More specifically, AS checks (1) if the requested `objectAttributes` are allowed by the policy (2) if the requested `structured_scope` are allowed by the policy `actionAttributes` (3) if the subject has all the attributes required in policy `subjectAttributes`.  Authorization service adopts `permit-override` strategy. If there exists at least one permitted policy, AS will grant the access and generate an access token. 

### Access Token 
AS pulls out the relevant information in the policy and embeds them in the token so that RS can verify the token without the need of introspecting the token at AS. An example of the access token is shown below (after decoding) :

```json
{
  "expireIn": "1 day",
  "subject": "1000",
  "audience": "http://localhost:4990/getResource",
  "issuer": "http://localhost:5000/authorization",
  "objectAttributes": {
    "resourceType": [
      "Heart"
    ]
  },
  "actionAttributes": {
    "actions": [
      "view"
    ]
  },
  "environmentContext": [
    "clientlocationhospital"
  ],
  "iat": 1567468693
}
```

### ESO Token 
If context verification is required, an eso token is returned to client together with the access token. The two token is cryptographically bound. The access token and the ESO token are not encrypted, but signed by the AS.  RS can find the URL of the ESO by decoding the eso token. The `audience` value is the URL of the eso server. An example of the eso token is shown below (after decoding) :
```json
{
  "expireIn": "1 day",
  "hashAT": {
    "words": [
      1904756807,
      -1499235065,
      -860331953,
      -1557528208,
      -355723369,
      -1355021346,
      -70944964,
      -653925533
    ],
    "sigBytes": 32
  },
  "subject": "http://localhost:4990/getResource",
  "audience": "http://localhost:4995/userathospital",
  "issuer": "http://localhost:5000/authorization",
  "action": [
    "read"
  ],
  "environmentContext": [
    "clientlocationhospital"
  ],
  "iat": 1567468693
}
```

### Example of /api/authorization
#### Sending the request 
Client sends post request to `https://localhost:5000/api/authorization`. The header of this request is:

- `grant-type`: client_credentials
- `client-assertion-type`: urn:ietf:params:oauth:client-assertion-type:jwt-bearer
- `client-assertion`:
```
eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHBpcmVJbiI6IjMwIGRheXMiLCJjbGllbnRfaWQiOiIxMDAwIiwiYXVkaWVuY2UiOiJodHRwczovL2xvY2FsaG9zdDo1MDAwL2F1dGhvcml6YXRpb24iLCJpc3N1ZXIiOiJKb2huIiwib2JqZWN0QXR0cmlidXRlcyI6eyJyZXNvdXJjZVR5cGUiOlsiSGVhcnQiXX0sInN0cnVjdHVyZWRfc2NvcGUiOnsiYWN0aW9ucyI6WyJ2aWV3Il19LCJhcHBsaWNhdGlvbiI6IkhlYWx0aCIsImlhdCI6MTU3MDk5MzI0NH0.3Mk4oKfLo8c6sRbKnnVifgfc0CmrLmGn44QuwytKH5JaMmqgbZ9W6e1TJEojgP0WPftkxaYg5LjVCS4Q2Dp6hQ
```

Decoded client-assertion: 

````json
{
  "expireIn": "30 days",
  "client_id": "1000",
  "audience": "https://localhost:5000/authorization",
  "issuer": "John",
  "objectAttributes": {
    "resourceType": [
      "Heart"
    ]
  },
  "structured_scope": {
    "actions": [
      "view"
    ]
  },
  "application": "Health",
  "iat": 1570993244
}
````

To issue the https request to the authorization server, we recommend using [Postman] tool. 
For the purpose of testing, we use [self-generated certificates] to establish TLS connection between the client and the server. 

#### Response from the server
```json
{
"access_token": "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHBpcmVJbiI6IjEgZGF5Iiwic3ViamVjdCI6IjEwMDAiLCJhdWRpZW5jZSI6Imh0dHBzOi8vbG9jYWxob3N0OjQ5OTAvZ2V0UmVzb3VyY2UiLCJpc3N1ZXIiOiJodHRwczovL2xvY2FsaG9zdDo1MDAwL2F1dGhvcml6YXRpb24iLCJvYmplY3RBdHRyaWJ1dGVzIjp7InJlc291cmNlVHlwZSI6WyJIZWFydCJdfSwiYWN0aW9uQXR0cmlidXRlcyI6eyJhY3Rpb25zIjpbInZpZXciXX0sImVudmlyb25tZW50Q29udGV4dCI6WyJjbGllbnRsb2NhdGlvbmhvc3BpdGFsIl0sImlhdCI6MTU4MTYyNjE0Mn0.U6rEoeH107SKloOnCQNsgsbcs6pavIUrLmVeRiFph_8oykYhrOfd8uiYtUJRlCR94HQ-y-DBd5HyNllj62ZdIw",

"ESO_token": "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHBpcmVJbiI6IjEgZGF5IiwiaGFzaEFUIjp7IndvcmRzIjpbLTIyMzExMzkwLC0yODExMzQyNzAsMTUyNTUyODMzMiwtODE2MDg1MTkwLC0xOTM0MTE3Nzg4LDIxMzkwOTE2MjUsMTIzNzYwODMxOCw3MDUwOTA3NDJdLCJzaWdCeXRlcyI6MzJ9LCJzdWJqZWN0IjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NDk5MC9nZXRSZXNvdXJjZSIsImF1ZGllbmNlIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NDk5NS91c2VyYXRob3NwaXRhbCIsImlzc3VlciI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDAvYXV0aG9yaXphdGlvbiIsImFjdGlvbiI6WyJyZWFkIl0sImVudmlyb25tZW50Q29udGV4dCI6WyJjbGllbnRsb2NhdGlvbmhvc3BpdGFsIl0sImlhdCI6MTU4MTYyNjE0Mn0.p8it7QlQNNvi8PmDfxBK3k_5oRSqAMSTD04VEQkm1K54ZZxouIFShxt35NALNu5i7c6Af8xUkvyA4DLyg6BYvg"
}

```


### Example of /api/policy
#### Sending the request
Client sends post request to `https://localhost:5000/api/authorization`. The header of this request is:

- `content-type`: application/json

The new policy is sent in the request body: 
```json
{
  "type":"ABAC policy",
  "name":"client_Apayment",
  "application":"Payment",
  "rules":{
    "subjectAttributes":{
      "id":"client_A"
    },
    "objectAttributes":{
      "owner":"Alice",
      "account":"Checking"
    },
    "authorization":"Permit",
    "actionAttributes":{
      "actions":["withdraw","transfer"],
      "withdraw":{
        "amount":"10",
        "currency":"CAD",
        "occurance":"1"
      },
      "transfer":{
         "amountupperbound":"100",
         "currency":"CAD",
         "toaccount":"56829181"
      }
    },
    "environmentContext":[],
    "Default":{
      "authorization":"Deny"
    }
  }
}
```

#### Response from the server
The server will respond the created policy. 


### Example of /api/subjectAttributes
#### Sending the request
Client sends post request to `https://localhost:5000/api/subjectAttributes`. The header of this request is:

- `content-type`: application/json

The new attribute is sent in the request body: 
```json
{
  "subject_id":"1002",
  "application":"Health",
  "customizedAttributes":{
    "role": ["tech"],
    "department": ["IT"],
    "name":"Scott Carrington"
  }
}
```

#### Response from the server
The server will respond the created attribute. 



## Resource Server 
### Installation 
Requirements: 
- [Installing node.js and npm] 
1. Installing packages at folder (MERN_OAuthExtension/resource_server>)
```javascript
$ npm i express body-parser mongoose concurrently jsonwebtoken crypto-js axios
$ npm i -g npm
$ npm i --save lodash
$ npm i -D nodemon
```
2. Configuration of MongoDB
Specify the mongoURI in `MERN_OAuthExtension/resource_server/configure/default.json`

```json
{  
  "mongoURI": "mongodb+srv://<dbuser>:<dbpassword>@cluster0-4nhxz.mongodb.net/test?retryWrites=true&w=majority"
}
  ```
3. Specify the port number (optional) 

```javascript
// Change the following line in MERN_OAuthExtension/resource_server/server.js. The default port is 4990.
const port =process.env.PORT || <port>;
```
4. Run the server at folder (MERN_OAuthExtension/resource_server>)
```javascript
npm run server 
```
```javascript
//If the server runs successfully, you should see the following messages.
Server started on port 4990
MongoDB Connected...
```
5. Store the credentials (private key of the server, public keys of registered client, public key of the AS) in `MERN_OAuthExtension/resource_server/configure/default.json`.



### API Reference
- `/api/getResource`: Client sends a get request to this API to access patient data.  If the tokens within this request is valid, the server responds with patient data.
- `/api/setResource`: Client sends post request to this API to create patient resources. 

In the following sections, we will give some necesarry explanation for the back-end server implementation, followed by examples of API usage.  If you want to start testing the APIs right away, please go to  examples of API usage. 

### Overview
The resource server is implemented as a node.js server, listened on port 4990 in the local computer. Object attributes are typically bound to their objects through referencing, by embedding them  within the object. The resources are stored together with their attributes. The policy enforcement  point is implemented on the RS. Upon receiving the tokens from the client, the RS verifies the  signatures of each token, contents of each token, and checks if two tokens are bound. If context validation is required, the RS sends an HTTPS post request to fetch the internal state of the ESO.  Once all these steps are successful, the RS may query the database and return the resources or provides services to the client. Because the services and the resources provided by the RS vary  from one application to another, we wrap all the token validations and context checking duties into  an Express middleware. Programmers can easily invoke this independent module when writing any customized API for the RS.

### Example of /api/getResource
#### Sending the request 
Client sends post request to `https://localhost:4990/api/getResource`. The header of this request is:

- `Content-Type`: client_credentials
- `x-oauth-token`:
```
eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHBpcmVJbiI6IjEgZGF5Iiwic3ViamVjdCI6IjEwMDAiLCJhdWRpZW5jZSI6Imh0dHBzOi8vbG9jYWxob3N0OjQ5OTAvZ2V0UmVzb3VyY2UiLCJpc3N1ZXIiOiJodHRwczovL2xvY2FsaG9zdDo1MDAwL2F1dGhvcml6YXRpb24iLCJvYmplY3RBdHRyaWJ1dGVzIjp7InJlc291cmNlVHlwZSI6WyJIZWFydCJdfSwiYWN0aW9uQXR0cmlidXRlcyI6eyJhY3Rpb25zIjpbInZpZXciXX0sImVudmlyb25tZW50Q29udGV4dCI6WyJjbGllbnRsb2NhdGlvbmhvc3BpdGFsIl0sImlhdCI6MTU3MDk5MzI1NH0.FA3CDKBQSGcZ6pHNT0T3E4g_UPedYf7GQ_0i_peUEyyhwWJVEQk7JTgsh_baklHQUAK3_UolykHKeJUHcGho2A
```
- `x-eso-token`:
 ```
eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHBpcmVJbiI6IjEgZGF5IiwiaGFzaEFUIjp7IndvcmRzIjpbNjk4NTcxODcyLC0xNzM2NTcxNzYyLC0yMTA0MzU0MTA2LDE5NzMxOTk2MjYsMTczNDMxNTczOSwtNzk5MDM2OTIsLTY1NjAzNTA0NywtMTEyMDY1MDM4MF0sInNpZ0J5dGVzIjozMn0sInN1YmplY3QiOiJodHRwczovL2xvY2FsaG9zdDo0OTkwL2dldFJlc291cmNlIiwiYXVkaWVuY2UiOiJodHRwczovL2xvY2FsaG9zdDo0OTk1L3VzZXJhdGhvc3BpdGFsIiwiaXNzdWVyIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMC9hdXRob3JpemF0aW9uIiwiYWN0aW9uIjpbInJlYWQiXSwiZW52aXJvbm1lbnRDb250ZXh0IjpbImNsaWVudGxvY2F0aW9uaG9zcGl0YWwiXSwiaWF0IjoxNTcwOTkzMjU0fQ.Rylr1No1AUSpVzc9Mrv258olyxp4zQwf5AHL8DxAhwkviNIS9Rk3m0HRBlqx9EGC7PBrYXBCsXEjgq8XWuLpXg
```
Decoded x-oauth-token:  

````json
{
  "expireIn": "1 day",
  "subject": "1000",
  "audience": "https://localhost:4990/getResource",
  "issuer": "https://localhost:5000/authorization",
  "objectAttributes": {
    "resourceType": [
      "Heart"
    ]
  },
  "actionAttributes": {
    "actions": [
      "view"
    ]
  },
  "environmentContext": [
    "clientlocationhospital"
  ],
  "iat": 1570993254
}
````
Decoded x-eso-token:  

```json
{
  "expireIn": "1 day",
  "hashAT": {
    "words": [
      698571872,
      -1736571762,
      -2104354106,
      1973199626,
      1734315739,
      -79903692,
      -656035047,
      -1120650380
    ],
    "sigBytes": 32
  },
  "subject": "https://localhost:4990/getResource",
  "audience": "https://localhost:4995/userathospital",
  "issuer": "https://localhost:5000/authorization",
  "action": [
    "read"
  ],
  "environmentContext": [
    "clientlocationhospital"
  ],
  "iat": 1570993254
}
```
To issue the https request to the authorization server, we recommend using [Postman] tool. 
For the purpose of testing, we use [self-generated certificates] to establish TLS connection between the client and the server. 

To check the context, you must run the ESO server. The ESO server listens any request from the resource server. Please see blow sections for installation of the ESO server.  

#### Response from the server

Server returns a list of patient data labelled "Heart"
```json
{
    "content": [
        {
            "resourceType": [
                "Heart"
            ],
            "_id": "5d6980267082e2425c6f2738",
            "resource_set_id": "14585739",
            "resourceDescription": "Patient 0 cardiology info in cardiology department",
            "content": {
                "diagnosis": "VSD, Type 2 (Perimembranous) (Paramembranous) (Conoventricular)"
            },
            "__v": 0
        },
        {
            "resourceType": [
                "Heart"
            ],
            "_id": "5d6980507082e2425c6f2739",
            "resource_set_id": "14585740",
            "resourceDescription": "Patient 1 cardiology info in cardiology department",
            "content": {
                "diagnosis": "Open sternum with open skin (includes membrane placed to close skin)"
            },
            "__v": 0
        },
        {
            "resourceType": [
                "Heart"
            ],
            "_id": "5d69806d7082e2425c6f273a",
            "resource_set_id": "14585741",
            "resourceDescription": "Patient 2 cardiology info in cardiology department",
            "content": {
                "diagnosis": "Hypoplastic left heart syndrome (HLHS) "
            },
            "__v": 0
        },
        {
            "resourceType": [
                "Heart"
            ],
            "_id": "5d9f67b33d7f8b216456591b",
            "resource_set_id": "14585742",
            "resourceDescription": "Patient 3 cardiology info in cardiology department",
            "content": {
                "diagnosis": "High blood pressure/Hypertension"
            },
            "__v": 0
        }
    ]
}
```
### Example of /api/setResource
#### Sending the request
Client sends post request to `https://localhost:4990/api/setResource`. The header of this request is:

- `content-type`: application/json

The new resource is sent in the request body: 
```json
{
  "resource_set_id": "14585742",
  "resourceDescription":"Patient 3 cardiology info in cardiology department",
  "resourceType": ["Heart"],
  "content":{
      "diagnosis":"High blood pressure/Hypertension"
  }   
  
}
```
Each resource entry is a JSON object taking the following form:

- resource_set_id: String
- resourceDescription: String
- resourceType: An array of resource types
- content: The data in the form of an object
#### Response from the server
The server will respond the created resource data. 

## ESO Server 

### Installation 
Requirements: 
- [Installing node.js and npm] 
1. Installing packages at folder (MERN_OAuthExtension/ESO_server>)
```javascript
$ npm i express body-parser mongoose concurrently jsonwebtoken crypto-js
$ npm i -g npm
$ npm i --save lodash
$ npm i -D nodemon
```
2. Specify the port number (optional) 

```javascript
// Change the following line in MERN_OAuthExtension/ESO_server/server.js. The default port is 4995.
const port =process.env.PORT || <port>;
```
3. Run the server at folder (MERN_OAuthExtension/ESO_server>)
```javascript
npm run server 
```
```javascript
//If the server runs successfully, you should see the following messages.
Server started on port 4995
MongoDB Connected...
```
4. Store the credentials (private key of the server, public keys of registered resource servers, public key of the AS) in `MERN_OAuthExtension/ESO_server/configure/default.json`.



### API Reference
- `/api/userathopital`: Resource server sends a get request to this API to query if the client is located at the hospital.  If the tokens within this request is valid, the ESO server responds true.


In the following sections, we will give some necesarry explanation for the back-end server implementation, followed by examples of API usage.  If you want to start testing the APIs right away, please go to  examples of API usage. 

### Overview
The ESO server is implemented as a node.js server, listened on port 4995 in the local computer. We do not implement any underlying protocols for tracking environment context as it is out of the scope of our protocol. After successful validation of the ESO token and the RS signature, the ESO server sends a response {“Contex” : “True”} or {“Contex” : “False”} to the RS. 

### Example of /api/userathospital
#### Sending the request 
Resource server sends post request to `https://localhost:4995/api/userathospital`. The header of this request is:

- `Content-Type`: application/json
- `x-eso-token`: 
```
eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHBpcmVJbiI6IjEgZGF5Iiwic3ViamVjdCI6IjEwMDAiLCJhdWRpZW5jZSI6Imh0dHBzOi8vbG9jYWxob3N0OjQ5OTAvZ2V0UmVzb3VyY2UiLCJpc3N1ZXIiOiJodHRwczovL2xvY2FsaG9zdDo1MDAwL2F1dGhvcml6YXRpb24iLCJvYmplY3RBdHRyaWJ1dGVzIjp7InJlc291cmNlVHlwZSI6WyJIZWFydCJdfSwiYWN0aW9uQXR0cmlidXRlcyI6eyJhY3Rpb25zIjpbInZpZXciXX0sImVudmlyb25tZW50Q29udGV4dCI6WyJjbGllbnRsb2NhdGlvbmhvc3BpdGFsIl0sImlhdCI6MTU3MDk5MzI1NH0.FA3CDKBQSGcZ6pHNT0T3E4g_UPedYf7GQ_0i_peUEyyhwWJVEQk7JTgsh_baklHQUAK3_UolykHKeJUHcGho2A
```
- `RS-sign`:
 ```
eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHBpcmVJbiI6IjEgZGF5IiwiaGFzaEFUIjp7IndvcmRzIjpbNjk4NTcxODcyLC0xNzM2NTcxNzYyLC0yMTA0MzU0MTA2LDE5NzMxOTk2MjYsMTczNDMxNTczOSwtNzk5MDM2OTIsLTY1NjAzNTA0NywtMTEyMDY1MDM4MF0sInNpZ0J5dGVzIjozMn0sInN1YmplY3QiOiJodHRwczovL2xvY2FsaG9zdDo0OTkwL2dldFJlc291cmNlIiwiYXVkaWVuY2UiOiJodHRwczovL2xvY2FsaG9zdDo0OTk1L3VzZXJhdGhvc3BpdGFsIiwiaXNzdWVyIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMC9hdXRob3JpemF0aW9uIiwiYWN0aW9uIjpbInJlYWQiXSwiZW52aXJvbm1lbnRDb250ZXh0IjpbImNsaWVudGxvY2F0aW9uaG9zcGl0YWwiXSwiaWF0IjoxNTcwOTkzMjU0fQ.Rylr1No1AUSpVzc9Mrv258olyxp4zQwf5AHL8DxAhwkviNIS9Rk3m0HRBlqx9EGC7PBrYXBCsXEjgq8XWuLpXg
```


To issue the https request to the authorization server, we recommend using [Postman] tool. 
For the purpose of testing, we use [self-generated certificates] to establish TLS connection between the client and the server. 

#### Response from the server

Server returns { result:"True" }



<!---### Example of Accessing Patient Data
The RO or admistrator stores the patient data as well as the attributes in RS.  If a client possesses a valid token and required environment conditions are satisfied, RS will release all  the patient records with an attribute of "ResourceType="Heart"".
-->


[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)


   [dill]: <https://github.com/joemccann/dillinger>
   [git-repo-url]: <https://github.com/joemccann/dillinger.git>
   [john gruber]: <http://daringfireball.net>
   [df1]: <http://daringfireball.net/projects/markdown/>
   [markdown-it]: <https://github.com/markdown-it/markdown-it>
   [Ace Editor]: <http://ace.ajax.org>
   [node.js]: <http://nodejs.org>
   [Twitter Bootstrap]: <http://twitter.github.com/bootstrap/>
   [jQuery]: <http://jquery.com>
   [@tjholowaychuk]: <http://twitter.com/tjholowaychuk>
   [express]: <http://expressjs.com>
   [AngularJS]: <http://angularjs.org>
   [Gulp]: <http://gulpjs.com>
   [React]:<https://reactjs.org/>
   [Redux]:<https://redux.js.org/>
   [Reactstrap]: <https://reactstrap.github.io/>
   [MongoDB]: <https://www.mongodb.com/cloud/atlas>
   [here]:<https://github.com/gloryer/MERN_OAuthExtension>
   [PlDb]: <https://github.com/joemccann/dillinger/tree/master/plugins/dropbox/README.md>
   [PlGh]: <https://github.com/joemccann/dillinger/tree/master/plugins/github/README.md>
   [PlGd]: <https://github.com/joemccann/dillinger/tree/master/plugins/googledrive/README.md>
   [PlOd]: <https://github.com/joemccann/dillinger/tree/master/plugins/onedrive/README.md>
   [PlMe]: <https://github.com/joemccann/dillinger/tree/master/plugins/medium/README.md>
   [PlGa]: <https://github.com/RahulHP/dillinger/blob/master/plugins/googleanalytics/README.md>
   [Postman]: <https://www.getpostman.com/>
   [Installing node.js and npm]: <https://treehouse.github.io/installation-guides/windows/node-windows.html>
   [JWT]: <https://tools.ietf.org/html/rfc7519](https://tools.ietf.org/html/rfc7519>
   [self-generated certificates]: <https://flaviocopes.com/express-https-self-signed-certificate/>
   
 