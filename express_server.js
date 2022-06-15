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

const checkExistEmail = function (obj,email) {
  for (const key in obj) {
    if (obj[key].email === email) {
      return key;
      
    }
  }
  return false;

}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "a1b2": {
    id: "a1b2", 
    email: "user@ex.com", 
    password: "12345"
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users, user_id: req.cookies["user_id"]}
  res.render("urls_index", templateVars);
});
//Make sure to place this code above the app.get("/urls/:id", ...) route definition
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users, user_id: req.cookies["user_id"]};
  res.render("urls_new",templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = { urls: urlDatabase, user: users, user_id: req.cookies["user_id"]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users, user_id: req.cookies["user_id"]};
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users, user_id: req.cookies["user_id"]};
  res.render("urls_login", templateVars);
});





app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls/");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  //console.log(req.params.shortURL);
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect("/urls/");
});

app.post("/login", (req, res) => {
  //console.log(req.params.shortURL);
  const email = req.body.email;
  const password = req.body.password;
  //console.log(username);
  if(!checkExistEmail(users,email)){
    return res.status(403).send("Account does not exist, please register first.");
  }
  let id = checkExistEmail(users,email);
  if(users[id].password !== password){
    return res.status(403).send("Incorrect Password, please try again.");
  }
  res.cookie("user_id",id);
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  console.log(req.body);
  const email = req.body.email;
  const password = req.body.password;

  if(checkExistEmail(users,email)){
    return res.status(400).send("Error found: The email alredy exist.");
  }
  if(!email || !password){
    return res.status(400).send("Both email and password are madatory, please try again.");
  }

  users[id] = {
    id: id, 
    email: email, 
    password: password
  };
  res.cookie("user_id",id);
  res.redirect("/urls");
  console.log(users);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});