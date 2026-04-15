const { usStates } = require("../utils/usStates");
const {
  getUsersForMemberDirectory,
  getUserForMemberInvite,
  updateUserToMember,
} = require("../db/queries/userQueries");

// CONTROLLER: GET MEMBER DIRECTORY PAGE
async function getMemberDirectory(req, res, next) {
  try {
    const userProfiles = await getUsersForMemberDirectory();

    res.render("member-directory", {
      title: "Member Directory",
      userProfiles,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

// CONTROLLER: GET MEMBER INVITE PAGE
async function getMemberInvite(req, res, next) {
  try {
    const userInviteData = await getUserForMemberInvite(req.user.id);

    res.render("member-invite", {
      title: "Member Invite",
      userInviteData,
      formData: userInviteData,
      usStates,
    });
  } catch (err) {
    next(err);
  }
}

// async function postMemberInviteAccepted(req, res, next) {
//   try {
//     if (!req.user) {
//       const err = new Error("Unauthorized");
//       err.status = 401;
//       err.code = "AUTH_REQUIRED";
//       return next(err);
//     }

//     const userId = req.user.id;

//     const {
//       permission_status,
//       invite_decision,
//       phone,
//       street_address,
//       apt_unit,
//       city,
//       us_state,
//       zip_code,
//     } = req.body;

//     const errors = [];

//     // NOTE - Only the following two validations matter due to possible tampering issues via frontend that could jeopardize db and/or permission_status integrity. It is not worth validating from phone to zip_code since there is no way to determine veracity, admin will have to cross-reference existing neighbor data to determine accuracy.

//     if (permission_status !== "member") {
//       errors.push("Invalid permission status");
//     }

//     if (invite_decision !== "accepted") {
//       errors.push("Invalid invite decision");
//     }

//     if (errors.length > 0) {
//       const userInviteData = await getUserForMemberInvite(userId);

//       return res.render("member-invite", {
//         title: "Member Invite",
//         userInviteData,
//         errors,
//         formData: req.body,
//         usStates,
//       });
//     }

//     // const sanitize = (v) => (v === "" ? null : v);
//     // const sanitize = (v) => (typeof v === "string" ? v.trim() : v);
//     const sanitize = (v) =>
//       typeof v === "string" ? (v.trim() === "" ? null : v.trim()) : v;

//     await updateUserToMember(
//       userId,
//       sanitize(permission_status),
//       sanitize(invite_decision),
//       sanitize(phone),
//       sanitize(street_address),
//       sanitize(apt_unit),
//       sanitize(city),
//       sanitize(us_state),
//       sanitize(zip_code),
//     );

//     return res.redirect("/app/your-profile");
//   } catch (err) {
//     next(err);
//   }
// }

async function postMemberInviteAccepted(req, res, next) {
  try {
    if (!req.user) {
      const err = new Error("Unauthorized");
      err.status = 401;
      err.code = "AUTH_REQUIRED";
      return next(err);
    }

    const userId = req.user.id;

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

    // NOTE - Only the following two validations matter due to possible tampering issues via frontend that could jeopardize db and/or permission_status integrity. It is not worth validating from phone to zip_code since there is no way to determine veracity, admin will have to cross-reference existing neighbor data to determine accuracy.

    if (permission_status !== "member") {
      errors.push("Invalid permission status");
    }

    if (invite_decision !== "accepted") {
      errors.push("Invalid invite decision");
    }

    if (errors.length > 0) {
      const userInviteData = await getUserForMemberInvite(userId);

      return res.render("member-invite", {
        title: "Member Invite",
        userInviteData,
        errors,
        formData: req.body,
        usStates,
      });
    }

    await updateUserToMember(
      userId,
      permission_status,
      invite_decision,
      phone,
      street_address,
      apt_unit,
      city,
      us_state,
      zip_code,
    );

    return res.redirect("/app/your-profile");
  } catch (err) {
    next(err);
  }
}

async function postMemberInviteDeclined(req, res, next) {
  try {
    const userId = req.user.id;

    const { invite_decision } = req.body; // Destructure invite_decision from the request body

    if (invite_decision !== "declined") {
      errors.push("Invalid invite decision");
    }

    await updateUserToMember(
      userId,
      null,
      "declined",
      null,
      null,
      null,
      null,
      null,
      null,
    );

    return res.redirect("/app/your-profile");
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
