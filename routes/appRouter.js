const { Router } = require("express");
const express = require("express");
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
  getUpdateProfile,
  getChangeAvatar,
  getInfo,
  getMessageBoards,
  // getMessageBoardBySlug,
  getTopicPage,
  getBecomeMember,
  getAdmin,
  getUserDetails,
  
} = require("../controllers/appControllers");

const appRouter = Router();
// appRouter.get("/current-user", requireRole("admin"), getCurrentUser);
appRouter.get("/current-user", getCurrentUser); // USE IN DEV
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

appRouter.get("/admin", requireRole("admin"), getAdmin);
// Ensure you add the route for this
// appRouter.get("/user/:id", getUserDetails);
appRouter.get("/user/:id", getUserDetails);
appRouter.get("/info", getInfo);
appRouter.get("/message-boards", getMessageBoards);
appRouter.get("/message-boards/:slug", getTopicPage);

appRouter.get("/your-profile", getYourProfile);
appRouter.get("/member-directory", requireRole("member"), getMemberDirectory);

// appRouter.get("/update-profile", getUpdateProfile);
// appRouter.get("/change-avatar", getChangeAvatar);
// 
// appRouter.get("/become-member", getBecomeMember);

// appRouter.get("/log-out", postLogOut);



module.exports = appRouter;