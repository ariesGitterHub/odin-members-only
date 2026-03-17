import {
  fetchUserData,
  fetchMessageData,
  fetchTopicNameData,
  fetchCurrentUserData,
  // fetchEmojiData,
} from "./dataFetchers.js";

import { handleEmojiOpen } from "./emojiFunctions.js"


// *** BASIC FUNCTIONS ***

// Open modal
export function openModal(sectionId, titleId) {
  const modal = document.getElementById("modal");
  if (!modal) return;

  // Hide all modal sections
  document.querySelectorAll(".modal-section").forEach((section) => {
    section.classList.add("hidden");
  });

  // Show the requested section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) targetSection.classList.remove("hidden");

  // Update the modal title for accessibility
  modal.setAttribute("aria-labelledby", titleId);

  // Show the modal itself
  modal.classList.remove("hidden");
}

// Close modal
function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

// Avatar elements required by other functions
// function requiredAvatarElements() {
//   const avatarInput = document.getElementById("avatar-type-change-avatar");
//   const avatarColorPickerFg = document.getElementById(
//     "avatar-color-fg-change-avatar",
//   );
//   const avatarColorPickerBgt = document.getElementById(
//     "avatar-color-bg-top-change-avatar",
//   );
//   const avatarColorPickerBgb = document.getElementById(
//     "avatar-color-bg-bottom-change-avatar",
//   );
//   const newAvatarElement = document.getElementById("new-avatar-change-avatar");

//   return {
//     avatarInput,
//     avatarColorPickerFg,
//     avatarColorPickerBgt,
//     avatarColorPickerBgb,
//     newAvatarElement,
//   };
// }

// Update the avatar preview, includes default colors
// function updateAvatarPreview({
//   avatarInput,
//   avatarColorPickerFg,
//   avatarColorPickerBgt,
//   avatarColorPickerBgb,
//   newAvatarElement,
// }) {
//   newAvatarElement.textContent = avatarInput.value;
//   newAvatarElement.style.color = avatarColorPickerFg.value;
//   newAvatarElement.style.background = `
//     linear-gradient(5deg,
//       ${avatarColorPickerBgb.value},
//       ${avatarColorPickerBgt.value}
//     )`;
// }


// *** EVENT LISTENER ATTACHERS

// Attach closeModal listener
export function attachCloseModalListener() {
  document.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });
}

// Attach openModal/handleModalOpen listener -> TODO - temp import handleEmojiOpen from emojiFunctions.js in here
export function attachOpenModalListener() {
  document.querySelectorAll("[data-target-id]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const { targetId, section, title } = e.currentTarget.dataset;
      console.log("Magic Number is:", targetId);
      handleModalOpen(targetId, section, title);
      handleEmojiOpen(targetId, section, title);
    });
  });  
}

// Attach listeners for the change-avatar.ejs preview
// export function attachAvatarPreviewListeners({
//   avatarInput,
//   avatarColorPickerFg,
//   avatarColorPickerBgt,
//   avatarColorPickerBgb,
//   updateAvatarPreview,
// }) {
//   avatarInput.addEventListener("input", () =>
//     updateAvatarPreview({
//       avatarInput,
//       // avatarColorPickerFg,
//       // avatarColorPickerBgt,
//       // avatarColorPickerBgb,
//       // newAvatarElement,
//     }),
//   );
//   avatarColorPickerFg.addEventListener("input", () =>
//     updateAvatarPreview({
//       avatarInput,
//       avatarColorPickerFg,
//       avatarColorPickerBgt,
//       avatarColorPickerBgb,
//       newAvatarElement,
//     }),
//   );
//   avatarColorPickerBgt.addEventListener("input", () =>
//     updateAvatarPreview({
//       avatarInput,
//       avatarColorPickerFg,
//       avatarColorPickerBgt,
//       avatarColorPickerBgb,
//       newAvatarElement,
//     }),
//   );
//   avatarColorPickerBgb.addEventListener("input", () =>
//     updateAvatarPreview({
//       avatarInput,
//       avatarColorPickerFg,
//       avatarColorPickerBgt,
//       avatarColorPickerBgb,
//       newAvatarElement,
//     }),
//   );
// }


