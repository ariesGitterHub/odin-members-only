// This code was the primary way that guest status sign ups were being assigned an avatar prior, when the avatar_type in the user_profiles table was simply left "", as only members or high permission levels got to chose an avatar. Now, the first letter of the first name is grabbed on sign up and added to user_profiles avatar_type. To facilitate this, I added all 26 capital letters to the emoji database, so that newly minted members will have a "current" avatar rather than a blank space, as the prior code was unable to reach change-avatar.ejs with avatarLetter. This code will now be a backup for lag time or for unexpected edge cases (also, I fear that something might break). I may refactor this out at a later date.

function avatarTypeDefault(avatar_type, permission_status, first_name) {
  // permission_status === user or permission_status !== user && avatar_type === null/""
  if (
    permission_status === "guest" || !avatar_type
  ) {
    return first_name ? first_name.trim().charAt(0).toUpperCase() : "X";
  } else {
    return avatar_type;
  }
}

module.exports = { avatarTypeDefault };
