myFlix API Project

## Overview
The purpose of this project is to set up the server-side component of a web application that allows users to sign up, login, view favorite movies, and update their profiles.

## Technical Requirements
1. The API must be a Node.js and Express application.
2. The API must use REST architecture, with URL endpoints corresponding to the data operations listed above
3. The API must use at least three middleware modules, such as the body-parser package for reading data from requests and morgan for logging.
4. The API must use a “package.json” file.
5. The database must be built using MongoDB.
6. The business logic must be modeled with Mongoose.
7. The API must provide movie information in JSON format.
8. The JavaScript code must be error-free.
9. The API must be tested in Postman.
10. The API must include user authentication and authorization code.
11. The API must include data validation logic.
12. The API must meet data security regulations.
13. The API source code must be deployed to a publicly accessible platform like GitHub.
14. The API must be deployed to Heroku.

## Essential Features
1. Return a list of ALL movies to the user
2. Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user
3. Return data about a genre (description) by name/title (e.g., “Thriller”)
4. Return data about a director (bio, birth year, death year) by name
5. Allow new users to register
6. Allow users to update their user info (username, password, email, date of birth)
7. Allow users to add a movie to their list of favorites
8. Allow users to remove a movie from their list of favorites
9. Allow existing users to deregister

## Development log:
3/7/2022: API deployed
3/1/2022: Endpoints other than the welcome message and user registration now require JWTs for authorization.
2/14-2/18/2020: created relational and non-relational databases to store information for the project.
2/14/2022: Added URL pathway functions to index.js
2/9/2022: Installed morgan, updated index.js, html.js
2/5/2022: Installed express, body-parser, eslint
2/2/2022: Installed lodash
1/28/2022: project begun, local repo created
1/31/2022: added readme, log, documentation page, index page, and server.js files.
This project was begun on 1/28/2022 using node.js, JavaScript, HTML.