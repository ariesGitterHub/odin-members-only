const { Router } = require("express");

const {
  getHome,
  getSignUp,
  getLogIn,
  getDashboard,
  getMemberDirectory,
  getUpdateProfile,
  getChangeAvatar,
  getInfo,
  getMessageBoard, 
  getBecomeMember,
  getAdmin,
  postLogOut,
} = require("../controllers/app.Controllers");

const appRouter = Router();

appRouter.get("/", getHome);
appRouter.get("/sign-up", getSignUp);
appRouter.get("/log-in", getLogIn);
appRouter.get("/dashboard", getDashboard);
appRouter.get("/member-directory", getMemberDirectory);
appRouter.get("/update-profile", getUpdateProfile);
appRouter.get("/change-avatar", getChangeAvatar);
appRouter.get("/info", getInfo);
appRouter.get("/message-board", getMessageBoard);
appRouter.get("/become-member", getBecomeMember);
appRouter.get("/admin", getAdmin);
appRouter.get("/log-out", postLogOut);

module.exports = appRouter;