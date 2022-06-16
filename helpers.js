const generateRandomString =  function () {
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

const urlsForUser = function (id,urlDatabase) {
  let UrlsForUser = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      UrlsForUser[key] = urlDatabase[key];
    }
  }
  return UrlsForUser;

};

module.exports = {generateRandomString, checkExistEmail, urlsForUser};