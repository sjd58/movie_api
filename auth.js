/**
 * @fileoverview This file implements the login route for users
 * @requires passport This module has strategies for authentication and authorization for requests for API endpoints.
 * @requires './passport.js' This file is where the strategies are implemented
 * @requires jsonwebtoken This module creates JWTs for authorizing requests to private protected endpoints.
 */

const jwtSecret = 'your_jwt_secret'; // This has to be the same key used in the JWTStrategy

const { Router } = require('express');
const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); // Your local passport file
/**
 * @function  generateJWTToken
 * @param  {*} user Authenticated user from the local passport strategy
 * @returns  {string} JSON web token
 */
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // This is the username you’re encoding in the JWT
    expiresIn: '7d', // This specifies that the token will expire in 7 days
    algorithm: 'HS256' // This is the algorithm used to “sign” or encode the values of the JWT
  });
}


/* POST login. */
/**
 * Here, a post request is implemented and exported by the function to the /login endpoint for a registered user.
 * A username and Password is required for the request parameters.
 * A JWT is returned with the user object from MongoDB.
 * @function module.exports
 * @param {*} router
 * @returns {Object} Object with the JWT and the user from MongoDB for the user that is logged in.
 */
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
}