const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

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


const urlsForUser = (id) => {
  let result = {};
  for (let url in urlDatabase){
    if(urlDatabase[url].userID === id) {
      result[url]=urlDatabase[url]
    }
    }
    console.log(result)
    return result
  }

//----route for /urls
app.get("/urls", (req, res) => {

  //const key = req.cookies.user_id;
  const key = req.session.user_id;
  if(!key){
    return res.redirect("/login")
  } else {
  const templateVars = { 
    urls: urlsForUser(key),
    user: users[key]
  };
  res.render("urls_index", templateVars);
}
});


//----Add a GET Route to Show the Form - create new url
app.get("/urls/new", (req, res) => {
  if(req.session.user_id){
    const templateVars = {
    user: users[req.session.user_id]
   };
   res.render("urls_new", templateVars);
  } else {
    res.redirect('/login')
  }
});


//----Adding a Second Route for short URL page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const key = req.session.user_id;
  
  if(!key){
    res.status(401).send("your have to login")
    return
  } 
  const urlBelongToUSer = urlDatabase[shortURL] && urlDatabase[shortURL].userID === key
  if(urlBelongToUSer){
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: req.session["user_id"], };
    res.render("urls_show", templateVars);
    return;
  } else {
   res.status(401).send("your don't have permit to access this page")
   return
  }
});



//----Redirect any request to "/u/:shortURL" to its longURL // we type in the short URL and it brings us to the long URL website
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//----Adding a route to register
app.get("/register", (req,res) => {
  
  const templateVars = {user: req.session['user_id']};

  res.render("register", templateVars);
})

///----Adding a route to Login page
app.get("/login", (req, res) => {
  //console.log("users",users)
  const templateVars = {user: req.session['user_id']};
  res.render ("login", templateVars);
})


//--------------POST

//----Add a POST Route to Receive the Form Submission -user submits longURL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL : req.body.longURL, userID: req.session['user_id']};
  //The req.body object allows you to access data in a string or JSON object from the client side.
  // we are adding Key/Value to urlDatabase. Taking whatever is in the box called name=LongURL in urls_new
  //console.log(req.body);
  // Log the POST request body to the console
  //res.send("Ok"); // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${shortURL}`);
  // Redirect After Form Submission -taking us to line 37 "/urls/:shortURL"
});


//----Add a POST route that updates a URL resource; POST /urls/:id -user click edit
app.post("/urls/:shortURL", (req, res) => {
  //console.log(req.body);

  const key = req.session.user_id;
  const shortURL = req.params.shortURL;
  //The req.params object captures data based on the parameter specified in the URL.
  //Users Can Only Edit or Delete Their Own URLs
  if(key===urlDatabase[shortURL].userID){
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect(`/urls/`);
  } else {
    res.sendStatus(404);
  }
  
});


//----Add a POST route that removes a URL resource: POST /urls/:shortURL/delete -user click delete
app.post("/urls/:shortURL/delete", (req, res) => {
  const key = req.session.user_id;
  const shortURL = req.params.shortURL;
  //The req.params object captures data based on the parameter specified in the URL.
  //Users Can Only Edit or Delete Their Own URLs
  if(key===urlDatabase[shortURL].userID){
    delete urlDatabase[shortURL];
    res.redirect(`/urls/`);
  } else {
    res.sendStatus(404);
  }
});


//----Add an endpoint to handle a POST to /login in Express server. - user login 
app.post("/login", (req, res) => {
  for (const user in users){
    const isEmail = users[user].email === req.body.email;
    const isPassword = bcrypt.compareSync(req.body.password, users[user].password);
    //rsconsole.log(isEmail, isPassword)
    if(isEmail && isPassword){
     //res.cookie('user_id', users[user].id)
     req.session.user_id = users[user].id
     res.redirect('/urls')
    } 
  } 
  res.redirect(403, '/login')
});

//----Clear the cookie for username
app.post("/logout", (req, res) => {
  //res.clearCookie('user_id');
  req.session.user_id = null;
  res.redirect(`/urls`);
});

//---Registration Handler- Register
app.post("/register", (req, res) =>{
  //console.log('register',req.body)
  //If someone tries to register with an email that is already in the users object, send back a response with the 400 status code

  //If the e-mail or password are empty strings, send back a response with the 400 status code.
  if (req.body.email ==="" || req.body.password === ""){
    return res.redirect(400, '/register')
    //console.log("here we are")
  } 
  for(let userkey in users){
    let user = users[userkey];

    if (req.body.email === user.email){
      return res.redirect(400, '/register')
    }
  }
  const newUserID = generateRandomString()
  const hash = bcrypt.hashSync(req.body.password, 10);
  users[newUserID]= {
    id: newUserID,
    email: req.body.email,
    password: hash
  }
  console.log(users)


  //res.cookie('user_id', newUserID)
  req.session.user_id = newUserID
  res.redirect(`/urls`);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

