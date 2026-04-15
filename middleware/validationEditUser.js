const { check } = require("express-validator");
const { checkIfEmailExists } = require("../db/queries/userQueries");
const passwordRules = require("../config/passwordRules");

const emailUpdateAdminEditValidator = () =>
  check("email")
    // Sanitize by trimming and normalizing the email
    .trim() // Trim spaces before validation
    .normalizeEmail() // Normalize email to lowercase and remove unnecessary characters
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email, { req }) => {
      const targetId = req.params.id;
      const existingUser = await checkIfEmailExists(email, targetId);
      if (existingUser.length > 0) throw new Error("Email is already taken.");
      return true;
    });

const emailUpdateEditProfileValidator = () =>
  check("email")
    // Sanitize by trimming and normalizing the email
    .trim() // Trim spaces before validation
    .normalizeEmail() // Normalize email to lowercase and remove unnecessary characters
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email, { req }) => {
      const targetId = req.user.id;
      const existingUser = await checkIfEmailExists(email, targetId);
      if (existingUser.length > 0) throw new Error("Email is already taken.");
      return true;
    });

const passwordUpdateValidator = check("password")
  .optional({ checkFalsy: true })
  .custom((value) => {
    const hasMinLength = value.length >= passwordRules.minLength;
    const hasLower = /[a-z]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    // const hasSpecial = /[@$!%*?&]/.test(value);
    const hasSpecial = new RegExp("[" + passwordRules.specialChars + "]").test(
      value,
    ); // Fixed this line to correctly use the specialChars rule.
    if (!(hasMinLength && hasLower && hasUpper && hasNumber && hasSpecial)) {
      throw new Error("weak password, see below.");
    }
    return true;
  });

const confirmPasswordUpdateValidator = check("confirm_password")
  .optional({ checkFalsy: true })
  .custom((value, { req }) => {
    if (req.body.password && value !== req.body.password) {
      throw new Error("Passwords do not match.");
    }
    return true;
  });

// Dynamic array for update
const adminEditUserValidator = (userProfileId) => [
  emailUpdateAdminEditValidator(userProfileId),
  passwordUpdateValidator,
  confirmPasswordUpdateValidator,
];

const editProfileUserValidator = (userId) => [
  emailUpdateEditProfileValidator(userId),
  passwordUpdateValidator,
  confirmPasswordUpdateValidator,
];

module.exports = {
  adminEditUserValidator,
  editProfileUserValidator,
};
