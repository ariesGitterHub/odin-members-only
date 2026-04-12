// Fetch data with user.id
// export async function fetchUserData(targetId) {
//   const response = await fetch(`/app/user/${targetId}`);
//   if (!response.ok) throw new Error("Failed to fetch user");
//   return await response.json();
// }
// Fetch data with user.id
export async function fetchUserId(targetId) {
  const response = await fetch(`/app/user-id/${targetId}`);
  if (!response.ok) throw new Error("Failed to fetch user id");
  return await response.json();
}

// Fetch data with message.id
export async function fetchMessageData(targetId) {
  const response = await fetch(`/app/message/${targetId}`);
  if (!response.ok) throw new Error("Failed to fetch message");
  return await response.json();
}

// fetch data with topic.id
export async function fetchTopicNameData(targetId) {
  const response = await fetch("/app/topics");
  if (!response.ok) throw new Error("Failed to fetch topics");
  return await response.json();
}

// Fetch data with fullUser.id, TODO - FIX!!!! make this 
export async function fetchModalData(targetId) {
  const response = await fetch("/app/modal-fetch");
  if (!response.ok) throw new Error("Failed to fetch user for modal");
  const user = await response.json();
  return user;
}

// Fetch emoji data
export async function fetchEmojiData() {
  const response = await fetch("/data/NotoEmoji-edited-monochrome-only.json");
  if (!response.ok) throw new Error("Failed to fetch emoji data");
  return await response.json();
}

// Fetch maximum message characters from db
export async function fetchMaxChars() {
  const response = await fetch("/app/config/max-chars");
  if (!response.ok) throw new Error("Network response not ok");
  const data = await response.json();
  return data.maxChars ?? 708; // default to "708" if missing
} 
