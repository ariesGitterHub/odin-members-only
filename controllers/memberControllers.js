const { usStates } = require("../utils/usStates");

const {
  getUsers,
  // getUserById,
  updateUserToMember,
} = require("../db/queries/userQueries");


// CONTROLLER: GET MEMBER DIRECTORY PAGE

async function getMemberDirectory(req, res, next) {
  try {
    const users = await getUsers();

    res.render("member-directory", {
      title: "Member Directory",
      users,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}


// CONTROLLER: GET MEMBER INVITE PAGE

async function getMemberInvite(req, res, next) {
  try {
    // const targetId = req.user.id;
    // const currentUser = await getUserById(targetId);

    // const targetId = req.currentUser.id;
    const currentUser = req.currentUser;

    res.render("member-invite", {
      title: "Member Invite",
      // user: req.user,
      currentUser,
      formData: req.body || {},
      usStates: usStates, // Pass the array to the EJS template
    });
  } catch (err) {
    next(err);
  }
}

async function postMemberInviteAccepted(req, res, next) {
  // const targetId = req.user.id; // Always use logged-in user ID
  // const currentUser = await getUserById(targetId);

  const currentUserId = req.currentUser.id;
  const currentUser = req.currentUser;

  const {
    permission_status,
    invite_decision,
    phone,
    street_address,
    apt_unit,
    city,
    us_state,
    zip_code,
  } = req.body;

  const errors = [];

  const validStatuses = ["guest", "member", "admin"];
  if (!validStatuses.includes(permission_status)) {
    errors.push("Invalid permission status.");
  }

  if (errors.length > 0) {
    return res.render("member-invite", {
      title: "Member Invite",
      // user: req.user,
      currentUser,
      errors,
      formData: req.body || {},
      usStates: usStates, // Pass the array to the EJS template
    });
  }

  try {
    const sanitize = (v) => (v === "" ? null : v); // Empty strings -> null

    // --- Update the user ---
    await updateUserToMember(
      currentUserId,
      sanitize(permission_status),
      sanitize(invite_decision),
      sanitize(phone),
      sanitize(street_address),
      sanitize(apt_unit),
      sanitize(city),
      sanitize(us_state),
      sanitize(zip_code),
    );
    console.log("User inserted successfully");

    // Redirect after successful creation
    res.redirect("/app/your-profile");
    console.log("Redirected to /app/your-profile");
  } catch (err) {
    next(err);
  }
}

async function postMemberInviteDeclined(req, res, next) {
  console.log("Controller hit!");

  // const currentUser_id = req.user.id; // Always use logged-in user ID
    // const targetId = req.user.id; // Always use logged-in user ID
    // const currentUser = await getUserById(targetId);

    const currentUserId = req.currentUser.id;
    const currentUser = req.currentUser;

  const {
    invite_decision, // "declined"
  } = req.body;

  const errors = [];

  if (errors.length > 0) {
    return res.render("member-invite", {
      title: "Member Invite",
      // user: req.user,
      currentUser,
      errors,
      formData: req.body || {},
      usStates: usStates, // Pass the array to the EJS template
    });
  }

  try {
    const sanitize = (v) => (v === "" ? null : v); // Empty strings -> null

    // --- Update the user ---
    // Call the updated version of the function for only the fields you need to update.
    await updateUserToMember(
      currentUserId, // User ID
      null, // No change to permission_status
      sanitize(invite_decision), // "declined"
      null, // No change to phone
      null, // No change to street_address
      null, // No change to apt_unit
      null, // No change to city
      null, // No change to us_state
      null, // No change to zip_code
    );
    console.log("User updated successfully");

    // Redirect after successful creation
    res.redirect("/app/your-profile");
    console.log("Redirected to /app/your-profile");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMemberDirectory,
  getMemberInvite,
  postMemberInviteAccepted,
  postMemberInviteDeclined,
};
