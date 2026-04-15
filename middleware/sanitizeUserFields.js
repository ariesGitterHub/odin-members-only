// sanitize.js
const { body } = require("express-validator");

// This function will sanitize the fields dynamically
const sanitizeUserFields = (fields = []) => {
  return fields.map((field) => {
    switch (field.type) {
      case "string":
        return body(field.name).trim().escape().optional();
    //   case "email": // not needed, validationCreateUser and validationEditUser handle this
    //     return body(field.name).normalizeEmail().trim().escape().optional();
      case "phone":
        return body(field.name).optional().trim().escape();
      case "number":
        return body(field.name).optional().isNumeric().toInt();
      case "date":
        return body(field.name).optional().trim().escape(); // Treat birthdate as string for safety
      case "boolean":
        return body(field.name)
          .optional()
          .custom((value) => {
            // Convert various representations of booleans into true/false
            if (value === "true" || value === "1" || value === "on" || value === true) {
              return true;
            } else if (value === "false" || value === "0" || value === "off" || value === false) {
              return false;
            }
            return null; // Return null if it's an invalid boolean input
          });
              // Handling avatar type and colors
      case "avatar":
        if (field.name === "avatar_type") {
          return body(field.name).trim().escape().optional(); // Sanitize avatar_type (emoji or predefined identifier)
        }
        if (field.name === "avatar_color_fg" || field.name === "avatar_color_bg_top" || field.name === "avatar_color_bg_bottom") {
          return body(field.name)
            .optional()
            .isHexColor() // Ensure it's a valid hex color code
            .trim();
        }
      default:
        return body(field.name).trim().escape().optional();
    }
  });
};

module.exports = sanitizeUserFields;


//   sanitizeUserFields([
//     { name: 'first_name', type: 'string' },
//     { name: 'last_name', type: 'string' },
//     { name: 'email', type: 'email' },
//     { name: 'phone', type: 'phone' }, // Optional, if you have phone input
//   ]),