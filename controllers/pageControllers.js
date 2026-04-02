const { getAllSiteControls } = require("../db/queries/appConfigQueries");

// CONTROLLER: INDEX (index.ejs)

async function getHome(req, res, next) {
  try {
    // const isMaintenanceModeProcessEnv = process.env.MAINTENANCE_MODE === "true";

    const siteSettings = await getAllSiteControls();
    
    if (
      process.env.MAINTENANCE_MODE === "true" ||
      siteSettings.maintenance_mode
    ) {
      res.render("maintenance", {
        title: "Maintenance",
        // user: req.user,
        // errors: [],
      });
    } else {
      res.render("index", {
        title: "Home",
        // user: req.user,
        // errors: [],
      });
    }
  } catch (err) {
    next(err);
  }
}


// CONTROLLER: INFO PAGE (info.ejs)

async function getInfo(req, res, next) {
  const siteSettings = await getAllSiteControls();

  try {
    res.render("info", {
      title: "Site Information",
      // user: req.user,
      // errors: [],
      config: siteSettings,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getHome,
  getInfo,
};