const express = require("express");
const app = express();
const{generateRandomString, checkExistEmail, urlsForUser} = require("./helpers");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

const PORT = 8080; // default port 8080

//database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};
const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@ex.com",
    password: "$2a$10$kBHJ9rwUaVae62jv9r9WQuebynu2DWZA9nFYFS1Lg3A.j.9eui/m2"
  },
};

//set ejs as the view engine
//Middleware
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["tinyapp"],
}))

///////////get route
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id || !users[req.session.user_id]) {
    const templateVars = { user: users, user_id: false }
    res.render("urls_notLogin", templateVars);

  } else {
    const UrlForUser = urlsForUser(req.session.user_id,urlDatabase);
    const templateVars = { urls: UrlForUser, user: users, user_id: req.session.user_id }
    res.render("urls_index", templateVars);
  }

});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id || !users[req.session.user_id] ) {
    res.redirect("/login",403);

  }
  const templateVars = { urls: urlDatabase, user: users, user_id: req.session.user_id };
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id || !users[req.session.user_id]) {
    const templateVars = { user: users, user_id: false }
    res.render("urls_notLogin", templateVars);
  }
  const shortURL = req.params.shortURL;
  const UrlForUser = urlsForUser(req.session.user_id,urlDatabase);
  if(!UrlForUser[shortURL]){
    const templateVars = { user: users, user_id: false }
    res.render("urls_notAllowed", templateVars);
  }
  const longURL = UrlForUser[shortURL].longURL;
  const templateVars = { shortURL: shortURL, longURL: longURL, urls: UrlForUser, user: users, user_id: req.session.user_id };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users, user_id: false };
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users, user_id: false };
  res.render("urls_login", templateVars);
});



/////////post route

app.post("/urls", (req, res) => {
  
  if (!req.session.user_id || !users[req.session.user_id]) {
    
    res.redirect("/login",403);

  } else {
    const longURL = req.body.longURL;
    
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: longURL,
      userID: req.session.user_id
    }
    res.redirect(`/urls/${shortURL}`);

  }

});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id || !users[req.session.user_id]) {
    res.redirect(403,"/login");
  }
  const shortURL = req.params.shortURL;
  const UrlForUser = urlsForUser(req.session.user_id,urlDatabase);
 
  if(!UrlForUser[shortURL]){
    const templateVars = { user: users, user_id: false }
    res.render("urls_notAllowed", templateVars);
  }else{
    delete urlDatabase[shortURL];
    res.redirect("/urls/");
  }
 
});

app.post("/urls/:shortURL/edit", (req, res) => {
  if (!req.session.user_id || !users[req.session.user_id]) {
    res.redirect(403,"/login");
  }
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.newURL;
  res.redirect("/urls/");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!checkExistEmail(users, email)) {
    return res.status(403).send("Account does not exist, please register first.");
  }
  let id = checkExistEmail(users, email);
  if (!bcrypt.compareSync(password, users[id].password)) {
    return res.status(403).send("Incorrect Password, please try again.");
  }
  req.session.user_id = id;
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (checkExistEmail(users, email)) {
    return res.status(400).send("Error found: The email alredy exist.");
  }
  if (!email || !password) {
    return res.status(400).send("Both email and password are madatory, please try again.");
  }

  users[id] = {
    id: id,
    email: email,
    password: hashedPassword
  };
  req.session.user_id = id;
  res.redirect("/urls");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});