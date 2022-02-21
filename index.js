//requires the Mongoose package and the Mongoose models created in models.js
const mongoose = require('mongoose');
const Models = require('./models.js');

//refers to the model names defined in models.js
const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myFlixdDB', { useNewUrlParser: true, useUnifiedTopology: true });

const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

//user and movie objects from 2.5
/*
let movies = [
  {
    "Title": "The Godfather",
    "Director": {
      "Name": "Francis Ford Coppola"
    },
    "Genre": {
      "Name": "Drama"
    }
  },
  {
    "Title": "Once Upon a Time in... Hollywood",
    "Director": {
      "Name": "Quentin Tarantino"
    },
    "Genre": {
      "Name": "Comedy"
    },
  },
  {
    "Title": "A Serious Man",
    "Director": {
      "Name": "Joel Cohen"
    },
    "Genre": {
      "Name": "Drama"
    }
  },
  {
    "Title": "The Shining",
    "Director": {
      "Name": "Stanley Kubrick"
    },
    "Genre": {
      "Name": "Psychological Horror"
    }
  },
  {
    "Title": "Tokyo Story",
    "Director": {
      "Name": "Yasujiro Ozu",
    },
    "Genre": {
      "Name": "Drama"
    }
  },
  {
    "Title": "The Enigma of Kaspar Hauser",
    "Director": {
      "Name": "Werner Herzog"
    },
    "Genre": {
      "Name": "Historical Fiction"
    }
  },
  {
    "Title": "The Seventh Seal",
    "Director": {
      "Name": "Igmar Bergman"
    },
    "Genre": {
      "Name": "Historical Fiction"
    }
  },
  {
    "Title": "The Long Goodbye",
    "Director": {
      "Name": "Robert Altman"
    },
    "Genre": {
      "Name": "Thriller"
    }
  },
  {
    "Title": "The King of Comedy",
    "Director": {
      "Name": "Martin Scorsesse"
    },
    "Genre": {
      "Name": "Comedy"
    }
  },
  {
    "Title": "Alien",
    "Director": {
      "Name": "Ridley Scott"
    },
    "Genre": {
      "Name": "Horror"
    }
  }
];
*/
/*
let users = [
  {
    id: 1,
    name: 'Jimmy',
    favoriteMovies: []
  },
  {
    id: 2,
    name: 'Kimmy',
    favoriteMovies: []
  }
];
*/

//after importing express needs to be added to the app
const app = express();

//morgan to log all requests
app.use(morgan('common'));

//use bodyParser to read data out of the request body
app.use(bodyParser.json());

//error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// CREATE add user
/* We'll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

/* Previous code from exercise 2.5:
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser)
  } else {
    res.status(400).send('users need names')
  }
}); */

// UPDATE a user's info, by username
/* We'll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}*/
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//previously used code from exercise 2.5
/*app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find( user => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('no such user')
  }
});*/

// CREATE add movieTitle to favoriteMovies
app.post('users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username}, { $push: { FavoriteMovies: req.params.MovieID }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//previously used code from exercise 2.5
/*app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;
  const updatedUser = req.body;

  let user = users.find( user => user.id == id);

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
  } else {
    res.status(400).send('no such user')
  }
});*/

// DELETE remove favoriteMovies
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;
  const updatedUser = req.body;

  let user = users.find( user => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter( title => title !==movieTitle);
    res.status(200).send(`${movieTitle} has been removed to user ${id}'s array`);
  } else {
    res.status(400).send('no such user')
  }
});

// DELETE remove user
app.delete('/users/:Username', (req, res) => {
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


//Previously used code from exercise 2.5
/*app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find( user => user.id == id);

  if (user) {
    users = users.filter( user => user.id != id )
    res.status(200).send(`user ${id} has been deleted`);
  } else {
    res.status(400).send('no such user')
  }
});*/

//READ (added for exercise 2.8)
// Get all users
app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error:' + err);
    });
});

//READ (added for exercise 2.8)
// get a user by username
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


// READ movies
app.get('/movies', (req, res) => {
  res.status(200).json(movies)
});

// READ movies by title
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find( movie => movie.Title === title )

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('no such movie');
  }
});

// READ, genre
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find( movie => movie.Genre.Name === genreName );

  if (genre) {
    res.status(200).json(genre.Genre);
  } else {
    res.status(400).send('no such genre');
  }
});

// READ, director
app.get('/movies/director/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find( movie => movie.Director.Name === directorName );

  if (director) {
    res.status(200).json(director.Director);
  } else {
    res.status(400).send('no such director');
  }
});

// READ 
app.get('/', (req, res) => {
  res.send('Welcome to my movie app!');
});

//express.static to serve static files in public folder
app.use(express.static('public'));

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080, open your browser')
})