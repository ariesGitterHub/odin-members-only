function addBirthdateFields(users, calculateAge, formatShortDate) {
  return users.map((user) => ({
    ...user,
    age: calculateAge(user.birthdate),
    formattedBirthdate: formatShortDate(user.birthdate),
  }));
}

function addSessionCreateDateFields(users, formatShortDate) {
  return users.map((user) => ({
    ...user,
    formattedCreateDate: formatShortDate(user.created_at),
  }));
}

function addSessionUpdateDateFields(users, formatShortDate) {
  return users.map((user) => ({
    ...user,
    formattedUpdateDate: formatShortDate(user.updated_at),
  }));
}

function addSessionLastLoginDateFields(users, formatShortDate) {
  return users.map((user) => ({
    ...user,
    formattedLastLoginDate: formatShortDate(user.last_login_at),
  }));
}

function addZodiacSigns(users, getZodiacSign) {
  return users.map((user) => ({
    ...user,
    zodiacSign: getZodiacSign(user.birthdate),
  }))
}

function addRealZodiacSigns(users, getRealZodiacSign) {
  return users.map((user) => ({
    ...user,
    realZodiacSign: getRealZodiacSign(user.birthdate),
  }));
}

function addChineseZodiacSigns(users, getChineseZodiacFull) {
  return users.map((user) => ({
    ...user,
    chineseZodiacSign: getChineseZodiacFull(user.birthdate),
  }));
}

// NOTE - This was previously used in the old set up where guest level permission statuses (i.e., lowest) were assigned the first letter of the first name as their avatar, all without touching the db. I later changed course and went in another direction.
// function addAvatarFields(items, avatarTypeDefault) {
//   return items.map((item) => ({
//     ...item,
//     avatarLetter: avatarTypeDefault(
//       item.avatar_type,
//       item.permission_status,
//       item.first_name,
//     ),
//   }));
// }

module.exports = {
  addBirthdateFields,
  addSessionCreateDateFields,
  addSessionUpdateDateFields,
  addSessionLastLoginDateFields,
  addZodiacSigns,
  addRealZodiacSigns,
  addChineseZodiacSigns,
  // addAvatarFields, // No longer needed
};
