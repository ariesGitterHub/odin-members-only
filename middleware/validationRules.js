const { check } = require("express-validator");
const { checkIfEmailExistsForSignUp, checkIfEmailExists } = require("../db/queries.js");

// Use on any form that has email, password, and confirm_password

const emailNewUserValidator = check("email")
  .isEmail()
  .withMessage("Invalid email format")
  .custom(async (email) => {
    const existingUser = await checkIfEmailExistsForSignUp(email);
    if (existingUser.length > 0) {
      throw new Error("Email is already taken.");
    }
    return true;
  });

const emailEditUserValidator = check("email")
  .isEmail()
  .withMessage("Invalid email format")
  .custom(async (email) => {
    const existingUser = await checkIfEmailExists(email);
    if (existingUser.length > 0) {
      throw new Error("Email is already taken.");
    }
    return true;
  });

const passwordValidator = [
  check("password").custom((value) => {
    const hasMinLength = value.length >= 16;
    const hasLower = /[a-z]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[@$!%*?&]/.test(value);
    if (!(hasMinLength && hasLower && hasUpper && hasNumber && hasSpecial)) {
      throw new Error("weak password, see below.");
    }
    return true;
  }),
  check("confirm_password").custom((value, { req }) => {
    if (value !== req.body.password) throw new Error("passwords do not match.");
    return true;
  }),
  check("email").isEmail().withMessage("invalid email format"),
];

const confirmPasswordValidator = check("confirm_password").custom(
  (value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match.");
    }
    return true;
  },
);

// Export them individually or as groups
module.exports = {
  emailNewUserValidator,
  emailEditUserValidator,
  passwordValidator,
  confirmPasswordValidator,
  createUserValidation: [
    emailNewUserValidator,
    passwordValidator,
    confirmPasswordValidator,
  ],
  editUserValidation: [
    emailEditUserValidator,
    passwordValidator,
    confirmPasswordValidator,
  ],
};
