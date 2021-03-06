/**
 * @fileoverview The purpose of this file is to implement 'LocalStrategy' and 'JWTStrategy' passport strategies for API request authentication to endpoints.
 * When a user logs in, LocalStrategy is used to validate the username and password against what's stored in MongoDB. JWTStrategy is for requests after login.
 * It validates requests by decoding the JWT that each user should have stored after logging in.
 * @requires passport This module creates strategies for authenticating and authorizing requests to API endpoints.
 * @requires passport-local The passport-local module creates a local strategy.
 * @requires passport-jwt The passport-jwt module creates a jwt strategy and extracts tokens from requests.
 * @reqires './models.js' This is the file where data schemas and models are defined.
 */

const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Models = require('./models.js'),
    passportJWT = require('passport-jwt');

let Users = Models.User,
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

passport.use(new LocalStrategy({
    usernameField: 'Username',
    passwordField: 'Password'
}, (username, password, callback) => {
    console.log(username + ' ' + password);
    Users.findOne({ Username: username }, (error, user) => {
        if (error) {
            console.log(error);
            return callback(error);
        }
        
        if (!user) {
            console.log('incorrect username');
            return callback(null, false, {message: 'Incorrect username'});
        }

        if (!user.validatePassword(password)) {
            console.log('incorrect password');
            return callback(null, false, {message: 'Incorrect password.'});
        }

        console.log('finished');
        return callback(null, user);
    });
}));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
},  (jwtPayload, callback) => {
    return Users.findById(jwtPayload._id)
        .then((user) => {
            return callback(null, user);
        })
        .catch((error) => {
            return callback(error)
        });
}));