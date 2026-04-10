const { usStates } = require("../utils/usStates");

const { 
  // getUsers,
  getUsersForMemberDirectory,
  getUserForMemberInvite,
   updateUserToMember
   } = require("../db/queries/userQueries");

// CONTROLLER: GET MEMBER DIRECTORY PAGE

async function getMemberDirectory(req, res, next) {
  try {
    const users = await getUsersForMemberDirectory();

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
  const user = await getUserForMemberInvite(req.user.id);

    res.render("member-invite", {
      title: "Member Invite",
      user,
      formData: req.body || {},
      usStates: usStates, // Pass the array to the EJS template
    });
  } catch (err) {
    next(err);
  }
}

async function postMemberInviteAccepted(req, res, next) {
  const userId = req.user.id;  
  const user = await getUserForMemberInvite(userId);

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
      user,
      errors,
      formData: req.body || {},
      usStates: usStates, // Pass the array to the EJS template
    });
  }

  try {
    const sanitize = (v) => (v === "" ? null : v); // Empty strings ---> null

    // --- Update the user ---
    await updateUserToMember(
      userId,
      sanitize(permission_status),
      sanitize(invite_decision),
      sanitize(phone),
      sanitize(street_address),
      sanitize(apt_unit),
      sanitize(city),
      sanitize(us_state),
      sanitize(zip_code),
    );

    // Redirect after successful creation
    res.redirect("/app/your-profile");
  } catch (err) {
    next(err);
  }
}

async function postMemberInviteDeclined(req, res, next) {
  const userId = req.user.id;
  const user = await getUsersForMemberInvite(userId);

  const {
    invite_decision, // "declined"
  } = req.body;

  const errors = [];

  if (errors.length > 0) {
    return res.render("member-invite", {
      title: "Member Invite",
      user,
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
      userId, // User ID
      null, // No change to permission_status
      sanitize(invite_decision), // "declined"
      null, // No change to phone
      null, // No change to street_address
      null, // No change to apt_unit
      null, // No change to city
      null, // No change to us_state
      null, // No change to zip_code
    );

    // Redirect after successful creation
    res.redirect("/app/your-profile");
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
