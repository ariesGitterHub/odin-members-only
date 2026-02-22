const { Router } = require("express");

const {
  getHome,
  getSignUp,
  getLogIn,
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
  postLogOut,
} = require("../controllers/appControllers");

const appRouter = Router();

appRouter.get("/", getHome);
appRouter.get("/sign-up", getSignUp);
appRouter.get("/log-in", getLogIn);
appRouter.get("/admin", getAdmin);
// Ensure you add the route for this
// appRouter.get("/user/:id", getUserDetails);
appRouter.get("/user/:id", getUserDetails);
appRouter.get("/info", getInfo);
appRouter.get("/message-boards", getMessageBoards);
appRouter.get("/message-boards/:slug", getTopicPage);

appRouter.get("/your-profile", getYourProfile);
// appRouter.get("/update-profile", getUpdateProfile);
// appRouter.get("/change-avatar", getChangeAvatar);
// appRouter.get("/member-directory", getMemberDirectory);
// appRouter.get("/become-member", getBecomeMember);

appRouter.get("/log-out", postLogOut);

module.exports = appRouter;