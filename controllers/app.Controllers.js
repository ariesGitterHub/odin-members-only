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

async function getUpdateProfile(req, res, next) {
  try {
    res.render("update-profile", {
      title: "Update Profile",
      user: req.user,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

async function getInfo(req, res, next) {
  try {
    res.render("info", {
      title: "Site Information",
      user: req.user,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

async function getMessageBoard(req, res, next) {
  try {
    res.render("message-board", {
      title: "Message Board",
      user: req.user,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

async function getBecomeMember(req, res, next) {
  try {
    res.render("become-member", {
      title: "Become Member",
      user: req.user,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

async function getAdmin(req, res, next) {
  try {
    res.render("admin", {
      title: "Admin",
      user: req.user,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

// -- Log-out
// REMINDER - Don't use async or try/catch — below is the correct pattern.
function postLogOut(req, res, next) {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/app");
  });
}

module.exports = {
  getHome,
  getSignUp,
  getLogIn,
  getDashboard,
  getUpdateProfile,
  getInfo,
  getMessageBoard,
  getBecomeMember,
  getAdmin,
  postLogOut
};
