const express = require("express");
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080

///SET
app.set("view engine", "ejs"); //Set ejs as the view engine.

///MIDDLEWARE - how we use the packages
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


//----Global Scope Variables
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Generate a Random ShortURL
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
};

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
  }
};
//users["newuser"]={id : "elodie", email : "elodiebouthors@"}
//console.log(users)


///------------GET
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
  // we can see Hello World on the page
});

//----route for /urls
app.get("/urls", (req, res) => {
  const key = req.cookies["user_id"];
  const templateVars = { 
    urls: urlDatabase,
    user: users[key]
  
  };
  console.log(templateVars);
  // we are sending that to the URLs index template line 39
  /*{
   urls: {
     b2xVn2: 'http://www.lighthouselabs.ca',
     '9sm5xK': 'http://www.google.com'
   }
  }
 */
  res.render("urls_index", templateVars);
});


//----Add a GET Route to Show the Form - create new url
app.get("/urls/new", (req, res) => {
  const templateVars ={username: req.cookies["username"]}
  res.render("urls_new", templateVars);
});


//----Adding a Second Route for short URL page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"], };
  res.render("urls_show", templateVars);
});


//----Redirect any request to "/u/:shortURL" to its longURL // we type in the short URL and it brings us to the long URL website
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//----Adding a route to register
app.get("/register", (req,res) => {
  
  const templateVars = {user: req.cookies['user_id']};

  res.render("register", templateVars);
})

///----Adding a route to Login page
app.get("/login", (req, res) => {
  const templateVars = {user: req.cookies['user_id']};
  res.render ("login", templateVars);
})


//--------------POST

//----Add a POST Route to Receive the Form Submission -user submits longURL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  //The req.body object allows you to access data in a string or JSON object from the client side.
  // we are adding Key/Value to urlDatabase. Taking whatever is in the box called name=LongURL in urls_new
  console.log(req.body);
  // Log the POST request body to the console
  //res.send("Ok"); // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${shortURL}`);
  // Redirect After Form Submission -taking us to line 37 "/urls/:shortURL"
});


//----Add a POST route that updates a URL resource; POST /urls/:id -user click update
app.post("/urls/:shortURL", (req, res) => {
  console.log(req.body);
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls`);
});


//----Add a POST route that removes a URL resource: POST /urls/:shortURL/delete -user click delete
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  //The req.params object captures data based on the parameter specified in the URL.
  delete urlDatabase[shortURL];

  res.redirect(`/urls/`); 
  //redirect the client back to the urls_index page ("/urls").
});


//----Add an endpoint to handle a POST to /login in Express server. - user login 
app.post("/login", (req, res) => {
  const username = req.body.username
  //grabbing the username from the form
  res.cookie('username', username);
  //keeping the cookie in the browser
  console.log(req.cookies)
  res.redirect(`/urls`);
});

//----Clear the cookie for username
app.post("/logout", (req, res) => {
  res.clearCookie("username", {path: '/'});
  res.redirect(`/urls`);
});

//---Registration Handler
app.post("/register", (req, res) =>{
  console.log('register',req.body)
  const newUserID = generateRandomString()
  users[newUserID]= {
    id: newUserID,
    email: req.body.email,
    password: req.body.password
  }

  if (req.body.email || req.body.password === ""){
    res.redirect(400, '/register')
  } else if (req.body.email === users[user].email){
    res.redirect(400, '/register')
    }

  res.cookie('user_id', newUserID)
  res.redirect(`/urls`);
});

//----Login page Handler
app.post("/login", (req, res) =>{
//if key email exist we redirect to login page oterwise access not allowed

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

