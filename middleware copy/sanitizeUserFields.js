const { body } = require("express-validator");

// This function will sanitize the fields dynamically
const sanitizeUserFields = (fields = []) => {
  return fields.map((field) => {
    switch (field.type) {
      case "string":
        return body(field.name).trim().escape().optional();

      // Not needed, other middleware, validationCreateUser and validationEditUser,  handle this task
      //   case "email":
      //     return body(field.name).normalizeEmail().trim().escape().optional();
      case "phone":
        return body(field.name).optional().trim().escape();
      case "number":
        return body(field.name).optional().isNumeric().toInt();
      case "date":
        return body(field.name).optional().trim().escape(); // Treat birthdate as string for safety

      // Boolean case not working as expected, reverting back to sanitizing in postAdminEditPage controller
      // case "boolean":
      //   return body(field.name)
      //     .optional()
      //     .custom((value) => {
      //       if (value === undefined || value === null ) {
      //         console.log("Returning null for invalid input");
      //         return null
      //       }
      //       // Convert various representations of booleans into true/false
      //       if (value === "true" || value === "1" || value === "on" || value === true) {
      //         console.log("Converted to true");
      //         return true;
      //       } else if (value === "false" || value === "0" || value === "off" || value === false) {
      //         console.log("Converted to false");
      //         return false;
      //       }
      //     });

      // Not using below, just keep it simple and use "string" case
      // case "avatar":
      //   if (field.name === "avatar_type") {
      //     return body(field.name).trim().escape().optional(); // Sanitize avatar_type (emoji or predefined identifier)
      //   } // The fields below are not working properly
      //   if (field.name === "avatar_color_fg" || field.name === "avatar_color_bg_top" || field.name === "avatar_color_bg_bottom") {
      //     return body(field.name)
      //       .optional()
      //       .isHexColor() // Ensure it's a valid hex color code
      //       .trim();
      //   }

      default:
        return body(field.name).trim().escape().optional();
    }
  });
};

module.exports = sanitizeUserFields;
