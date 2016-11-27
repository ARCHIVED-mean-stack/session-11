#MEAN Session Twelve

`$ npm install --save express`

Create server.js for express:

```
var express = require('express');
var app = express();

app.get('/', function(req, res) {
  res.send('Ahoy\n');
});

app.listen(3001);
console.log('Server running at http://localhost:3001/');
```

###Rest API
* A URL route schema to map requests to app actions
* With a Controller to handle each action
* Data to respond with
* Place to store the data
* An interface to access and change data

###Routes

Predefined URL paths your API responds to. Think of each Route as listening to three parts:

* A specific HTTP Action
* A specific URL path
* A handler method

###GET

This example of routing handles all GET Requests. The URL path is the root of the site, the handling method is an anonymous function, and the response plain text:

Sample: 

```js
app.get('/', function(req, res) {
    res.send('Return JSON or HTML View');
});
```
A peak inside the response:

```js
app.get('/', function (req, res) {
    res.send('Ahoy there\n');
    console.dir(res);
});
```

Note that the server needs to be restarted in order for us to see the results. 

Install nodemon:

`sudo npm install -g nodemon`

`sudo npm install --save-dev nodemon`

Run the app using `nodemon server.js` and make a change to res.send in server.js. Note the app restarts. Refresh the browser and note the res (response) object being dumped into the console.

You wil need to keep an eye on the nodemon process during this exercise to see if it is hanging.

###GET Requests

```
app.get('/pirate/:name', function(req, res) {
   console.log(req.params.name)
});
```

And run `http://localhost:3001/pirate/barney` noting the console's output.

Edit:

```
app.get('/pirate/:name', function(req, res) {
   res.send('{"id": 1,"name":"Matt", "vessel":"HMS Brawler"}');
});
```

You can see the json in the view.

###Routes

Add routes.js to /app:

```js
module.exports = function (app) {
    var pirates = require('./controllers/pirates');
    app.get('/api/pirates', pirates.findAll);
    app.get('/api/pirates/:id', pirates.findById);
    app.post('/api/pirates', pirates.add);
    app.put('/api/pirates/:id', pirates.update);
    app.delete('/api/pirates/:id', pirates.delete);
}
```

Note: `module.exports` is the object that's returned as the result of a require call.

