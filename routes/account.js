const express = require("express");
const sanitizer = require('sanitizer');
const router = express.Router();
const data = require("../data");
const accountData = data.account;
const xss = require('xss');

//Middleware
router.use("/signup", (req, res, next) => {
  if (req.session.user) {
    return res.redirect("/home");
  }
  next();
});

router.use("/login", (req, res, next) => {
  if (req.session.user) {
    return res.redirect("/home");
  }
  next();
});

router.use("/logout", (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/home");
  }
  next();
});

// Signup - GET /
router.get("/signup", async (req, res) => {
  try {
    res.render("pages/medium/signup", {
      title: "Sign Up",
      not_logged_in: true,
    });
  } catch (e) {
    res.sendStatus(500);
  }
});

// Signup - POST /
router.post("/signup", async (req, res) => {
  let userInfo = req.body;
  let username = xss(userInfo.username);
  let userPsw = xss(userInfo.psw);
  let pswRepeat = xss(userInfo.pswRepeat);

  //for username
  try {
    if (!username) throw "Error: username was not provided";
    if (typeof username !== "string")
      throw "Error: username should be a string";
    username = username.trim();
    username = sanitizer.sanitize(username);
    username = xss(username);
    if (username.length < 2)
      throw "Error: username must have at least two characters";
  } catch (e) {
    return res.status(400).render("pages/medium/signup", {
      error: e,
      usernameErr: true,
      not_logged_in: true,
    });
  }

  //for password
  try {
    if (!userPsw) throw "Error: password was not provided";
    if (!pswRepeat) throw "Error: no entry for confirm password";

    if (typeof userPsw !== "string") throw "Error: password should be a string";
    if (typeof pswRepeat !== "string")
      throw "Error: confirm password should be a string";

    userPsw = userPsw.trim();
    userPsw = sanitizer.sanitize(userPsw);
    userPsw = xss(userPsw);
    pswRepeat = pswRepeat.trim();
    pswRepeat = sanitizer.sanitize(pswRepeat);
    pswRepeat = xss(userPsw);

    if (userPsw.length < 8)
      throw "Error: password must have at least eight characters";
    if (userPsw.localeCompare(pswRepeat) !== 0)
      throw "Error: password and confirm password fields must match";
  } catch (e) {
    return res.status(400).render("pages/medium/signup", {
      error: e,
      pswErr: true,
      username: username,
      not_logged_in: true,
    });
  }

  try {
    await accountData.addNewUser(xss(username), xss(userPsw));
  } catch (e) {
    return res.status(500).render("pages/medium/signup", {
      error: e,
      dbErr: true,
      username: username,
      not_logged_in: true,
    });
  }

  try {
    return res.redirect("/account/login");
  } catch (e) {
    res.status(500);
  }
});

router.get("/login", async (req, res) => {
  try {
    res.render("pages/medium/login", { title: "Log In", not_logged_in: true });
  } catch (e) {
    res.sendStatus(500);
  }
});

router.post("/login", async (req, res) => {
  let userInfo =req.body;
  let username = xss(userInfo.username);
  let userPsw = xss(userInfo.psw);

  //error checking
  try {
    if (!username) throw "Error: username was not provided";
    if (typeof username !== "string")
      throw "Error: username should be a string";
    username = username.trim();
    username = sanitizer.sanitize(username);
    username = xss(username);
    if (username.length < 2)
      throw "Error: username must have at least two characters";
  } catch (e) {
    return res.status(400).render("pages/medium/login", {
      error: e,
      usernameErr: true,
      not_logged_in: true,
    });
  }

  try {
    if (!userPsw) throw "Error: password was not provided";
    if (typeof userPsw !== "string") throw "Error: password should be a string";

    userPsw = userPsw.trim();
    userPsw = sanitizer.sanitize(userPsw);
    userPsw = xss(userPsw);

    if (userPsw.length < 8)
      throw "Error: Password must be at least eight characters";
  } catch (e) {
    return res.status(400).render("pages/medium/login", {
      error: e,
      pswErr: true,
      username: username,
      password: userPsw,
      not_logged_in: true,
    });
  }

  try {
    let existingUser = await accountData.login(xss(username), xss(userPsw));
    if (!existingUser) throw "Eror: could not login";
    let isAdmin = await accountData.isUserAdmin(xss(username));

    req.session.user = { username: existingUser };
    if (isAdmin.administrator) req.session.admin = true;
    return res.redirect("/home");
  } catch (e) {
    return res.status(400).render("pages/medium/login", {
      error: e,
      dbErr: true,
      username: username,
      not_logged_in: true,
    });
  }
});

// Logout - GET /

router.get("/logout", async (req, res) => {
  req.session.destroy();
  return res.redirect("/home");
});

module.exports = router;
