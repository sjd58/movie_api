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
  res.json(topMovies);
});

//express.static to serve static files in public folder
app.use(express.static('public'));

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080, open your browser')
})

//Sample topMovie json object
let topMovies = [
  {
    title: 'topMovie1',
    director: 'exampleDirector1'
  },
  {
    title: 'topMovie2',
    director: 'exampleDirector2'
  }
]