All the main elements of a [REST application](http://www.restapitutorial.com/lessons/httpmethods.html) - GET, POST, PUT, DELETE - http actions are accounted for here. We've modeled our URL routes off of REST API conventions, and named our handling methods clearly - prefixing them with `api/` in order to differentiate them from other routes we may create within Angular.

Note the require statement. We'll create a pirates controller and placed all our Request event handling methods inside the it. 

###Controllers

Create a folder called controllers at the top level. 

Create a new file inside of that called pirates.js. We'll add each request handling method for pirates data to this file one by one. For now add these placeholders to pirates.js so we can restart the server without errors:

```js
exports.findAll = function () { };
exports.findById = function () { };
exports.add = function () { };
exports.update = function () { };
exports.delete = function () { };
```

Update findAll's definition in the controllers:

```js
exports.findAll = function(req, res){
	res.send([{
		"id": 1,
		"name": "Max",
		"vessel": "HMS Booty",
		"weapon": "sword"
	}]);
};
```

Update server.js to require our routes file. The .js file extension can be omitted.

```js
var express = require('express');
...
require('./routes')(app);

app.listen...
```

Navigate to `localhost:3001/api/pirates`


###Mongo

[Download and install](https://www.mongodb.com/download-center) Mongodb. 

For [MacOS](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/)

Create a `/data/db/` directory and run `mongod` (in another Terminal tab) if it's not running already. 

If you need help setting the permissions on the db folder [see this post](http://stackoverflow.com/questions/28987347/setting-read-write-permissions-on-mongodb-folder).

###Mongoose.js

A [Mongo Driver](http://mongoosejs.com) to model your application data.

Use NPM to install this dependency and update your package.json file.

`npm install mongoose --save-dev`

[Quickstart guide](http://mongoosejs.com/docs/) for Mongoose.

###Body Parser

[Body Parser](https://www.npmjs.com/package/body-parser) parses and places incoming requests in a `req.body` property so our handlers can use them.

`npm install body-parser --save-dev`


###Update server.js:

```js
var express = require('express');
var mongoose = require('mongoose');
// var fs = require('fs');
var app = express();
var bodyParser = require('body-parser')
var mongoUri = 'mongodb://localhost/rest-api';
var db = mongoose.connection;

mongoose.connect(mongoUri);

db.on('error', function () {
    throw new Error('unable to connect to database at ' + mongoUri);
});

app.use(bodyParser.json())

//require('./models/pirate');
require('./routes')(app);

app.listen(3001);
console.log('Listening on port 3001...');
```

- We're requiring the Mongoose module which will communicate with Mongo for us. 

- The mongoUri is a location to the Mongo DB that Mongoose will create if there is not one there already. 

- We added an error handler there to help debug issues connecting to Mongo collections. 

- We configured Express to parse requests' bodies (we'll use that for POST requests).

- Lastly, we require the pirate model which we'll make next.


###Define Data Models

Create a new folder called models and add a new file pirate.js for our Pirate Model.

Require Mongoose into this file, and create a new Schema object:

```js
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PirateSchema = new Schema({
    name: String,
    vessel: String,
    weapon: String
});

mongoose.model('Pirate', PirateSchema);
```

This schema makes sure we're getting and setting well-formed data to and from the Mongo collection. Our schema has three String properties which define a Pirate object. 
 
The last line creates the Pirate model object, with built in Mongo interfacing methods. We'll refer to this Pirate object in other files.
 
Ensure that `require('./models/pirate');` is in server.js

Update controllers/pirates.js to require Mongoose, so we can create an instance of our Pirate model to work with. 

And update findAll() to query Mongo with the find() data model method.

```js
var mongoose = require('mongoose'),
    Pirate = mongoose.model('Pirate');

exports.findAll = function (req, res) {
    Pirate.find({}, function (err, results) {
        return res.send(results);
    });
};
exports.findById = function () { };
exports.add = function () { };
exports.update = function () { };
exports.delete = function () { };
```

Passing find() {} means we are not filtering data by any of its properties and so to return all of it. 

Once Mongoose looks up the data it returns an error message and a result set. Use res.send() to return the raw results.

###Start Mongoose

Restart the server and visit the API endpoint for all pirates `localhost:3001/api/pirates`. You'll get JSON data back, in the form of an empty array.

###Data

Rather than use the Mongo command-line, let's import pirate data with our REST API. Add a new route endpoint to routes.js.

```js
app.get('/api/import', pirates.import);
```

Now define the import method in our Pirates Controller `controllers/pirates.js`:

```js
exports.import = function (req, res) {
    Pirate.create(
        { "name": "William Kidd", "vessel": "Adventure Galley", "weapon": "Sword" },
        { "name": "Samuel Bellamy", "vessel": "Whydah", "weapon": "Cannon" },
        { "name": "Mary Read", "vessel": "Rackham", "weapon": "Knife" },
        { "name": "John Rackham", "vessel": "The Calico", "weapon": "Peg Leg" }
        , function (err) {
            if (err) return console.log(err);
            return res.send(202);
        });
};
```

This import method adds four documents from the JSON to a pirates collection. The Pirate model is referenced here to call its create method. create() takes one or more documents in JSON form, and a callback to run on completion. If an error occurs, Terminal will return the error and the request will timeout in the browser. On success, the 202 "Accepted" HTTP status code is returned to the browser. Restart your node server and visit this new endpoint to import data.

`localhost:3001/api/import/`

###Returning Data

Now visit your `/api/pirates` endpoint to view the new pirates data. You'll see an array of JSON objects, each in the defined schema, with an additional generated unique private _id and internal __v version key. 

####Find By id

Recall our route for getting a pirate by its id app.get('/pirates/:id', pirates.findById). 

Add the handler method:

```js
exports.findById = function (req, res) {
    var id = req.params.id;
    Pirate.findOne({ '_id': id }, function (err, result) {
        return res.send(result);
    });
};
```

This route's path uses a parameter pattern for id /pirates/:id which we can refer to in `req`. Pass this id to Mongoose to look up and return just one document. Restart the server.

At your find all endpoint, copy one of the ids, paste it in at the end of the current url in the browser and refresh. You'll get a single JSON object for that one pirate's document.

e.g. `http://localhost:3001/api/pirates/581ca420f13de28c1776bbec`

####Update

PUT HTTP actions in a REST API correlate to an Update method. The route for Update also uses an :id parameter.

```js
exports.update = function (req, res) {
    var id = req.params.id;
    var updates = req.body;

    Pirate.update({ "_id": id }, req.body,
        function (err, numberAffected) {
            if (err) return console.log(err);
            console.log('Updated %d pirates', numberAffected);
            return res.sendStatus(202);
        });
};
```

Notice the updates variable storing the req.body. req.body is useful when you want to pass in larger chunks of data such as a single JSON object. Here we will pass in a JSON object (following the schema) of only the model's properties you want to change.

The model's update() takes three parameters:

* JSON object of matching properties to look up the doc with to update
* JSON object of just the properties to update
* callback function that returns the number of documents updated

###Curl

PUT actions are not easy to test in the browser, so we use cURL in Terminal after restarting the server.

We will need to construct this line using ids from the pirates listing and test it in a new Terminal tab. Edit the URL to reflect both the port and id of the target pirate:

```
$ curl -i -X PUT -H 'Content-Type: application/json' -d '{"vessel": "HMS Brawler"}' http://localhost:3001/api/pirates/581ca420f13de28c1776bbec
```

This sends a JSON Content-Type PUT request to our update endpoint. That JSON object is the request body, and the long hash at the end of the URL is the id of the pirate we want to update. Terminal will output a JSON object of the response to the cURL request and Updated 1 pirates from our callback function.

Visit this same URL from the cURL request in the browser to see the changes.

###Postman

Since modelling endpoints is a common task and is rendered more difficult than it needs to be by the opaqueness of the PUT http verb most people use a utility such as [Postman](https://www.getpostman.com/). 

Use the Chrome app to run through the process of editing a pirate above.

Remember to set the body to `raw` and the `text` header to application/json

![Image of chart](https://github.com/mean-fall-2016/session-8/blob/master/assets/img/postman.png)

####Add

We used create() earlier to add multiple documents to our Pirates Mongo collection. Our POST handler uses the same method to add one new Pirate to the collection. Once added, the response is the full new Pirate's JSON object.

```js
exports.add = function (req, res) {
    Pirate.create(req.body, function (err, pirate) {
        if (err) return console.log(err);
        return res.send(pirate);
    });
}
```

Restart the server. Use cURL to POST to the add endpoint with the full Pirate JSON as the request body (making sure to check the URL port and path).

```
$ curl -i -X POST -H 'Content-Type: application/json' -d '{"name": "Jean Lafitte", "vessel": "Barataria Bay", "weapon":"curses"}' http://localhost:3001/api/pirates
```

We will also create a new Pirate in Postman.

![Image of chart](https://github.com/mean-fall-2016/session-8/blob/master/assets/img/postman2.png)

Refresh `http://localhost:3001/pirates` to see the new entry at the end.


####Delete

Our final REST endpoint, delete, reuses what we've done above. Add this to controllers/pirates.js.

```js
exports.delete = function (req, res) {
    var id = req.params.id;
    Pirate.remove({ '_id': id }, function (result) {
        return res.send(result);
    });
};
```

Restart, and check it out with:

```
$ curl -i -X DELETE http://localhost:3001/pirates/5820d3584dc4674967d091e6
```

Create and test a delete Pirate action in Postman.

##Building a Front End for Our API

Add a layouts directory and into it `index.html`:

```html
<!DOCTYPE html>
<html>

<head>
	<title>AngularJS Pirates</title>
	<script src="https://code.angularjs.org/1.5.8/angular.js"></script>
	<script src="https://code.angularjs.org/1.5.8/angular-route.js"></script>
	<script src="https://code.angularjs.org/1.5.8/angular-animate.js"></script>
	<script src="js/app.js"></script>
</head>

<body>
	<h1>test</h1>
</body>
</html>
```

Note - this page is unavaiable (even if it is in the root directory).

Add this route to server.js:

```js
app.get('/', function(req, res) {
    res.sendfile('./layouts/index.html')
})
```

Note - `express deprecated res.sendfile: Use res.sendFile instead`

```
var path = require('path');

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/layouts/index.html'));
});
```

Create css, js, and img folders in static or reuse the assets material.

Populate the js folder with app.js:

```js
angular.module('pirateApp', []);
```

Now we can access the page at localhost://300X however the we need to configure a static assets directory.

Add a static directory for our assets to server.js

`app.use(express.static('static'))`

Add a ngApp:

```html
<!DOCTYPE html>
<html ng-app='pirateApp'>

<head>
	<title>AngularJS Pirates</title>
	<link rel="stylesheet" href="css/styles.css">
	<script src="https://code.angularjs.org/1.5.8/angular.js"></script>
	<script src="https://code.angularjs.org/1.5.8/angular-route.js"></script>
	<script src="https://code.angularjs.org/1.5.8/angular-animate.js"></script>
	<script src="js/app.js"></script>
</head>

<body>
	<h1>test</h1>
</body>
</html>
```

Let's run a simple test by pulling in data from another API.

```
angular.module('pirateApp', []).controller('Hello', function ($scope, $http) {
    $http.get('http://rest-service.guides.spring.io/greeting').
        then(function (response) {
            $scope.greeting = response.data;
        });
});
```

Add to index.html:

```html
<body ng-controller="Hello">
    <h1>Testing</h1>
    <p>The ID is {{greeting.id}}</p>
    <p>The content is {{greeting.content}}</p>
</body>
```

Now let's use our own:

```js
angular.module('pirateApp', [])
    .controller('PirateAppController', function ($scope, $http) {
        $http.get('/api/pirates').
            then(function (response) {
                $scope.pirates = response.data;
                console.log($scope.pirates);
            });
    });
```


```html
<body ng-controller="PirateAppController">
	<h1>Pirates</h1>
	<ul>
		<li ng-repeat="pirate in pirates">
			{{ pirate.name }}
			<span>X</span>
		</li>
	</ul>
</body>
```

###Deleting a Pirate

As a starting point reuse the array script. Recall the script from a previous lesson:

```
$scope.deletePirate = function(index) {
	$scope.pirates.splice(index, 1);
}
```

Wire up the deletePirate function:

```
<ul>
	<li ng-repeat="pirate in pirates">
		{{ pirate.name }} | {{ pirate._id }}
		<span ng-click="deletePirate(pirate._id)">X</span>
	</li>
</ul>
```

```
$scope.deletePirate = function(pid) {
	$http.delete('/api/pirates/' + pid);
}
```

But this has no effect on $scope

```
$scope.deletePirate = function (index, pid) {
    console.log(pid);
    $http.delete('/api/pirates/' + pid)
    .success(function(){
        $scope.pirates.splice(index, 1);
    })
}
```

```
<ul>
	<li ng-repeat="pirate in pirates">
		{{ pirate.name }} {{ pirate._id }}
		<span ng-click="deletePirate($index, pirate._id)">X</span>
	</li>
</ul>
```


##Homework
- create a form for adding a pirate and create a controller that works to create a new pirate
- send me a link to the github repo


##Reading

Dickey - Write Modern Web Apps with the MEAN Stack: Mongo, Express, AngularJS and Node.js, chapter 6. Please attempt to implement his sample app on your computer. Here's his [Github repo with sample code](https://github.com/dickeyxxx/mean-sample). Be sure to look at the branches (they correspond to chapter numbers) and don't forget to run `sudo npm install` when running the sample code.


##Notes

https://www.mongodb.com/blog/post/building-your-first-application-mongodb-creating-rest-api-using-mean-stack-part-1





##Homework

1. Complete the json file for lasagne adding additional ingredients and directions. You can use [this recipe](http://allrecipes.com/recipe/23600/worlds-best-lasagna/) as an example.

2. Create a wide screen view for the recipe by extending the recipe sass file and the template. 




##Notes
```
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var mongoUri = 'mongodb://localhost/rest-apis';
var db = mongoose.connection;
mongoose.connect(mongoUri);

// this line needs to occur prior to the require lines
app.use(bodyParser.json());

db.on('error', function () {
    throw new Error('unable to connect at' + mongoUri);
})

require('./models/pirate');
require('./routes')(app);

app.listen(3004);
console.log('port 3004');
```

---