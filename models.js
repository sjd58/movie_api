/**
 * @fileoverview The purpose of this file is to implement schemas for documents held in the movies and users collections
 * in MongoDB. The API uses the models created created based on these schemas for its endpoints to create, read, update, 
 * and delete documents from the database. Mongoose is connected to the database using the connect method in index.js.
 * @requires mongoose This model connects the app to MongoDB and implements data schemas using the models.
 * @requires bycrypt This implements encryption and hashes user passwords.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Description: {type: String, required: true},
    Genre: {
      Name: String,
      Description: String
    },
    Director: {
      Name: String,
      Bio: String
    },
    Actors: [String],
    ImagePath: String,
    Featured: Boolean
  });
  
  let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date,
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
  });
  /**
   * This is a method for encrypting passwords when creating or updating passwords.
   * @method hashPassowrd
   * @param {*} password 
   * @returns {string} A string containing the encrypted password.
   */
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

/**
 * This method is used to validate a user's password against the encrypted version in MongoDB during login attempts.
 * @method validatePassword 
 * @param {*} password 
 * @returns {boolean} The boolean value is true if the password submitted after encryption matches the
 * password found in MongoDB
 */
userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.Password);
};

  let Movie = mongoose.model('Movie', movieSchema);
  let User = mongoose.model('User', userSchema);
  
  module.exports.Movie = Movie;
  module.exports.User = User;