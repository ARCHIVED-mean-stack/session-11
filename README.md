#MEAN Session Twelve

In this class we pick up our Recipes page and add an api to the already built front end.

`$ npm install --save express`

Create server.js for express:

```
var express = require('express');
var app = express();

app.get('/', function(req, res) {
  res.send('testing\n');
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
    res.send('testing 123\n');
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
app.get('/recipe/:name', function(req, res) {
   console.log(req.params.name)
});
```

And run `http://localhost:3001/recipe/lasagne` noting the terminal console's output.

Edit:

```
app.get('/api', function (req, res) {
    res.json({ message: 'hello api' });
});
```

You can see the json in the view.

###Mongoose.js

A [Mongo Driver](http://mongoosejs.com) to model your application data.

Use NPM to install this dependency and update your package.json file.

`npm install mongoose --save`

[Quickstart guide](http://mongoosejs.com/docs/) for Mongoose.

###Body Parser

[Body Parser](https://www.npmjs.com/package/body-parser) parses and places incoming requests in a `req.body` property so our handlers can use them.

`npm install body-parser --save`


###Update server.js:

```js
// server.js

// BASE SETUP
// =============================================================================

// call the packages we need

var express = require('express');
var mongoose = require('mongoose');
var app = express();
var bodyParser = require('body-parser');
var mongoUri = 'mongodb://localhost/recipe-api';
var db = mongoose.connection;
mongoose.connect(mongoUri);

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
```

Test using GET in postman

- We're requiring the Mongoose module which will communicate with Mongo for us. 

- The mongoUri is a location to the Mongo DB that Mongoose will create if there is not one there already. 

- We configured Express to parse requests' bodies.


###Define Data Models

Create a new folder called models and add a new file recipe.js for our Recipe Model.

Require Mongoose into this file, and create a new Schema object:

```js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RecipeSchema = new Schema({
    name: String
});

module.exports = mongoose.model('Recipe', RecipeSchema);
```

This schema makes sure we're getting and setting well-formed data to and from the Mongo collection. 
 
The last line creates the Recipe model object, with built in Mongo interfacing methods. We'll refer to this Recipe object in other files.
 
Ensure that `var Recipe = require('./app/models/recipe');` is in server.js

```
// server.js

// BASE SETUP
// =============================================================================

...

var Recipe = require('./app/models/recipe');;

...
```

```js
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});
```

```js
// server.js

// BASE SETUP
// =============================================================================

// call the packages we need

var express = require('express');
var mongoose = require('mongoose');
var app = express();
var bodyParser = require('body-parser');
var mongoUri = 'mongodb://localhost/recipe-api';
var db = mongoose.connection;
mongoose.connect(mongoUri);

var Recipe = require('./app/models/recipe');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function (req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
```

##Creating a Recipe

```js
// more routes for our API will happen here

// on routes that end in /recipes
// ----------------------------------------------------
router.route('/recipes')

    // create a recipe (accessed at POST http://localhost:8080/api/recipes)
    .post(function (req, res) {
        
        var recipe = new Recipe();      // create a new instance of the Recipe model
        recipe.name = req.body.name;  // set the recipes name (comes from the request)

        // save the recipe and check for errors
        recipe.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Recipe created!' });
        });
        
    });
```


```
// server.js

// BASE SETUP
// =============================================================================

// call the packages we need

var express = require('express');
var mongoose = require('mongoose');
var app = express();
var bodyParser = require('body-parser');
var mongoUri = 'mongodb://localhost/recipe-api';
var db = mongoose.connection;
mongoose.connect(mongoUri);

var Recipe = require('./app/models/recipe');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function (req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

// more routes for our API will happen here

// on routes that end in /recipes
// ----------------------------------------------------
router.route('/recipes')

    // create a recipe (accessed at POST http://localhost:8080/api/recipes)
    .post(function (req, res) {

        var recipe = new Recipe();      // create a new instance of the Recipe model
        recipe.name = req.body.name;  // set the recipes name (comes from the request)

        // save the recipe and check for errors
        recipe.save(function (err) {
            if (err)
                res.send(err);

            res.json({ message: 'Recipe created!' });
        });

    });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
```

##Getting All Recipes

```
// get all the recipes (accessed at GET http://localhost:8080/api/recipes)
    .get(function(req, res) {
        Recipe.find(function(err, recipes) {
            if (err)
                res.send(err);

            res.json(recipes);
        });
    });
```

e.g.

```js
// on routes that end in /recipes
// ----------------------------------------------------
router.route('/recipes')

    // create a recipe (accessed at POST http://localhost:8080/api/recipes)
    .post(function (req, res) {

        var recipe = new Recipe();      // create a new instance of the Recipe model
        recipe.name = req.body.name;  // set the recipes name (comes from the request)

        // save the recipe and check for errors
        recipe.save(function (err) {
            if (err)
                res.send(err);

            res.json({ message: 'Recipe created!' });
        });

    })

    // get all the recipes (accessed at GET http://localhost:8080/api/recipes)
    .get(function (req, res) {
        Recipe.find(function (err, recipes) {
            if (err)
                res.send(err);

            res.json(recipes);
        });
    });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);
```

Test getting and creating

##Routes for Single Recipes (id)


We’ve handled the group for routes ending in /recipes. Let’s now handle the routes for when we pass in a parameter like a recipe's id.

The things we’ll want to do for this route, which will end in /recipes/:recipe_id will be:

- Get a single recipe.
- Update a recipe's info.
- Delete a recipe.

Add another router.route() to handle all requests that have a :recipe_id attached to them.

```
// on routes that end in /recipes
// ----------------------------------------------------
router.route('/recipes')
    ...

// on routes that end in /recipe/:recipe_id
// ----------------------------------------------------
router.route('/recipes/:recipe_id')

    // get the recipe with that id (accessed at GET http://localhost:8080/api/recipes/:recipe_id)
    .get(function (req, res) {
        Recipe.findById(req.params.recipe_id, function (err, recipe) {
            if (err)
                res.send(err);
            res.json(recipe);
        });
    });

// REGISTER OUR ROUTES -------------------------------
```

Add `app.use(express.static('app'))`

final
```
// server.js

// BASE SETUP
// =============================================================================

// call the packages we need

var express = require('express');
var mongoose = require('mongoose');
var app = express();
var bodyParser = require('body-parser');
var mongoUri = 'mongodb://localhost/recipe-api';
var db = mongoose.connection;
mongoose.connect(mongoUri);

var Recipe = require('./app/models/recipe');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('app'))

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function (req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

// more routes for our API will happen here

// on routes that end in /recipes
// ----------------------------------------------------
router.route('/recipes')

    // create a recipe (accessed at POST http://localhost:8080/api/recipes)
    .post(function (req, res) {

        var recipe = new Recipe();      // create a new instance of the Recipe model
        recipe.name = req.body.name;  // set the recipes name (comes from the request)

        // save the recipe and check for errors
        recipe.save(function (err) {
            if (err)
                res.send(err);

            res.json({ message: 'Recipe created!' });
        });

    })

    // get all the recipes (accessed at GET http://localhost:8080/api/recipes)
    .get(function (req, res) {
        Recipe.find(function (err, recipes) {
            if (err)
                res.send(err);
            res.json(recipes);
        });
    });

// on routes that end in /recipe/:recipe_id
// ----------------------------------------------------
router.route('/recipes/:recipe_id')

    // get the recipe with that id (accessed at GET http://localhost:8080/api/recipes/:recipe_id)
    .get(function (req, res) {
        Recipe.findById(req.params.recipe_id, function (err, recipe) {
            if (err)
                res.send(err);
            res.json(recipe);
        });
    });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
```

Adding / removing one recipe into our database:

https://docs.mongodb.com/v3.2/tutorial/insert-documents/

https://docs.mongodb.com/v3.2/tutorial/remove-documents/

```
$ mongo
> show dbs
> use recipe-api
> show collections
> db.recipes.insert()
> db.recipes.find()
> db.recipes.deleteOne( { name : "recipe1404" } )
```

Add a recipe using postman. Note that only the name is inserted.

Use the mongoose create function:

```
    // create a recipe (accessed at POST http://localhost:8080/api/recipes)
    .post(function (req, res) {

        var recipe = new Recipe(req);      // create a new instance of the Recipe model
        // recipe.name = req.body.name;  // set the recipes name (comes from the request)
        // recipe.title = req.body.title;

        // save the recipe and check for errors
        Recipe.create(req.body, function (err) {
            if (err)
                res.send(err);

            res.json({ message: 'Recipe created!' });
        });

    })
```

Adding many recipes:

```
$ mongo
> db.users.insertMany()
```

Change the $http call to get info from the db:

```
angular.module('recipeApp').component('recipeList', {
    templateUrl: 'recipe-list/recipe-list.template.html',
    controller: function RecipeListController($http) {
        var self = this;
        self.orderProp = 'date';

        $http.get('api/recipes').then(
            function (response) {
                self.recipes = response.data;
            }
        );
    }
});
```

date

```
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RecipeSchema = new Schema({
    name: String,
    title: String,
    date: { type: Date, default: Date.now },
    description: String,
    image: String
});

module.exports = mongoose.model('Recipe', RecipeSchema);
```

Test in postman with no date being passed.

##Detail View

Change the url for recipe to use _id:

```
<ul class="recipes-list">
	<li ng-repeat="recipe in $ctrl.recipes | filter:$ctrl.query | orderBy:$ctrl.orderProp">
		<img ng-src="img/home/{{ recipe.image }}">
		<h1><a href="#!recipes/{{ recipe._id }} ">{{ recipe.title }}</a></h1>
		<p>{{ recipe.description }}</p>
	</li>
</ul>
```

Ammend the $http call:

```
angular.module('recipeDetail').component('recipeDetail', {
    templateUrl: 'recipe-detail/recipe-detail.template.html',
    controller: ['$http', '$routeParams',
        function RecipeDetailController($http, $routeParams) {
            var self = this;

            self.setImage = function setImage(imageUrl) {
                self.mainImageUrl = imageUrl;
            };
            console.log($routeParams)
            $http.get('/api/recipes/' + $routeParams.recipeId).then(function (response) {
                self.recipe = response.data;
                self.setImage(self.recipe.images[0]);
            });
        }
    ]
});
```

Review the json and add using postman

```
{
  "name": "recipe1309", 
  "title": "Lasagna", 
  "date": "2013-09-01", 
  "description": "Lasagna noodles piled high and layered full of three kinds of cheese to go along with the perfect blend of meaty and zesty, tomato pasta sauce all loaded with herbs.", 
  "mainImageUrl": "img/home/lasagna-1.png",
  "images": ["lasagna-1.png","lasagna-2.png","lasagna-3.png","lasagna-4.png"],
  "ingredients": ["lasagna pasta", "tomatoes", "onions", "ground beef", "garlic", "cheese"]
}
```

Items not specified in our model are not added.

Ammend the schema:

```
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RecipeSchema = new Schema({
    name: String,
    title: String,
    date: { type: Date, default: Date.now },
    description: String,
    image: String,
    images: [],
    ingredients: {}
});

module.exports = mongoose.model('Recipe', RecipeSchema);
```


##Notes


