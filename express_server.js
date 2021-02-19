const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const {getUserByEmail} = require('./helper');
///SET
app.set("view engine", "ejs"); //Set ejs as the view engine.

///MIDDLEWARE - how we use the packages
//const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));



//----Global Scope Variables


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

//Generate a Random ShortURL
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "elodiebouthors@hotmail.com",
    password: "Hello@123"
  },
  "user4RandomID": {
    id: "user4RandomID",
    email: "admin@hotmail.com",
    password: "123"
  }
};


///---------GET

//----GET request to root page should be redirected to login page
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//----GET route for /urls
const urlsForUser = (id) => {
  let result = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      result[url] = urlDatabase[url];
    }
  }
  console.log(result);
  return result;
};

//if user is looged in can see urls otherwise redirected to login
app.get("/urls", (req, res) => {
  const key = req.session.user_id;
  if (!key) {
    return res.redirect("/login");
  } else {
    const templateVars = {
      urls: urlsForUser(key),
      user: users[key]
    };
    res.render("urls_index", templateVars);
  }
});


//----GET Route to Show the Form - create new url
//if the user is logged in retunr html otherwise redirect to login
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});


//----GET Route for short URL page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const key = req.session.user_id;
  
  //if the user is not logged in it show error and message
  if (!key) {
    res.status(401).send("your have to login");
    return;
  }
  // url needs to belong to user in order to have access otherwise error message
  const urlBelongToUSer = urlDatabase[shortURL] && urlDatabase[shortURL].userID === key;
  if (urlBelongToUSer) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: req.session["user_id"], };
    res.render("urls_show", templateVars);
    return;
  } else {
    res.status(401).send("your don't have permit to access this page");
    return;
  }
});


//----GET Redirect any request to "/u/:shortURL" to its longURL // we type in the short URL and it brings us to the long URL website
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


//----GET Adding a route to register
app.get("/register", (req,res) => {
  const templateVars = {user: req.session['user_id']};
  res.render("register", templateVars);
});

///----GET Adding a route to Login page
app.get("/login", (req, res) => {
  //console.log("users",users)
  const templateVars = {user: req.session['user_id']};
  res.render("login", templateVars);
});


//--------------POST

//----POST Route to Receive the Form Submission -user submits longURL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL : req.body.longURL, userID: req.session['user_id']};
  
  res.redirect(`/urls/${shortURL}`);
});


//----POST route that updates a URL resource; POST /urls/:id -user click edit
app.post("/urls/:shortURL", (req, res) => {
  
  const key = req.session.user_id;
  const shortURL = req.params.shortURL;
  //The req.params object captures data based on the parameter specified in the URL.
  //Users Can Only Edit or Delete Their Own URLs
  if (key === urlDatabase[shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect(`/urls/`);
  } else {
    res.sendStatus(404);
  }
  
});


//----POST route that removes a URL resource: POST /urls/:shortURL/delete - user click delete
app.post("/urls/:shortURL/delete", (req, res) => {
  const key = req.session.user_id;
  const shortURL = req.params.shortURL;
  //The req.params object captures data based on the parameter specified in the URL.
  //Users Can Only Edit or Delete Their Own URLs
  if (key === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect(`/urls/`);
  } else {
    res.send('please login');
  }
});


//----POST to /login in Express server. - user login
app.post("/login", (req, res) => {
  let user = getUserByEmail(req.body.email, users);
  if (!user) {
    res.redirect(403, '/login');
    return;
  } else {
    const isPassword = bcrypt.compareSync(req.body.password, user.password);
    if (isPassword) {
      req.session.user_id = user.id;
      res.redirect('/urls');
      return;
    }
  }
  res.redirect(403, '/login');
  
});

//----POTS logout Clear the cookie for username
app.post("/logout", (req, res) => {
  //res.clearCookie('user_id');
  req.session.user_id = null;
  res.redirect(`/urls`);
});

//---Registration Handler- Register
app.post("/register", (req, res) =>{
  
  //If someone tries to register with an email that is already in the users object, send back a response with the 400 status code

  //If the e-mail or password are empty strings, send back a response with the 400 status code.
  if (req.body.email === "" || req.body.password === "") {
    return res.redirect(400, '/register');
  }
  
  //testing if the user is already registered
  if (getUserByEmail(req.body.email, users)) {
    return res.redirect(400, '/login');
  }
  
  const newUserID = generateRandomString();
  const hash = bcrypt.hashSync(req.body.password, 10);
  users[newUserID] = {
    id: newUserID,
    email: req.body.email,
    password: hash
  };
  console.log(users);


  //res.cookie('user_id', newUserID)
  req.session.user_id = newUserID;
  res.redirect(`/urls`);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

