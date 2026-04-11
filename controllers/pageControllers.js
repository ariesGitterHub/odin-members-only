const { getAllSiteControls } = require("../db/queries/appConfigQueries");
const passwordRules = require('../config/passwordRules'); 
 

// CONTROLLER: INDEX (index.ejs)

async function getHome(req, res, next) {
  try {
    const siteSettings = await getAllSiteControls();

    const isMaintenanceModeEnv = process.env.MAINTENANCE_MODE === "true";
    const isMaintenanceModeDb = siteSettings.maintenance_mode || false;
    const isMaintenanceModeActive = isMaintenanceModeEnv || isMaintenanceModeDb;

    if (isMaintenanceModeActive) {
      res.render("maintenance", {
        title: "Maintenance",
        // user: req.user, // Not needed here
        // errors: [], // Not needed here
      });
    } else {
      res.render("index", {
        title: "Home",
        // user: req.user, // Not needed here
        // errors: [], // Not needed here
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
      // user: req.user, // Not needed here
      // errors: [], // Not needed here
      config: siteSettings,
      passwordRules,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getHome,
  getInfo,
};