// *** EVENT HANDLERS ***

// Open modal with an event
 export async function handleModalOpen(targetId, sectionId, titleId) {
   try {
     console.log("handleModalOpen targetId:", targetId); // Debugging line

     // Check if targetId exists (not null or undefined)
     if (targetId != null && targetId !== "") {
       if (sectionId === "modal-new-message") {
         const currentUser = await fetchCurrentUserData(targetId);
         const topic = await fetchTopicNameData();
         populateNewMessage(currentUser);
         populateNewMessageWithTopics(topic);
         openModal(sectionId, titleId);
       }

       if (sectionId === "modal-edit-profile") {
         const currentUser = await fetchCurrentUserData(targetId);
         console.log(JSON.stringify(currentUser.birthdate));
         populateEditProfileUser(currentUser);
         openModal(sectionId, titleId);
       }

      // TODO - Decide where this goes later, testing emoji/avatar related code in emojiFunctions.js
      //  if (sectionId === "modal-change-avatar-user") {
      //    const currentUser = await fetchCurrentUserData(targetId);
      //    populateChangeAvatar(currentUser);
      //    openModal(sectionId, titleId);
      //    initChangeAvatarModal();
      //    console.log("modal-change-avatar-user");
      //  }

       if (sectionId === "modal-warning-account-deletion") {
         const user = await fetchUserData(targetId);
         populateWarningAccountDeletion(user);
         openModal(sectionId, titleId);
         console.log("modal-warning-account-deletion");
       }

       if (sectionId === "modal-warning-message-deletion") {
         const message = await fetchMessageData(targetId);
         populateWarningMessageDeletion(message);
         openModal(sectionId, titleId);
         console.log("modal-warning-message-deletion");
       }
     }
   } catch (err) {
     console.error(err);
     alert("Failed to load user data");
   }
 }


  // *** MODAL POPULATORS ***

  // Populates the edit-profile.ejs partial modal with currentUser data
  function populateEditProfileUser(user) {
    document.getElementById("first-name-edit-profile").value = user.first_name;
    document.getElementById("last-name-edit-profile").value = user.last_name;
    document.getElementById("email-edit-profile").value = user.email;
    document.getElementById("phone-edit-profile").value = user.phone || "";

    // document.getElementById("birthdate-edit-profile").value = user.birthdate;

    // Format birthdate for input/display
    let rawBirthdate = user.birthdate;
    console.log(rawBirthdate);

    if (rawBirthdate.includes("T")) {
      rawBirthdate = rawBirthdate.split("T")[0];
    }

    console.log(rawBirthdate);
    document.getElementById("birthdate-edit-profile").value = rawBirthdate;
    // document.getElementById("password-edit-profile").value = user.password_hash;
    document.getElementById("street-address-edit-profile").value =
      user.street_address || "";
    document.getElementById("apt-unit-edit-profile").value =
      user.apt_unit || "";
    document.getElementById("city-edit-profile").value = user.city || "";
    document.getElementById("us-state-edit-profile").value =
      user.us_state || "";
    document.getElementById("zip-code-edit-profile").value =
      user.zip_code || "";

    console.log(user);
    console.log(user.birthdate);
  }

  // Populates the new-message.ejs partial modal with currentUser data
  function populateNewMessage(user) {
    document.getElementById("first-name-new-message").innerText =
      user.first_name;
    document.getElementById("last-name-new-message").innerText = user.last_name;
  }

  // Populates the new-message.ejs partial modal with topic data
  function populateNewMessageWithTopics(topics) {
    const select = document.getElementById("topic-new-message");

    // Clear existing options
    select.innerHTML = "";

    // Add placeholder option
    const placeholder = document.createElement("option");
    placeholder.value = ""; // empty value so "required" works
    placeholder.textContent = "Choose a topic";
    placeholder.disabled = true; // cannot select once another is chosen
    placeholder.selected = true; // initially selected
    select.appendChild(placeholder);

    // Add real topic options
    topics.forEach((topic) => {
      const option = document.createElement("option");
      option.className = "topic-new-message-option";
      option.value = topic.id;
      option.textContent = `➤ ${topic.name}`;
      select.appendChild(option);
    });

    // Ensure the <select> is required
    select.required = true;
  }

  // Populates the warning-account-deletion.ejs partial modal with user data
  function populateWarningAccountDeletion(user) {
    document.getElementById("first-name-warning-account-deletion").innerText =
      user.first_name;
    document.getElementById("last-name-warning-account-deletion").innerText =
      user.last_name;
    document.getElementById("email-warning-account-deletion").innerText =
      user.email;
  }

  // Populates the warning-message-deletion.ejs partial modal with user and topic data
  function populateWarningMessageDeletion(message) {
    document.getElementById("first-name-warning-message-deletion").innerText =
      message.first_name;
    document.getElementById("last-name-warning-message-deletion").innerText =
      message.last_name;
    document.getElementById("email-warning-message-deletion").innerText =
      message.email;
    document.getElementById("topic-name-warning-message-deletion").innerText =
      message.topic_name;
  }

  // Populates the change-avatar.ejs partial modal with currentUser data
  // async function populateChangeAvatar(user) {
  //   //Hide fields that are not mean to be used by a "guest"
  //   if (user.permission_status === "guest") {
  //     document
  //       .querySelector(".change-avatar-hide-element")
  //       .classList.add("hidden");
  //   } else {
  //     document
  //       .querySelector(".change-avatar-hide-element")
  //       .classList.remove("hidden");
  //   }

  //   // Access CSS variables
  //   const rootStyles = getComputedStyle(document.documentElement);
  //   // Use these values
  //   const avatarColorFg = rootStyles
  //     .getPropertyValue("--avatar-color-fg")
  //     .trim();
  //   const avatarColorBgTop = rootStyles
  //     .getPropertyValue("--avatar-color-bg-top")
  //     .trim();
  //   const avatarColorBgBottom = rootStyles
  //     .getPropertyValue("--avatar-color-bg-bottom")
  //     .trim();
  //   document.getElementById("avatar-type-change-avatar").value =
  //     user.avatar_type || "";
  //   document.getElementById("avatar-color-fg-change-avatar").value =
  //     user.avatar_color_fg || avatarColorFg;
  //   document.getElementById("avatar-color-bg-top-change-avatar").value =
  //     user.avatar_color_bg_top || avatarColorBgTop;
  //   document.getElementById("avatar-color-bg-bottom-change-avatar").value =
  //     user.avatar_color_bg_bottom || avatarColorBgBottom;

  //   const currentAvatarElement = document.getElementById(
  //     "current-avatar-change-avatar",
  //   );
  //   if (currentAvatarElement) {
  //     currentAvatarElement.textContent = user.avatar_type || "";
  //     currentAvatarElement.style.color = user.avatar_color_fg || avatarColorFg;
  //     currentAvatarElement.style.background = `linear-gradient(5deg, ${user.avatar_color_bg_bottom || avatarColorBgBottom}, ${user.avatar_color_bg_top || avatarColorBgTop})`;
  //   }

  //   const avatarTypeText = document.getElementById(
  //     "avatar-type-text-change-avatar",
  //   );
  //   if (avatarTypeText) {
  //     avatarTypeText.textContent = await findInitialEmojiText(user.avatar_type);
  //   }

  //   // Call the emoji picker initialization
  //   emojiPickerDiv();
  // }

  // EMOJI/AVATAR CODE

  //
  // function initChangeAvatarModal() {
  //   const {
  //     avatarInput,
  //     avatarColorPickerFg,
  //     avatarColorPickerBgt,
  //     avatarColorPickerBgb,
  //     newAvatarElement,
  //   } = requiredAvatarElements();

  //   // Exit safely if modal isn't present
  //   if (
  //     !avatarInput ||
  //     !avatarColorPickerFg ||
  //     !avatarColorPickerBgt ||
  //     !avatarColorPickerBgb ||
  //     !newAvatarElement
  //   ) {
  //     return;
  //   }

  //   // Attach event listeners
  //   attachAvatarPreviewListeners({
  //     avatarInput,
  //     avatarColorPickerFg,
  //     avatarColorPickerBgt,
  //     avatarColorPickerBgb,
  //     updateAvatarPreview,
  //   });

  //   // Run once on init so preview matches loaded values
  //   updateAvatarPreview({
  //     avatarInput,
  //     avatarColorPickerFg,
  //     avatarColorPickerBgt,
  //     avatarColorPickerBgb,
  //     newAvatarElement,
  //   });
  // }

  // let emojiMapSortedCache = null;

    // async function loadEmojis() {
    //   if (emojiMapSortedCache) return emojiMapSortedCache;

    //   const emojiData = await fetchEmojiData();
    //   const allEmojis = Object.values(emojiData).flat();

    //   const emojiMap = Object.fromEntries(
    //     allEmojis.map((e) => [e.text, e.emoji]),
    //   );

    //   emojiMapSortedCache = Object.entries(emojiMap)
    //     .sort((a, b) => a[0].localeCompare(b[0]))
    //     .map(([text, emoji]) => ({ text, emoji }));

    //   return emojiMapSortedCache;
    // }

    // async function findInitialEmojiText(avatarInputValue) {
    //     const emojiMapSorted = await loadEmojis(); // Wait for emoji data to load
    //     if (avatarInputValue) {
    //       const searchEmoji = avatarInputValue;
    //       const findEmojiText = emojiMapSorted.find(
    //         (e) => e.emoji === searchEmoji,
    //       );
    //       if (findEmojiText) {
    //         return findEmojiText.text;
    //       } else {
    //         return "No text found.";
    //       }
    //     }
    //     return "Invalid targetId."; // Optional: handle if targetId is not valid
    //   }

    // async function emojiPickerDiv() {
    //   const emojiPanel = document.getElementById("emoji-panel-change-avatar");
    //   const emojiList = document.getElementById("emoji-list-change-avatar");

    //   if (!emojiPanel || !emojiList) return;

    //   // Load and sort the emoji data
    //   const emojiMapSorted = await loadEmojis(); // Ensure loadEmojis() is already optimized

    //   // Clear any existing options
    //   emojiList.innerHTML = "";

    //   // Create radio button options for each emoji
    //   emojiMapSorted.forEach((emoji, index) => {
    //     const emojiOption = document.createElement("div");
    //     emojiOption.classList.add("emoji-option");

    //     const input = document.createElement("input");
    //     input.type = "radio";
    //     input.name = "emoji";
    //     input.id = `emoji-${index}`;
    //     input.value = emoji.emoji;
    //     input.dataset.text = emoji.text; // Use data-text to store the emoji text
    //     input.setAttribute("aria-label", emoji.text);

    //     const label = document.createElement("label");
    //     label.setAttribute("for", `emoji-${index}`);
    //     label.setAttribute("aria-labelledby", `emoji-${index}`);

    //     const span = document.createElement("span");
    //     span.className = "emoji";
    //     span.textContent = `${emoji.emoji}`;

    //     const p = document.createElement("p");
    //     p.textContent = ` - ${emoji.text}`;

    //     label.appendChild(span);
    //     label.appendChild(p);
    //     emojiOption.appendChild(input);
    //     emojiOption.appendChild(label);

    //     emojiList.appendChild(emojiOption);
    //   });

    //   // Handle radio button selection
    //   emojiList.addEventListener("change", (e) => {
    //     if (e.target.name === "emoji") {
    //       const selectedEmoji = e.target.value;
    //       const selectedText = e.target.dataset.text; // Access the data-text attribute
    //       // Perform the necessary action with selectedEmoji, e.g., updating the preview
    //       const avatarTypeText = document.getElementById(
    //         "avatar-type-text-change-avatar",
    //       );
    //       const avatarInput = document.getElementById(
    //         "avatar-type-change-avatar",
    //       );
    //       const newAvatarElement = document.getElementById(
    //         "new-avatar-change-avatar",
    //       );

    //       avatarTypeText.textContent = selectedText; // Set selected text
    //       avatarInput.value = selectedEmoji; // Set emoji value
    //       newAvatarElement.textContent = selectedEmoji; // Update preview
    //     }
    //   });
    // }
    


