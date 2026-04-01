const { getAllRetentionDays } = require("../db/queries/appConfigQueries");

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
  const retentionDays = await getAllRetentionDays();

  try {
    res.render("info", {
      title: "Site Information",
      // user: req.user,
      // errors: [],
      config: retentionDays,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getHome,
  getInfo,
};