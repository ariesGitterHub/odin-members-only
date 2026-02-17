function addDateFields(users, calculateAge, formatShortDate) {
  return users.map((user) => ({
    ...user,
    age: calculateAge(user.birthdate),
    formattedBirthdate: formatShortDate(user.birthdate),
  }));
}

function addAvatarFields(items, avatarTypeDefault) {
  return items.map((item) => ({
    ...item,
    avatarLetter: avatarTypeDefault(
      item.avatar_type,
      item.permission_status,
      item.first_name,
    ),
  }));
}

module.exports = {
  addDateFields,
  addAvatarFields,
};
