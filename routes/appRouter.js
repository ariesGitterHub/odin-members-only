const { Router } = require("express");

const { getHome, getSignUp, getLogIn, getDashboard } = require("../controllers/app.Controllers");

const appRouter = Router();

appRouter.get("/", getHome);
appRouter.get("/sign-up", getSignUp);
appRouter.get("/log-in", getLogIn);
appRouter.get("/dashboard", getDashboard);

module.exports = appRouter;