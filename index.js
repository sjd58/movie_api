/**
 * @fileoverview For this project, the index.js file creates the Express application, sets up the server, and implements routes to the API
 * endpoints so users can access, update, and delete data in the myFlix application. Requests use models in models.js and are authenticated 
 * with strategies in passport.js. Mongoose and the database connect with the connect method. The database is on MongoDB Atlas and the server
 * and endpoints are hosted on Heroku.
 * @requires mongoose This module connects the app to the database.
 * @requires './models.js' Here, schemas and models are defined.
 * @requires morgan The morgan module logs requests made to the database.
 * @requires passport This module creates strategies for authenticating and authorizing API requests to endpoints.
 * @requires './auth.js' Here, the user login route is implemented.
 */

const mongoose = require('mongoose');
const Models = require('./models.js');

//refers to the model names defined in models.js
const Movies = Models.Movie;
const Users = Models.User;

//mongoose.connect('mongodb://localhost:27017/myFlixdDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser')

//after importing express needs to be added to the app
const app = express();

//morgan to log all requests
app.use(morgan('common'));

//use bodyParser to read data out of the request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//import cors and allow ALL origins
const cors = require('cors');
app.use(cors());

//requires express validation to validate user input on the server side
const {check, validationResult } = require('express-validator');

//import auth.js
let auth = require('./auth')(app);

//import passport.js
const passport = require('passport');
require('./passport');

//error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

/**
 * API endpoints are below
 */

/**
 * Using express, HTTP requests have three parameters: (1) specifies the endpoint (2) sets conditions to be checked
 * (3) another callback function which takes request (req) and response (res) objects as parameters to access data 
 * that's related to the request. All the endpoints here, except for the endpoint that registers new users, will
 * therefore have features like the following:
 * @param {string} URL - The endpoint that the HTTP method is directed towards.
 * @method - the HTTP method used
 * @callback authCallback
 * @param {string} strategy - the name of the passport strategy used.
 * @callback reqResCallback
 * @param {Object} req - The request object.
 * @param {Object} res = The response object.
 */

/**
 * POST request to create a new user a new user
 * @method POST
 * @param {string} URL - here, it's '/users'
 * @param {array} [] This array must contain the following information: username, password, email, and birthday.
 * The data in these fields must meet certain specifications.
 * @returns {Object} An object with the new user's data. 
 */
app.post('/users', [
  //checks that the fields contain something, then checks that the data follows the correct format
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric character - not allowed').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail(),
  check('Birthday', 'Birthday is required').isDate()

], (req, res) => {

  //checks the validation object for errors
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{
              res.status(201).json(user)
            })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

/**
 * A PUT request to update the user's data. Requires the same fields as the method to create a user profile.
 * @method PUT
 * @param {string} URL - here, it's '/users/:Username'
 * @param {Object} - It must contain a username, password, email, and birthday.
 * @returns {Object} - An object with the updated user's data.
 */
app.put('/users/:Username', passport.authenticate('jwt', { session: false }),[

  check('Username', 'Username is required').isLength({min:5}),
  check('Username', 'Username contains nonalphanumeric character - not allowed').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail(),
  check('Birthday', 'Birthday is required').isDate()

  ], (req, res) => {
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: hashedPassword,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true },
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

/**
 * POST request to /users/:Username/movies/:MovieID endpoint that adds a favorite movie to the user's favorites. 
 * @method POST
 * @param {string} URL - here, it's '/users/:Username/movies/MovieID'
 * @returns {Object} Object with user information from MongoDB.
 */
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username}, { $push: { FavoriteMovies: req.params.MovieID }
  },
  { new: true },
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

/**
 * DELETE request to /users/:Username/movies/:MovieID to remove a favorite movie
 * @method DELETE
 * @param {string} URL - here, it's '/user/:Username/movies/:MovieID'
 * @returns {Object} An object with user information from MongoDB with the updated user favorites.
 */
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username },
        { $pull: { FavoriteMovies: req.params.MovieID }
    },
    { new: true },
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error ' + err);
        }
    });
});

/**
 * DELETE request to the /users/:Username endpoint used to remove a user from the database.
 * @method DELETE
 * @param {string} URL - here, it's /user/:Username
 * @returns {string} A message string: '[Username] was deleted.'
 */
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove( { Username: req.params.Username })
  .then((user) => {
    if (!user) {
      res.status(400).send(req.params.Username + ' was not found');
    } else {
      res.status(200).send(req.params.Username + ' was deleted.');
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

/**
 * GET request to return all users made to the endpoint /users/:Username endpoint.
 * Clearly it would be problematic for any user to be able to request all other users' info,
 * so this should be for testing purposes only.
 */
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error:' + err);
    });
});

/**
 * GET request to return information for a particular user
 * To the /users/:Username endpoint.
 * @method GET
 * @param {string} URL - here, it's '/users/:Username'
 * @returns {Object} This contains the user's information
 */
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * GET request to return all movie objects
 * @method GET
 * @param {string} URL - here, it's '/movies'
 * @returns {Array} An array of all the movies in the database.
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

/**
 * GET request to return data about a particular movie to the user
 * @method GET
 * @param {string} URL - here, it's '/movies/:MovieID'
 * @returns {Object} An object containing data about the particular movie.
 */
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            res.status(500).send('Error: ' + err);
        });
});

/**
 * GET request to return a description about a particular genre
 * @method GET
 * @param {string} URL - here, it's '/movies/genre/:genre'
 * @returns {Array} An array of objects that has the genre in the URL and its value.
 */
app.get('/genre/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.Name })
        .then((movie) => {
            res.json(movie.Genre.Description);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * GET request to return a description about a particular director
 * @method GET
 * @param {string} URL - here, it's '/movies/director/:name'
 * @returns {Object} An object containing data about the director.
 */
app.get('/director/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne ({ 'Director.Name': req.params.Name })
        .then((movie) => {
            res.json(movie.Director);
        })
        .catch((err) =>{
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * GET request to return a greeting to confirm to the tester that the server is working
 * @method GET
 * @param {string} URL - here, it's the server name followed by '/'
 * @returns {Object} A string to greet the tester and confirm the server is working.
 */
app.get('/', /*passport.authenticate('jwt', { session: false }),*/ (req, res) => {
  res.send('Welcome to my movie app!');
});

//express.static to serve static files in public folder
app.use(express.static('public'));

// listen for requests for testing purposes
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
  console.log('Listening on Port ' + port);
});
