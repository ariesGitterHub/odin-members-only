// const emojiData = require("../data/NotoEmoji.json");

// const getEmojiSubcategories = () => {
//   return [...new Set(emojiData.map((e) => e.subcategory))].sort();
// };

// const getEmojiBySubcategory = (subcategory) => {
//   return emojiData.filter((e) => e.subcategory === subcategory);
// };

// module.exports = {
//   getEmojiSubcategories,
//   getEmojiBySubcategory,
// };

// <input type="radio" name="avatar_emoji" value="😄"></input>

// const emojiText =
//   emojiData.find((e) => e.emoji === selectedEmoji)?.text ?? "Emoji not found";

// const selectedEmoji = "😃";

// const text = emojis.find(e => e.emoji === selectedEmoji)?.text;

// console.log(text); 
// "grinning face with big eyes"

// function emojiNameFinder(selectedEmoji) {
//   if (selectedEmoji) {
//     const emojiText = emojiData.find((e) => e.emoji === selectedEmoji)?.text;
//     return emojiText
//   } else {
//     return "emoji name not found."
//   }
// }

const emojiData = require("../data/NotoEmoji.json");

// function emojiNameFinder(selectedEmoji) {
//   if (!selectedEmoji) return "emoji name not found.";

//   // Flatten all category arrays into one big array
//   const allEmojis = Object.values(emojiData).flat();

//   // Find the emoji
//   return (
//     allEmojis.find((e) => e.emoji === selectedEmoji)?.text ??
//     "emoji name not found."
//   );
// }

// If this runs often, flattening every time is inefficient. Build a map once:
const allEmojis = Object.values(emojiData).flat();
const emojiMap = Object.fromEntries(allEmojis.map((e) => [e.emoji, e.text]));

function emojiNameFinder(selectedEmoji) {
  return emojiMap[selectedEmoji] ?? "emoji name not found.";
}

console.log(emojiNameFinder("🦁"));

module.exports = {
  // getEmojiSubcategories,
  // getEmojiBySubcategory,
  emojiNameFinder,
};