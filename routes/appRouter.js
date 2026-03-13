const { Router } = require("express");
// const express = require("express");
const { requireRole } = require("../utils/permissions");
// const bcrypt = require("bcryptjs");

const {
  getCurrentUser,
  getUserDetails,
  getMessageDetails,

  getHome,
  getSignUp,
  postSignUp,
  getLogIn,
  postLogIn,
  postLogOut,
  getYourProfilePage,
  postYourProfilePageEdit,
  postYourProfilePageAvatar,
  getMemberDirectory,
  getInfo,
  postNewMessage,
  getMessageBoards,
  getTopicNamesForDropdown,
  getTopicPage,
  getAdminPage,
  getAdminCreatePage,
  postAdminCreatePage,
  getAdminEditPage,
  postAdminEditPage,

  deleteUserAccount,
  deleteYourAccount,
  deleteUserMessage,
} = require("../controllers/appControllers");

const appRouter = Router();

// appRouter.post("/admin-create", async (req, res) => {
//   console.log("POST /admin-create hit!");
//   console.log("req.body:", req.body);
//   res.send("Test"); // temporary
// });

// appRouter.get("/current-user", requireRole("admin"), getCurrentUser);
appRouter.get("/current-user", requireRole("guest"), getCurrentUser);
// appRouter.get("/current-user", getCurrentUser); // USE IN DEV
appRouter.get("/user/:id", requireRole("guest"), getUserDetails);
appRouter.get("/message/:id", requireRole("guest"), getMessageDetails);


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

// ROUTES: ADMIN PAGE (admin.ejs) 

appRouter.get("/admin", requireRole("admin"), getAdminPage);

// ROUTES: ADMIN CREATE PAGE (admin-create.ejs) 

appRouter.get("/admin-create", requireRole("admin"), getAdminCreatePage);
appRouter.post("/admin-create", requireRole("admin"), postAdminCreatePage);

// ROUTES: ADMIN EDIT PAGE (admin-edit.ejs) 

appRouter.get("/admin-edit/:id", requireRole("admin"), getAdminEditPage);
appRouter.post("/admin-edit/:id", requireRole("admin"), postAdminEditPage);


appRouter.get("/info", requireRole("guest"), getInfo);
appRouter.post("/new-message", requireRole("guest"), postNewMessage);
// appRouter.post("/message-boards/:slug/delete-message", requireRole("guest"), deleteUserMessage);
// appRouter.post("/delete-message", requireRole("guest"), deleteUserMessage);
appRouter.post("/message-boards/delete-message", requireRole("guest"), deleteUserMessage);
// appRouter.post("/message-boards/delete-message", deleteUserMessage);

// appRouter.post("/message-boards/:slug/delete-message", requireRole("guest"), deleteUserMessage);

appRouter.get("/message-boards", requireRole("guest"), getMessageBoards);
appRouter.get("/topics", requireRole("guest"), getTopicNamesForDropdown);
appRouter.get("/message-boards/:slug", requireRole("guest"), getTopicPage);

appRouter.get("/your-profile", requireRole("guest"), getYourProfilePage);
appRouter.post("/your-profile/edit-profile", requireRole("guest"), postYourProfilePageEdit);
appRouter.post("/your-profile/change-avatar", requireRole("guest"), postYourProfilePageAvatar);

appRouter.get("/member-directory", requireRole("member"), getMemberDirectory);

// appRouter.post("/admin/delete-user", deleteUserAccount);
// appRouter.post("/your-profile/delete-your-account", deleteYourAccount);
appRouter.post("/admin/delete-user-account", requireRole("admin"), deleteUserAccount);
appRouter.post("/your-profile/delete-your-account", requireRole("guest"), deleteYourAccount);

// appRouter.post("/admin-create", requireRole("admin"), postAdminCreatePage);


module.exports = appRouter;