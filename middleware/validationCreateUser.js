const { check } = require("express-validator");
const { checkIfEmailExistsForSignUp } = require("../db/queries/userQueries.js");
const passwordRules = require('../config/passwordRules');

const expectedAnswer = process.env.INVITE_CODE;

const emailValidator = check("email")
  .isEmail()
  .withMessage("Invalid email format")
  .custom(async (email) => {
    const existingUser = await checkIfEmailExistsForSignUp(email);
    if (existingUser.length > 0) {
      throw new Error("Email is already taken.");
    }
    return true;
  })

const passwordValidator = [
  check("password").custom((value) => {
    const hasMinLength = value.length >= passwordRules.minLength;
    const hasLower = /[a-z]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    // const hasSpecial = /new RegExp [passwordRules.specialChar]/.test(value);
    const hasSpecial = new RegExp("[" + passwordRules.specialChars + "]").test(
      value,
    ); // Fixed this line to correctly use the specialChars rule.

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

// Validator for the invite code that will prevent bots from signing up
const inviteCodeValidator = check("invite_code")
  .custom((value) => {
    if (value.toLowerCase() !== expectedAnswer.toLowerCase()) {
      throw new Error("Incorrect invite code");
    }
    return true;
  });

// Export them individually or as groups
module.exports = {
  emailValidator,
  passwordValidator,
  confirmPasswordValidator,
  inviteCodeValidator,
  createUserValidator: [
    emailValidator,
    passwordValidator,
    confirmPasswordValidator,
    inviteCodeValidator
  ],
};
