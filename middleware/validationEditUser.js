const { check } = require("express-validator");
const { checkIfEmailExists } = require("../db/queries/userQueries");

const emailUpdateAdminEditValidator = () =>
  check("email")
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
      .isEmail()
      .withMessage("Invalid email format")
      .custom(async (email, { req }) => {
        const targetId = req.user.id;
        const existingUser = await checkIfEmailExists(email, targetId);
        if (existingUser.length > 0)
          throw new Error("Email is already taken.");
        return true;
      });

const passwordUpdateValidator = check("password")
  .optional({ checkFalsy: true })
  .custom((value) => {
    const hasMinLength = value.length >= 12; // TODO - use env?
    const hasLower = /[a-z]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[@$!%*?&]/.test(value);
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
const adminEditUserValidator = (userId) => [
  emailUpdateAdminEditValidator(userId),
  passwordUpdateValidator,
  confirmPasswordUpdateValidator,
];

const editProfileUserValidator = (currentUserId) => [
  emailUpdateEditProfileValidator(currentUserId),
  passwordUpdateValidator,
  confirmPasswordUpdateValidator,
];

module.exports = {
  adminEditUserValidator,
  editProfileUserValidator,
};