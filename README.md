# Implementation Guide


The proposed context-aware OAuth protocol has been implemented and can be found [here]. This guide walks through the overall concepts and some implementation details of the following entities: 

  - Athorization Server
  - Resource Server
  - Environmental situation oracles (ESO)
  
Note that we use http as communication protocol in the implementation. 


## Tech

The implementation uses a number of open source projects/libraries to work properly:

* [MongoDB] - Cloud-based database. 
* [node.js] - evented I/O for the backend.
* [Express] - fast node.js network app framework [@tjholowaychuk].
* [Postman] - A tool for testing server APIs. 



## Authorization Server 
The authorization server is implemented as a node.js server, listened on port 5000 in the local computer. The AS provides the authorization and token generation service. We implement ABAC model for authorization and JSON web token for access token and ESO token.  The implemented AS includes four endpoints, policy decision point (PDP),  policy administration point (PAP), policy information point (PIP) to control access. Once request is permitted, AS will invoke the token generation service to generate access token and eso token if necessary. 

  - `policy decision point (PDP)`:  Grant or deny the request based on attributes possessed by the requester. 
  - `policy administration point (PAP)`: Interface for creating, managing and storing the policies. 
  - `policy information point (PIP)`: Provides the attribute data required for policy evaluation. 
  - `token service`: Create jwt tokens which contains sufficient information of the authorization. 
  - `ESO configuration`: The ESO registers its  description (which context it tracks) and URL to AS. AS maintains these information in the JSON file. To acquire the URL information of an eso server, AS simply looks up the context description and uses the matched URL for eso token. 
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

AS will first validate all fields in the client request. The client is authenticated by creating jwt using client credentials. Then, the AS decodes the jwt token from the client, get the client_id and look up the associated subject attributed with the client_id. With the found subject attributes, AS evaluates it with all the available policies one by one. More specifically, AS checks 1) if the requested `objectAttributes` are allowed by the policy 2) if the requested `structured_scope` are allowed by the policy (`actionAttributes`) 3) if the subject has all the attributes required in policy `subjectAttributes`.  Authorization service adopts `permit-override` strategy. If there exists at least one permit, AS will grant the access and generate an access token. 

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
If context verification is required, an eso token is returned to client together with the access token. The two token is cryptographically bound. The access token and the eso token are not encrypted, but signed by the AS.  RS can find the URL of the ESO by decoding the eso token. The `audience` value is the URL of the eso server. An example of the eso token is shown below (after decoding) :
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

## Resource Server 
The resource server is implemented as a node.js server, listened on port 4990 in the local computer. Object attributes are typically bound to their objects through referencing, by embedding them within the object. The resources are stored in RS together with their attributes. Policy enforcement point is implemented in RS. Upon receiving the tokens from the client, the RS verifies the signatures of  each token, contents of each token and checks if two token are bound. If context validation are required, RS sends an http post request to fetch the internal state of the ESO.  Once all these steps are successful, the RS may query the database and return the appropriate records to the client, or provides services to the client.  The services and the resources can be provided by RS vary from application to applicaton.  So we wrap all the token valiadations duties and context checking into a `middleware`. Programmers can easily invoke this independent module when writing any customized API for the RS. 

### Example of Accessing Patient Data
The RO or admistrator stores the patient data as well as the attributes in RS.  If a client possesses a valid token and required environment conditions are satisfied, RS will release all  the patient records with an attribute of "ResourceType="Heart"". 


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
 