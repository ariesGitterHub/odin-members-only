async function getHome(req, res, next) {
  try {
    res.render("index", {
      title: "Home",
      user: req.user,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

async function getSignUp(req, res, next) {
  try {
    res.render("sign-up", {
      title: "Sign Up",
      user: req.user,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

async function getLogIn(req, res, next) {
  try {
    res.render("log-in", {
      title: "Log In",
      user: req.user,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

async function getDashboard(req, res, next) {
  try {
    res.render("dashboard", {
      title: "Dashboard",
      user: req.user,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}


module.exports = {
  getHome,
  getSignUp,
  getLogIn,
  getDashboard
};
