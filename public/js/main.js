// import DOMPurify from "dompurify";
// const DOMPurify = require("dompurify");

document.addEventListener("DOMContentLoaded", () => {
  // TOGGLE HIDDEN ON ADMIN PANEL FOR...
  // Toggle .hidden for all "guest cards" on admin panel
  document.querySelectorAll(".guest-card").forEach((card) => {
    const showGuests = document.querySelector("#show-guests-button");
    showGuests.addEventListener("click", () => {
      card.classList.toggle("hidden");
      card.classList.contains("hidden")
        ? (showGuests.textContent = "open guest profiles")
        : (showGuests.textContent = "close guest profiles");
    });
  });

  // Toggle .hidden for all "member cards" on admin panel
  document.querySelectorAll(".member-card").forEach((card) => {
    const showMembers = document.querySelector("#show-members-button");
    showMembers.addEventListener("click", () => {
      card.classList.toggle("hidden");
      card.classList.contains("hidden")
        ? (showMembers.textContent = "open member profiles")
        : (showMembers.textContent = "close member profiles");
    });
  });

  // Toggle .hidden for that profile's details on admin panel
  document.querySelectorAll(".show-profile-button").forEach((btn) => {
    btn.addEventListener("click", () => {
      // const profileData = btn.closest(".profile-data")
      const profileData = btn.closest(".card").querySelector(".profile-data");
      profileData.classList.toggle("hidden");
      profileData.classList.contains("hidden")
        ? (btn.textContent = "open this profile")
        : (btn.textContent = "close this profile");
    });
  });

  // OPEN/CLOSE MODALS ACROSS VARIOUS PAGES...

  function openModal(sectionId, titleId) {
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

  function closeModal() {
    document.getElementById("modal").classList.add("hidden");
  }

  // Close via overlay or button
  document.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  // openModal/closeModal eventListeners - STOP USING; TODO - MAKE NEW EVENT LISTENER FOR become-member, etc.
  // document.querySelectorAll(".open-modal-btn").forEach((btn) => {
  //   btn.addEventListener("click", () => {
  //     const sectionId = btn.dataset.section;
  //     const titleId = btn.dataset.title;
  //     openModal(sectionId, titleId);
  //   });
  // });

  // FETCH DATA WITH USER.ID...
  async function getUserData(userId) {
    const response = await fetch(`/app/user/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch user");
    return await response.json();
  }

  // POPULATE MODAL FIELDS (UNIVERSALLY) WITH USER.ID DATA FROM DB...

  function populateEditProfileAdmin(user) {
    document.getElementById("first_name").value = user.first_name;
    document.getElementById("last_name").value = user.last_name;
    document.getElementById("verified_by_admin").value = user.verified_by_admin;
    document.getElementById("permission_status").value = user.permission_status;
    document.getElementById("upgrade_request").value = user.member_request;
    document.getElementById("email").value = user.email;
    document.getElementById("phone").value = user.phone || "";
    document.getElementById("birthdate").value = user.birthdate;
    document.getElementById("street_address").value = user.street_address || "";
    document.getElementById("apt_unit").value = user.apt_unit || "";
    document.getElementById("city").value = user.city || "";
    document.getElementById("us_state").value = user.us_state || "";
    document.getElementById("zip_code").value = user.zip_code || "";
    document.getElementById("notes").value = user.notes || "";
  }

  async function populateChangeAvatar(user) {
    //Hide fields that are not mean to be used by a "guest"
    if (user.permission_status === "guest") {
      document
        .querySelector(".change-avatar-hide-element")
        .classList.add("hidden");
    } else {
      document
        .querySelector(".change-avatar-hide-element")
        .classList.remove("hidden");
    }

    // Access CSS variables
    const rootStyles = getComputedStyle(document.documentElement);
    // Use these values in your JavaScript
    const avatarColorFg = rootStyles
      .getPropertyValue("--avatar-color-fg")
      .trim();
    const avatarColorBgTop = rootStyles
      .getPropertyValue("--avatar-color-bg-top")
      .trim();
    const avatarColorBgBottom = rootStyles
      .getPropertyValue("--avatar-color-bg-bottom")
      .trim();
    document.getElementById("avatar_type").value = user.avatar_type || "";
    document.getElementById("avatar_color_fg").value =
      user.avatar_color_fg || avatarColorFg;
    document.getElementById("avatar_color_bg_top").value =
      user.avatar_color_bg_top || avatarColorBgTop;
    document.getElementById("avatar_color_bg_bottom").value =
      user.avatar_color_bg_bottom || avatarColorBgBottom;

    const currentAvatarElement = document.getElementById("current_avatar");
    if (currentAvatarElement) {
      currentAvatarElement.textContent = user.avatar_type || "";
      currentAvatarElement.style.color = user.avatar_color_fg || avatarColorFg;
      currentAvatarElement.style.background = `linear-gradient(5deg, ${user.avatar_color_bg_bottom || avatarColorBgTop}, ${user.avatar_color_bg_top || avatarColorBgBottom})`;
    }

    const avatarTypeText = document.getElementById("avatar-type-text");
    if (avatarTypeText) {
      avatarTypeText.textContent = await findInitialEmojiText(user.avatar_type);
    }

    // Call the emoji picker initialization
    // emojiPickerDropdown(); // Initialize the emoji picker dropdown for this modal
    emojiPickerDiv();
  }

  async function handleModalOpen(userId, sectionId, titleId) {
    try {
      const user = await getUserData(userId);

      if (sectionId === "modal-edit-profile-admin") {
        populateEditProfileAdmin(user);
      }

      if (sectionId === "modal-change-avatar") {
        populateChangeAvatar(user);
        openModal(sectionId, titleId);
        initChangeAvatarModal();
        // ???
        // emojiPickerDropdown();
      }

      openModal(sectionId, titleId);
    } catch (err) {
      console.error(err);
      alert("Failed to load user data");
    }
  }

  document.querySelectorAll("[data-user-id]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const { userId, section, title } = e.currentTarget.dataset;
      handleModalOpen(userId, section, title);
    });
  });

  function initChangeAvatarModal() {
    const avatarInput = document.getElementById("avatar_type");
    const avatarColorPickerFg = document.getElementById("avatar_color_fg");
    const avatarColorPickerBgt = document.getElementById("avatar_color_bg_top");
    const avatarColorPickerBgb = document.getElementById(
      "avatar_color_bg_bottom",
    );
    const newAvatarElement = document.getElementById("new_avatar");

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

  //NEW
  // FETCH DATA EMOJI DATA...
  async function getEmojiData() {
    const response = await fetch("/data/NotoEmoji-edited-monochrome-only.json");
    if (!response.ok) throw new Error("Failed to fetch user");
    return await response.json();
  }

  // async function loadEmojis() {
  //   const emojiData = await getEmojiData(); // Await the Promise
  //   const allEmojis = Object.values(emojiData).flat(); // Now this is the actual data

  //   const emojiMap = Object.fromEntries(
  //     allEmojis.map((e) => [e.text, e.emoji]),
  //   );

  //   // Convert object to array and sort it
  //   const emojiMapSorted = Object.entries(emojiMap)
  //     .sort((a, b) => a[0].localeCompare(b[0])) // Sort by the 'text' (which is the first value in the entry)
  //     .map(([text, emoji]) => ({ text, emoji })); // Optional: convert back to an object or array of objects

  //   // console.log(emojiMapSorted);
  //   return emojiMapSorted;
  // }

  let emojiMapSortedCache = null;

  async function loadEmojis() {
    if (emojiMapSortedCache) return emojiMapSortedCache;

    const emojiData = await getEmojiData();
    const allEmojis = Object.values(emojiData).flat();

    const emojiMap = Object.fromEntries(
      allEmojis.map((e) => [e.text, e.emoji]),
    );

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
    return "Invalid userId."; // Optional: handle if userId is not valid
  }

  // async function main() {
  //   console.log(await findInitialEmojiText("🦁"));
  // }

  // main();

  //NEW!
  // async function emojiPickerDropdown() {}

  //This uses innerHTML - no bueno, but it works flawlessly. (Was it flawless?)

  // async function emojiPickerDropdown() {
  //   const emojiTextDropdown = document.getElementById("emoji-text-dropdown");
  //   const avatarTypeText = document.getElementById("avatar-type-text");
  //   const avatarInput = document.getElementById("avatar_type");
  //   const newAvatarElement = document.getElementById("new_avatar");

  //   if (
  //     !emojiTextDropdown ||
  //     !avatarTypeText ||
  //     !avatarInput ||
  //     !newAvatarElement
  //   ) {
  //     return;
  //   }

  //   const emojiMapSorted = await loadEmojis(); // Load and sort the emojis

  //   // Dynamically create dropdown content
  //   emojiTextDropdown.innerHTML = emojiMapSorted
  //     .map(
  //       (
  //         emoji,
  //       ) => `<p class="emoji-option" data-emoji="${emoji.emoji}" data-text="${emoji.text}">
  //       <span class="emoji">${emoji.emoji}</span> - ${emoji.text}
  //     </p>`,
  //     )
  //     .join("");

  //   // Dynamically create dropdown content with ----> DOMPurify 
  //   // TODO - Keep using DOMPurify/installed on npm/CDN, or find a better way? Uninstall DOMPurify from node dependency? Or add webpack and use npm install of dompurify?

  //   // emojiTextDropdown.innerHTML = emojiMapSorted
  //   //   .map(
  //   //     (
  //   //       emoji,
  //   //     ) => `<p class="emoji-option" data-emoji="${emoji.emoji}" data-text="${emoji.text}">
  //   //   <span class="emoji">${DOMPurify.sanitize(emoji.emoji)}</span> - ${DOMPurify.sanitize(emoji.text)}
  //   // </p>`,
  //   //   )
  //   //   .join("");

  //   // Show the dropdown when clicking the input
  //   const fakeInput = document.querySelector(".fake-input");
  //   fakeInput.addEventListener("click", () => {
  //     emojiTextDropdown.classList.toggle("hidden");
  //   });

  //   // Handle emoji selection from the dropdown
  //   document.querySelectorAll(".emoji-option").forEach((option) => {
  //     option.addEventListener("click", (e) => {
  //       const selectedText = e.target.dataset.text;
  //       const selectedEmoji = e.target.dataset.emoji;

  //       // Update the avatar-type-text with the selected text
  //       avatarTypeText.textContent = selectedText;

  //       // Set the hidden input (avatar_type) value to the corresponding emoji
  //       avatarInput.value = selectedEmoji;

  //       // Update the new avatar preview value to the corresponding emoji
  //       newAvatarElement.textContent = selectedEmoji;

  //       // Close the dropdown after selection
  //       emojiTextDropdown.classList.add("hidden");
  //     });
  //   });

  //   // Close dropdown if the user clicks anywhere outside the dropdown
  //   window.addEventListener("click", (e) => {
  //     if (
  //       !emojiTextDropdown.contains(e.target) &&
  //       !fakeInput.contains(e.target)
  //     ) {
  //       emojiTextDropdown.classList.add("hidden");
  //     }
  //   });
  // }

    // async function emojiPickerDropdown() {
    //   const emojiTextDropdown = document.getElementById("emoji-text-dropdown");
    //   const avatarTypeText = document.getElementById("avatar-type-text");
    //   const avatarInput = document.getElementById("avatar_type");
    //   const newAvatarElement = document.getElementById("new_avatar");

    //   if (
    //     !emojiTextDropdown ||
    //     !avatarTypeText ||
    //     !avatarInput ||
    //     !newAvatarElement
    //   ) {
    //     return;
    //   }

    //   const emojiMapSorted = await loadEmojis(); // Load and sort the emojis

    //   // Clear it first...
    //   emojiTextDropdown.innerHTML = "";

    //   // Dynamically create dropdown content - DON't USE -> innerHTML, use textContent
    //   emojiMapSorted.forEach((emoji) => {
    //     const emojiOption = document.createElement("p");
    //     emojiOption.classList.add("emoji-option");
    //     emojiOption.dataset.emoji = emoji.emoji;
    //     emojiOption.dataset.text = emoji.text;

    //     // Create the emoji span
    //     const emojiSpan = document.createElement("span");
    //     emojiSpan.classList.add("emoji");
    //     emojiSpan.textContent = emoji.emoji; // Set emoji character

    //     // Set the text content for the emoji text (i.e., what it is called, it's name)
    //     const emojiName = document.createElement("span");
    //     emojiName.textContent = ` - ${emoji.text}`;

    //     // Append both emoji span and text to the option
    //     emojiOption.appendChild(emojiSpan);
    //     emojiOption.appendChild(emojiName);

    //     // Append the new emoji option to the dropdown
    //     emojiTextDropdown.appendChild(emojiOption);
    //   });

    //   // Show the dropdown when clicking the input
    //   const fakeInput = document.querySelector(".fake-input");
    //   fakeInput.addEventListener("click", () => {
    //     emojiTextDropdown.classList.toggle("hidden");
    //   });

    //   // Delegated event listener for emoji selection
    //   emojiTextDropdown.addEventListener("click", (e) => {
    //     const target = e.target;

    //     // Check if the clicked element is an emoji option (p with class .emoji-option)
    //     if (target.classList.contains("emoji-option")) {
    //       const selectedText = target.dataset.text;
    //       const selectedEmoji = target.dataset.emoji;

    //       // Update the avatar-type-text with the selected text
    //       avatarTypeText.textContent = selectedText;

    //       // Set the hidden input (avatar_type) value to the corresponding emoji
    //       avatarInput.value = selectedEmoji;

    //       // Update the new avatar preview value to the corresponding emoji
    //       newAvatarElement.textContent = selectedEmoji;

    //       // Close the dropdown after selection
    //       emojiTextDropdown.classList.add("hidden");
    //     }
    //   });

    //   // Close dropdown if the user clicks anywhere outside the dropdown
    //   window.addEventListener("click", (e) => {
    //     if (
    //       !emojiTextDropdown.contains(e.target) &&
    //       !fakeInput.contains(e.target)
    //     ) {
    //       emojiTextDropdown.classList.add("hidden");
    //     }
    //   });
    // }

  async function emojiPickerDiv() {
    const emojiPanel = document.getElementById("emoji-panel");
    const emojiList = document.getElementById("emoji-list");
   
    if (!emojiPanel || !emojiList ) return;

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
      // label.className = "element-container-row";
      // label.textContent = ` - ${emoji.text}`;

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

    // const openCloseEmojiPanel = document.querySelector(
    //     "#open-close-emoji-panel",
    //   );
    //   openCloseEmojiPanel.addEventListener("click", () => {
    //     emojiPanel.classList.toggle("hidden");
    //   });

      document.body.addEventListener("click", (e) => {
        if (e.target && e.target.classList.contains("open-close-emoji-panel")) {
          // Find the closest modal and toggle the emoji panel
          const emojiPanel = e.target
            .closest(".profile-data-form")
            .querySelector(".emoji-panel");
          emojiPanel.classList.toggle("hidden");
        }
      });

    // Handle radio button selection
    emojiList.addEventListener("change", (e) => {
      if (e.target.name === "emoji") {
        const selectedEmoji = e.target.value;
        const selectedText = e.target.dataset.text; // Access the data-text attribute
        // Perform the necessary action with selectedEmoji, e.g., updating the preview
        const avatarTypeText = document.getElementById("avatar-type-text");
        const avatarInput = document.getElementById("avatar_type");
        const newAvatarElement = document.getElementById("new_avatar");

        avatarTypeText.textContent = selectedText; // Set selected text
        avatarInput.value = selectedEmoji; // Set emoji value
        newAvatarElement.textContent = selectedEmoji; // Update preview
      }
    });
  }


  //   end
});
