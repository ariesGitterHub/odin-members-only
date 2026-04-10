const { getAllSiteControls } = require("../db/queries/appConfigQueries");
const { hasRole } = require("../utils/permissions");

// Checks for maintenance mode on sign-up.ejs and log-in.ejs
async function checkMaintenanceMode(req, res, next) {
  try {
    const config = await getAllSiteControls();

    if (
      (process.env.MAINTENANCE_MODE === "true" &&
        req.user &&
        !hasRole("admin")) ||
      (config.maintenance_mode &&
        req.user &&
        !hasRole("admin"))
    ) {
      return res.redirect("/");
    }
    
    next();
  } catch (err) {
    console.error("Error checking maintenance mode:", err);
    next(err); // Pass to global error handler
  }
}

module.exports = checkMaintenanceMode;