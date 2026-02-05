const { Router } = require("express");

const { getHomePage } = require("../controllers/app.Controllers");

const appRouter = Router();

appRouter.get("/", getHomePage);

module.exports = appRouter;