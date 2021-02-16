const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); //Set ejs as the view engine.

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

///-------------GET
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//route for /urls
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Add a GET Route to Show the Form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Adding a Second Route
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

//Redirect any request to "/u/:shortURL" to its longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//--------------POST

//Add a POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(); 
  urlDatabase[shortURL] = req.body.longURL; // makes a key 
  console.log(req.body);  // Log the POST request body to the console
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${shortURL}`) 
  // Redirect After Form Submission -taking us to line 37 "/urls/:shortURL"
}); 

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Generate a Random ShortURL
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}