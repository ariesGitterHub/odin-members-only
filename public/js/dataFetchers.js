// Fetch data ith user.id
export async function fetchUserData(targetId) {
  const response = await fetch(`/app/user/${targetId}`);
  if (!response.ok) throw new Error("Failed to fetch user");
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

// Fetch data with currentUser.id
export async function fetchCurrentUserData(targetId) {
  const response = await fetch("/app/current-user");
  if (!response.ok) throw new Error("Failed to fetch user");
  const user = await response.json();
  console.log("Current user:", user);
  return user;
}

  // Fetch emoji data
export async function fetchEmojiData() {
    const response = await fetch("/data/NotoEmoji-edited-monochrome-only.json");
    if (!response.ok) throw new Error("Failed to fetch user");
    return await response.json();
  }
