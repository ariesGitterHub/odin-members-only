const emojiData = require("../data/NotoEmoji.json");

// If this runs often, flattening every time is inefficient. Build a map once:
const allEmojis = Object.values(emojiData).flat();
const emojiMap = Object.fromEntries(allEmojis.map((e) => [e.emoji, e.text]));

function emojiNameFinder(selectedEmoji) {
  return emojiMap[selectedEmoji] ?? "emoji name not found.";
}

console.log(emojiNameFinder("🦁"));

module.exports = {
  emojiNameFinder,
};
