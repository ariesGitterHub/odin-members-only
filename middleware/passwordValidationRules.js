// TODO - no longer needed...
const { check } = require("express-validator");

const passwordValidationRules = [
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

module.exports = { passwordValidationRules };
