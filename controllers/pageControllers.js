// CONTROLLER: INDEX (index.ejs)

async function getHome(req, res, next) {
  try {
    res.render("index", {
      title: "Home",
      // user: req.user,
      // errors: [],
    });
  } catch (err) {
    next(err);
  }
}


// CONTROLLER: INFO PAGE (info.ejs)

async function getInfo(req, res, next) {
  try {
    res.render("info", {
      title: "Site Information",
      // user: req.user,
      // errors: [],
    });
  } catch (err) {
    next(err);
  }
}


module.exports = {
  getHome,
  getInfo,
};