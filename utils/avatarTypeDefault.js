// This code was the primary way that all new sign ups, who begin as guests, were being assigned an initial first_name letter for their avatar picture. This meant that when the avatar_type in the user_profiles table was simply left '', as only members or high permission levels got to change their letter initial to a proper emoji avatar. Now, the first letter of the first name is grabbed on sign up DIRECTLY and added to user_profiles avatar_type. To facilitate this, I added all 26 capital letters to the emoji database (such a nice workaround), so that newly minted members will have a "current" avatar in avatar_type, rather than a blank space, as the prior code was unable to reach change-avatar.ejs with avatarLetter. This code will now be a backup for lag time or for unexpected edge cases (also, I fear that something might break). I may refactor this out at a later date.

// 2026.03.14, well it's a later date, because, weird issues starting making emojis vanish in the header nav profile button. The glitch seems to be coming from avatarLetter not getting read soon enough. Not sure for certain, but it's time for this old code to go. 🤨

// KEEP JUST IN CASE SOMETHING ELSE IS DISCOVERED TO HAVE BROKEN

// function avatarTypeDefault(avatar_type, permission_status, first_name) {
//   if (
//     permission_status === "guest" || !avatar_type
//   ) {
//     return first_name ? first_name.trim().charAt(0).toUpperCase() : "X";
//   } else {
//     return avatar_type;
//   }
// }

// module.exports = { avatarTypeDefault };
