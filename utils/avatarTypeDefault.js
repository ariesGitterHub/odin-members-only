function avatarTypeDefault(avatar_type, permission_status, first_name) {
  // permission_status === user or permission_status !== user && avatar_type === null/""
  if (
    permission_status === "user" || !avatar_type
  ) {
    return first_name ? first_name.trim().charAt(0).toUpperCase() : "X";
  } else {
    return avatar_type;
  }
}

// function avatarTypeDefault(avatar_type, permission_status, first_name) {
//   // fallback emoji if something unexpected happens
//   const fallback = "🐈";

//   if (!first_name) first_name = fallback;

//   // If user is a regular "user" or avatar_type is missing
//   if (permission_status === "user" || !avatar_type) {
//     return first_name.trim().charAt(0).toUpperCase();
//   }

//   // If avatar_type exists, use it; otherwise fallback to first letter
//   return avatar_type || first_name.trim().charAt(0).toUpperCase();
// }


module.exports = { avatarTypeDefault };
