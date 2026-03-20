const { Router } = require("express");
const { requireRole } = require("../utils/permissions");

// TODO - arrange by order of ROUTES far below
const {
  // Basic fetch
  getCurrentUser,
  getUserDetails,
  getMessageDetails,

  // No permission status needed
  getHome,
  getSignUp,
  postSignUp,
  getLogIn,
  postLogIn,

  // Admin permission status
  getAdminPage,
  getAdminCreatePage,
  postAdminCreatePage,
  deleteUserAccount,
  getAdminEditPage,
  postAdminEditPage,

  // Any user status
  getInfo,

  postNewMessage,
  getTopicNamesForDropdown,

  getMessageBoards,
  getTopicPage,

  postStickyMessageToggle,
  postReplyMessage,
  deleteUserMessage,
  postLikeMessageToggle,
  
  getYourProfilePage,
  deleteYourAccount,
  postYourProfilePageEdit,
  postYourProfilePageAvatar,
  getMemberDirectory, // Member status or higher
  postLogOut,

  // postBecomeMember,
} = require("../controllers/appControllers");

const appRouter = Router();

//TODO - keep or axe this if I am using fetch as needed?
// ROUTES: CURRENTUSER API 
appRouter.get("/current-user", requireRole("guest"), getCurrentUser);

//TODO - keep or axe this if I am using fetch as needed?
// ROUTES: USER ID API 
appRouter.get("/user/:id", requireRole("guest"), getUserDetails);

//TODO - keep or axe this if I am using fetch as needed?
// ROUTES: MESSAGES API 
appRouter.get("/message/:id", requireRole("guest"), getMessageDetails);

// ROUTES: INDEX/HOME (index.ejs)
appRouter.get("/", getHome);

// ROUTES: SIGN UP PAGE (sign-up.ejs)
appRouter.get("/sign-up", getSignUp);
appRouter.post("/sign-up", postSignUp);

// ROUTES: LOG IN PAGE (log-in.ejs)
appRouter.get("/log-in", getLogIn);
appRouter.post("/log-in", postLogIn);

// TODO - make uniform like other routes?
// ROUTES: LOG OUT BUTTON
appRouter.post("/log-out", (req, res, next) => {
    console.log("Logout form submitted");
    next();
  },
  postLogOut,
);

// ROUTES: ADMIN PAGE (admin.ejs) 
appRouter.get("/admin", requireRole("admin"), getAdminPage);

// ROUTE: DELETE ACCOUNT MODAL (warning-account-deletion.ejs)
appRouter.post("/admin/delete-user-account", requireRole("admin"), deleteUserAccount);

// ROUTES: ADMIN CREATE PAGE (admin-create.ejs) 
appRouter.get("/admin-create", requireRole("admin"), getAdminCreatePage);
appRouter.post("/admin-create", requireRole("admin"), postAdminCreatePage);

// ROUTES: ADMIN EDIT PAGE (admin-edit.ejs) 
appRouter.get("/admin-edit/:id", requireRole("admin"), getAdminEditPage);
appRouter.post("/admin-edit/:id", requireRole("admin"), postAdminEditPage);

// ROUTES: SITE INFO PAGE (info.ejs)
appRouter.get("/info", requireRole("guest"), getInfo);

// ROUTES: NEW MESSAGE MODAL (new-message.ejs)
appRouter.post("/new-message", requireRole("guest"), postNewMessage);

// ROUTES: TOPICS API USED NEW MESSAGE DROPDOWN 
appRouter.get("/topics", requireRole("guest"), getTopicNamesForDropdown);

// ROUTES: MESSAGE BOARDS PAGE 
appRouter.get("/message-boards", requireRole("guest"), getMessageBoards);

// ROUTES: MESSAGE BOARDS BY TOPIC SLUG PAGE (message-boards.ejs by topic slug)
appRouter.get("/message-boards/:slug", requireRole("guest"), getTopicPage);

// ROUTEs: STICKY MESSAGE TOGGLE (new-message.ejs)
appRouter.post("/message-boards/sticky-message", requireRole("guest"), postStickyMessageToggle);

// ROUTES: DELETE MESSAGE MODAL (warning-message-deletion.ejs)
appRouter.post("/message-boards/delete-message", requireRole("guest"), deleteUserMessage);

// ROUTES: REPLY MESSAGE MODAL (reply-message.ejs)
appRouter.post("/message-boards/reply-message", requireRole("guest"), postReplyMessage);

// ROUTES: LIKE MESSAGE (message-boards.ejs by topic slug)
appRouter.post("/message-boards/like-message", postLikeMessageToggle);

// ROUTES: YOUR PROFILE PAGE (your-profile.ejs)
appRouter.get("/your-profile", requireRole("guest"), getYourProfilePage);

// ROUTE: DELETE YOUR ACCOUNT MODAL (warning-account-deletion.ejs)
appRouter.post("/your-profile/delete-your-account", requireRole("guest"), deleteYourAccount);

// ROUTES: EDIT PROFILE MODAL (edit-profile.ejs)
appRouter.post("/your-profile/edit-profile", requireRole("guest"), postYourProfilePageEdit);

// ROUTES: CHANGE AVATAR MODAL (change-avatar.ejs)
appRouter.post("/your-profile/change-avatar", requireRole("guest"), postYourProfilePageAvatar);

// ROUTE: MEMBER DIRECTOR PAGE (member-directory.ejs) 
appRouter.get("/member-directory", requireRole("member"), getMemberDirectory);

// appRouter.post("/your-profile/become-member", requireRole("guest"), postBecomeMember);
// appRouter.post("/admin-create", requireRole("admin"), postAdminCreatePage);


module.exports = appRouter;