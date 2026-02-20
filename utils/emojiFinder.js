const emojiData = require("../data/NotoEmoji.json");

const getEmojiSubcategories = () => {
  return [...new Set(emojiData.map((e) => e.subcategory))].sort();
};

const getEmojiBySubcategory = (subcategory) => {
  return emojiData.filter((e) => e.subcategory === subcategory);
};

module.exports = {
  getEmojiSubcategories,
  getEmojiBySubcategory,
};

// <input type="radio" name="avatar_emoji" value="😄"></input>