const express = require("express");
const app = express();
const PORT = 8080; // default port 8080


//set ejs as the view engine
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

//const cookieParser = require('cookie-parser');
//app.use(cookieParser());

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ["tinyapp"],
}))

const bcrypt = require('bcryptjs');

function generateRandomString() {
  const result = Math.random().toString(36).substring(2, 8);
  return result;

};

const checkExistEmail = function (obj, email) {
  for (const key in obj) {
    if (obj[key].email === email) {
      return key;

    }
  }
  return false;

};

const urlsForUser = function (id) {
  let UrlsForUser = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      UrlsForUser[key] = urlDatabase[key];
    }
  }
  return UrlsForUser;

};


// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    const templateVars = { user: users, user_id: req.session.user_id }
    res.render("urls_notLogin", templateVars);

  } else {
    const UrlForUser = urlsForUser(req.session.user_id);
    //console.log("url for user:", UrlForUser);
    const templateVars = { urls: UrlForUser, user: users, user_id: req.session.user_id }
    res.render("urls_index", templateVars);
  }

});
//Make sure to place this code above the app.get("/urls/:id", ...) route definition
app.get("/urls/new", (req, res) => {
  console.log("user_id_1",req.session.user_id );
  if (!req.session.user_id ) {
    //res.status(403).send("Account does not exist, please register first.");
    res.redirect("/login",403);

  }
  console.log("user_id",req.session.user_id );
  const templateVars = { urls: urlDatabase, user: users, user_id: req.session.user_id };
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    const templateVars = { user: users, user_id: false }
    res.render("urls_notLogin", templateVars);
  }
  const shortURL = req.params.shortURL;
  const UrlForUser = urlsForUser(req.session.user_id);
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
  const templateVars = { urls: urlDatabase, user: users, user_id: req.session.user_id };
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users, user_id: req.session.user_id };
  res.render("urls_login", templateVars);
});





app.post("/urls", (req, res) => {
  //console.log(req.cookies.user_id);
  if (!req.session.user_id) {
    //res.status(403).send("Account does not exist, please register first.");
    res.redirect("/login",403);

  } else {
    const longURL = req.body.longURL;
    //console.log(longURL);
    const shortURL = generateRandomString();
    // urlDatabase[shortURL].longURL = longURL;
    // urlDatabase[shortURL].userID = req.cookies.user_id;
    urlDatabase[shortURL] = {
      longURL: longURL,
      userID: req.session.user_id
    }
    //console.log(urlDatabase);
    //console.log(users);
    res.redirect(`/urls/${shortURL}`);

  }

});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id) {
    //const templateVars = { user: users, user_id: req.cookies["user_id"] }
    //res.render("urls_notLogin", templateVars);
    res.redirect(403,"/login");
  }
  const shortURL = req.params.shortURL;
  const UrlForUser = urlsForUser(req.session.user_id);
  //console.log(UrlForUser);
  //console.log(users);
  if(!UrlForUser[shortURL]){
    const templateVars = { user: users, user_id: false }
    res.render("urls_notAllowed", templateVars);
  }else{
    delete urlDatabase[shortURL];
    res.redirect("/urls/");
  }
 
});

app.post("/urls/:shortURL/edit", (req, res) => {
  if (!req.session.user_id) {
    //const templateVars = { user: users, user_id: req.cookies["user_id"] }
    //res.render("urls_notLogin", templateVars);
    res.redirect(403,"/login");
  }
  //console.log(req.params.shortURL);
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.newURL;
  res.redirect("/urls/");
});

app.post("/login", (req, res) => {
  //console.log(req.params.shortURL);
  const email = req.body.email;
  const password = req.body.password;
  //console.log(username);
  if (!checkExistEmail(users, email)) {
    return res.status(403).send("Account does not exist, please register first.");
  }
  let id = checkExistEmail(users, email);
  console.log(bcrypt.compareSync(password, users[id].password));
  if (!bcrypt.compareSync(password, users[id].password)) {
    return res.status(403).send("Incorrect Password, please try again.");
  }
  //res.cookie("user_id", id);
  req.session.user_id = id;
  console.log(req.session.user_id);
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  //res.clearCookie("user_id");
  req.session = null;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  //console.log(req.body);
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
  //res.cookie("user_id", id);
  req.session.user_id = id;
  res.redirect("/urls");
  console.log(users);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});