var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var session = require('express-session');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// Cookie parsing middleware to check for cookies
app.use(session({
  secret: 'pranaynay',
  cookie: {},
  saveUnitialized: true
}));

app.get('/', 
function(req, res) {
  res.render('index');
});

app.get('/create', 
function(req, res) {
  res.render('index');
});

app.get('/links', 
function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.status(200).send(links.models);
  });
});

app.post('/links', function(req, res) {

  //Check user first before rendering the page
  util.checkUser(req, res, function(bool) {
    if (bool) {
      console.log('cb true');
      var uri = req.body.url;

      if (!util.isValidUrl(uri)) {
        console.log('Not a valid url: ', uri);
        return res.sendStatus(404);
      }

      new Link({ url: uri }).fetch().then(function(found) {
        if (found) {
          res.status(200).send(found.attributes);
        } else {
          util.getUrlTitle(uri, function(err, title) {
            if (err) {
              console.log('Error reading URL heading: ', err);
              return res.sendStatus(404);
            }

            Links.create({
              url: uri,
              title: title,
              baseUrl: req.headers.origin
            })
            .then(function(newLink) {
              res.status(200).send(newLink);
            });
          });
        }
      });
    } else {
      console.log('cb false');
      res.redirect('/login');
    }
  });
  //checkUser();

});

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.post('/signup', function(req, res) {

  var username = req.body.username;
  var password = req.body.password;

  new User({ username: username })
  .fetch()
  .then(function(found) {
    if (found) {
      // Username already exists
      console.log('Username is already taken, please try another one');
      // TODO: Figure out how to handle user sign up that already exists
      res.status(200).send(found.attributes);
    } else {
      // Create new user and add it to the collection
      Users.create({
        username: username,
        password: password
      })
      .then(function(newUser) {
        // res.status(200).send(newUser);
        // console.log('yoooo im redirectinnn');
        // res.redirect(307, '/login');
        res.redirect('/');
      });
    }
  });
});

app.post('/login', function(req, res) {

  console.log('Yo im loggin innnnn', req.body);

  var username = req.body.username;
  var password = req.body.password;

  new User({ username: username }).fetch()
  .then(function(found) {
    if (found) {
      //Proceed with login
      //Compare the password they passed in with the hash
      bcrypt.compare(password, found.attributes.password, function(err, result) {
        if (err) { throw err; }
        if (result === true) {
          // Password matches with hash, allow user to proceed:
          //Redirect to homepage with user logged in
          res.redirect('/');
        } else {
          console.log('Sorry that was the wrong password!');
          res.redirect('/login');
        }
      });
      
    } else {
      //Send a 404 and keep user at /login
      console.log('User doesn\'t exist, please sign up first!');
      res.redirect('/login');
    }
  });
});

app.get('/login', function(req, res) {
  console.log('app get login');
  res.render('login');
});

app.get('/signup', function(req, res) {
  res.render('signup');
});

/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        linkId: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits') + 1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
