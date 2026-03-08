const { Router } = require("express");
// const express = require("express");
const { requireRole } = require("../utils/permissions");
// const bcrypt = require("bcryptjs");

const {
  getCurrentUser,
  getHome,
  getSignUp,
  postSignUp,
  getLogIn,
  postLogIn,
  postLogOut,
  getYourProfile,
  getMemberDirectory,
  getInfo,
  getMessageBoards,
  getTopicNamesForDropdown,
  getTopicPage,
  getAdminPage,
  getAdminEditPage,
  getAdminCreatePage,
  getUserDetails,
  
} = require("../controllers/appControllers");

const appRouter = Router();
// appRouter.get("/current-user", requireRole("admin"), getCurrentUser);
appRouter.get("/current-user", getCurrentUser);
// appRouter.get("/current-user", getCurrentUser); // USE IN DEV
appRouter.get("/", getHome);
appRouter.get("/sign-up", getSignUp);
appRouter.post("/sign-up", postSignUp);
appRouter.get("/log-in", getLogIn);
appRouter.post("/log-in", postLogIn);
// appRouter.post("/log-out", postLogOut);
appRouter.post(
  "/log-out",
  (req, res, next) => {
    console.log("Logout form submitted");
    next();
  },
  postLogOut,
);

// TODO - Place protected routes together.

appRouter.get("/admin", requireRole("admin"), getAdminPage);
appRouter.get("/admin-edit/:id", requireRole("admin"), getAdminEditPage);
appRouter.get("/admin-create", requireRole("admin"), getAdminCreatePage);
// Ensure you add the route for this
// appRouter.get("/user/:id", getUserDetails);
// appRouter.get("/user/:id", requireRole("admin"), getUserDetails);
appRouter.get("/user/:id", getUserDetails);
appRouter.get("/info", getInfo);
appRouter.get("/message-boards", getMessageBoards);
// appRouter.get("/topics", requireRole("admin"), getTopicNamesForDropdown);
appRouter.get("/topics", getTopicNamesForDropdown);
appRouter.get("/message-boards/:slug", getTopicPage);
appRouter.get("/your-profile", getYourProfile);
appRouter.get("/member-directory", requireRole("member"), getMemberDirectory);

module.exports = appRouter;