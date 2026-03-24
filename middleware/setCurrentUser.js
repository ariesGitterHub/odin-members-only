module.exports = ((req, res, next) => {
  if (req.user) {
    // Make a shallow copy
    const user = { ...req.user };

    // Add avatar info (reusing your helper)
    // const processedUser = addAvatarFields([user], avatarTypeDefault)[0];

    // Optionally format birthdate, age, or other profile fields
    // const processedUserWithBirthdate = addBirthdateFields(
    //   [processedUser],
    //   calculateAge,
    //   formatShortDate,
    // )[0];

    // res.locals.currentUser = processedUserWithBirthdate;
    // res.locals.currentUser = processedUser;
    res.locals.currentUser = user;
  } else {
    res.locals.currentUser = null;
  }

  next();
});
