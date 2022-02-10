const express = require('express'),
  morgan = require('morgan');

const app = express();

//morgan to log all requests
app.use(morgan('common'));

//error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to my movie app!');
});

app.get('/movies', (req, res) => {
  res.json(myTopMovies);
});

//express.static to serve static files in public folder
app.use(express.static('public'));

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080, open your browser')
})

//My Top Movies
let myTopMovies = [
  {
    title: 'The Godfather',
    director: 'Francis Ford Coppola'
  },
  {
    title: 'Once Upon a Time in... Hollywood',
    director: 'Quentin Tarantino'
  },
  {
    title: 'A Serious Man',
    director: 'Joel Cohen'
  },
  {
    title: 'The Shining',
    director: 'Stanley Kubrick'
  },
  {
    title: 'Tokyo Story',
    director: 'Yasujiro Ozu'
  },
  {
    title: 'The Enigma of Kaspar Hauser',
    director: 'Werner Herzog'
  },
  {
    title: 'The Seventh Seal',
    director: 'Igmar Bergman'
  },
  {
    title: 'The Long Goodbye',
    director: 'Robert Altman'
  },
  {
    title: 'The King of Comedy',
    director: 'Martin Scorsesse'
  },
  {
    title: 'Alien',
    director: 'Ridley Scott'
  }
]