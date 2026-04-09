const { getAllSiteControls } = require("../db/queries/appConfigQueries");
const { hasRole } = require("../utils/permissions");

// Checks for maintenance mode on sign-up.ejs and log-in.ejs
async function checkMaintenanceMode(req, res, next) {
  try {

    console.log("first check", req.user)
    // Check if the site is in maintenance mode using the environment variable
    // const isMaintenanceModeEnabledProcessEnv = process.env.MAINTENANCE_MODE === "true"; // Check if it's "true" in the .env

    const config = await getAllSiteControls();
    // const isMaintenanceModeEnabledDatabase = config.maintenance_mode || false; 

    if (
      (process.env.MAINTENANCE_MODE === "true" &&
        req.user &&
        !hasRole("admin")) ||
      (config.maintenance_mode &&
        req.user &&
        !hasRole("admin"))
    ) {
    console.log("middle check", req.user);
      return res.redirect("/");
    }
      // If the site is not in maintenance mode, or if the user is an admin, continue to the next middleware
    console.log("last check", req.user);
    
    next();
  } catch (err) {
    console.error("Error checking maintenance mode:", err);
    next(err); // Pass to global error handler
  }
}

module.exports = checkMaintenanceMode;