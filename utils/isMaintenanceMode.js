const { getAllSiteControls } = require("../db/queries/appConfigQueries");

async function isMaintenanceMode() {
  const siteSettings = await getAllSiteControls();
  const isMaintenanceModeEnv = process.env.MAINTENANCE_MODE === "true";
  const isMaintenanceModeDb =
    siteSettings.maintenance_mode === true ||
    siteSettings.maintenance_mode === "true";
  const isMaintenanceModeActive = isMaintenanceModeEnv || isMaintenanceModeDb;
return isMaintenanceModeActive;
}

module.exports = { isMaintenanceMode };
