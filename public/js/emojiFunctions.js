import { fetchCurrentUserData, fetchEmojiData } from "./dataFetchers.js";
import { openModal } from "./modalFunctions.js"


// TODO - MAJOR TODO! Refactor this file
 export async function handleEmojiOpen(targetId, sectionId, titleId) {
   try {
     console.log("handleModalOpen targetId:", targetId); // Debugging line

     // Check if targetId exists (not null or undefined)
     if (targetId != null && targetId !== "") {
       if (sectionId === "modal-change-avatar-user") {
         const currentUser = await fetchCurrentUserData(targetId);
         populateChangeAvatar(currentUser);
         openModal(sectionId, titleId);
         initChangeAvatarModal();
         console.log("modal-change-avatar-user");
       }
     }
   } catch (err) {
     console.error(err);
     alert("Failed to load user data");
   }
 }

async function populateChangeAvatar(user) {
  //Hide fields that are not mean to be used by a "guest"
  // UPDATE, guests are now allowed to have special avatars; previously only allowed to have the letter of their first name.
  // if (user.permission_status === "guest") {
  //   document
  //     .querySelector(".change-avatar-hide-element")
  //     .classList.add("hidden");
  // } else {
  //   document
  //     .querySelector(".change-avatar-hide-element")
  //     .classList.remove("hidden");
  // }

  // Access CSS variables
  const rootStyles = getComputedStyle(document.documentElement);
  // Use these values
  const avatarColorFg = rootStyles.getPropertyValue("--avatar-color-fg").trim();
  const avatarColorBgTop = rootStyles
    .getPropertyValue("--avatar-color-bg-top")
    .trim();
  const avatarColorBgBottom = rootStyles
    .getPropertyValue("--avatar-color-bg-bottom")
    .trim();
  document.getElementById("avatar-type-change-avatar").value =
    user.avatar_type || "";
  document.getElementById("avatar-color-fg-change-avatar").value =
    user.avatar_color_fg || avatarColorFg;
  document.getElementById("avatar-color-bg-top-change-avatar").value =
    user.avatar_color_bg_top || avatarColorBgTop;
  document.getElementById("avatar-color-bg-bottom-change-avatar").value =
    user.avatar_color_bg_bottom || avatarColorBgBottom;

  const currentAvatarElement = document.getElementById(
    "current-avatar-change-avatar",
  );
  if (currentAvatarElement) {
    currentAvatarElement.textContent = user.avatar_type || "";
    currentAvatarElement.style.color = user.avatar_color_fg || avatarColorFg;
    currentAvatarElement.style.background = `linear-gradient(5deg, ${user.avatar_color_bg_bottom || avatarColorBgBottom}, ${user.avatar_color_bg_top || avatarColorBgTop})`;
  }

  const avatarTypeText = document.getElementById(
    "avatar-type-text-change-avatar",
  );
  if (avatarTypeText) {
    avatarTypeText.textContent = await findInitialEmojiText(user.avatar_type);
  }

  // Call the emoji picker initialization
  emojiPickerDiv();
}

function initChangeAvatarModal() {
  const avatarInput = document.getElementById("avatar-type-change-avatar");
  const avatarColorPickerFg = document.getElementById(
    "avatar-color-fg-change-avatar",
  );
  const avatarColorPickerBgt = document.getElementById(
    "avatar-color-bg-top-change-avatar",
  );
  const avatarColorPickerBgb = document.getElementById(
    "avatar-color-bg-bottom-change-avatar",
  );
  const newAvatarElement = document.getElementById("new-avatar-change-avatar");

  // Exit safely if modal isn't present
  if (
    !avatarInput ||
    !avatarColorPickerFg ||
    !avatarColorPickerBgt ||
    !avatarColorPickerBgb ||
    !newAvatarElement
  ) {
    return;
  }

  function updateAvatarPreview() {
    newAvatarElement.textContent = avatarInput.value;
    newAvatarElement.style.color = avatarColorPickerFg.value;
    newAvatarElement.style.background = `
      linear-gradient(5deg,
        ${avatarColorPickerBgb.value},
        ${avatarColorPickerBgt.value}
      )`;
  }

  // Attach listeners once
  avatarInput.addEventListener("input", updateAvatarPreview);
  avatarColorPickerFg.addEventListener("input", updateAvatarPreview);
  avatarColorPickerBgt.addEventListener("input", updateAvatarPreview);
  avatarColorPickerBgb.addEventListener("input", updateAvatarPreview);

  // Run once on init so preview matches loaded values
  updateAvatarPreview();
}

let emojiMapSortedCache = null;

async function loadEmojis() {
  if (emojiMapSortedCache) return emojiMapSortedCache;

  const emojiData = await fetchEmojiData();
  const allEmojis = Object.values(emojiData).flat();

  const emojiMap = Object.fromEntries(allEmojis.map((e) => [e.text, e.emoji]));

  emojiMapSortedCache = Object.entries(emojiMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([text, emoji]) => ({ text, emoji }));

  return emojiMapSortedCache;
}

// Call the loadEmojis function to run it

async function findInitialEmojiText(avatarInputValue) {
  const emojiMapSorted = await loadEmojis(); // Wait for emoji data to load
  if (avatarInputValue) {
    const searchEmoji = avatarInputValue;
    const findEmojiText = emojiMapSorted.find((e) => e.emoji === searchEmoji);
    if (findEmojiText) {
      return findEmojiText.text;
    } else {
      return "No text found.";
    }
  }
  return "Invalid targetId."; // Optional: handle if targetId is not valid
}

async function emojiPickerDiv() {
  const emojiPanel = document.getElementById("emoji-panel-change-avatar");
  const emojiList = document.getElementById("emoji-list-change-avatar");

  if (!emojiPanel || !emojiList) return;

  // Load and sort the emoji data
  const emojiMapSorted = await loadEmojis(); // Ensure loadEmojis() is already optimized

  // Clear any existing options
  emojiList.innerHTML = "";

  // Create radio button options for each emoji
  emojiMapSorted.forEach((emoji, index) => {
    const emojiOption = document.createElement("div");
    emojiOption.classList.add("emoji-option");

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "emoji";
    input.id = `emoji-${index}`;
    input.value = emoji.emoji;
    input.dataset.text = emoji.text; // Use data-text to store the emoji text
    input.setAttribute("aria-label", emoji.text);

    const label = document.createElement("label");
    label.setAttribute("for", `emoji-${index}`);
    label.setAttribute("aria-labelledby", `emoji-${index}`);

    const span = document.createElement("span");
    span.className = "emoji";
    span.textContent = `${emoji.emoji}`;

    const p = document.createElement("p");
    p.textContent = ` - ${emoji.text}`;

    label.appendChild(span);
    label.appendChild(p);
    emojiOption.appendChild(input);
    emojiOption.appendChild(label);

    emojiList.appendChild(emojiOption);
  });

  // Handle radio button selection
  emojiList.addEventListener("change", (e) => {
    if (e.target.name === "emoji") {
      const selectedEmoji = e.target.value;
      const selectedText = e.target.dataset.text; // Access the data-text attribute
      // Perform the necessary action with selectedEmoji, e.g., updating the preview
      const avatarTypeText = document.getElementById(
        "avatar-type-text-change-avatar",
      );
      const avatarInput = document.getElementById("avatar-type-change-avatar");
      const newAvatarElement = document.getElementById(
        "new-avatar-change-avatar",
      );

      avatarTypeText.textContent = selectedText; // Set selected text
      avatarInput.value = selectedEmoji; // Set emoji value
      newAvatarElement.textContent = selectedEmoji; // Update preview
    }
  });
}
