const express = require("express");
const app = express();
const PORT = 8080; // default port 8080


//set ejs as the view engine
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

function generateRandomString() {
  const result = Math.random().toString(36).substring(2,8);
  return result;

}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});
//Make sure to place this code above the app.get("/urls/:id", ...) route definition
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_new",templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  const templateVars = { shortURL: shortURL, longURL: longURL, username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// app.get("/login", (req, res) => {
//   //console.log(req.params.shortURL);
//   const username = req.cookies["username"];
//   console.log("username is",username);
//   res.render("_header",{username : username});
// });

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls/");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  //console.log(req.params.shortURL);
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect("/urls/");
});

app.post("/login", (req, res) => {
  //console.log(req.params.shortURL);
  const username = req.body.username;
  console.log(username);
  res.cookie("username",username);
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});