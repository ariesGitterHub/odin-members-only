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
    // Use these values
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
    emojiPickerDiv();
  }

  // async function handleModalOpen(userId, sectionId, titleId) {
  //   try {
  //     const user = await getUserData(userId);

  //     if (sectionId === "modal-edit-profile-admin") {
  //       populateEditProfileAdmin(user);
  //       openModal(sectionId, titleId);
  //     }

  //     if (sectionId === "modal-change-avatar") {
  //       populateChangeAvatar(user);
  //       openModal(sectionId, titleId);
  //       initChangeAvatarModal();
  //     }
      
  //   } catch (err) {
  //     console.error(err);
  //     alert("Failed to load user data");
  //   }
  // }

  // async function handleModalOpen(userId, sectionId, titleId) {
  //   try {
  //     if (userId) {
  //       // Fetch user data only if userId is provided
  //       const user = await getUserData(userId);

  //       if (sectionId === "modal-edit-profile-admin") {
  //         populateEditProfileAdmin(user);
  //         openModal(sectionId, titleId);
  //       }

  //       if (sectionId === "modal-change-avatar") {
  //         populateChangeAvatar(user);
  //         openModal(sectionId, titleId);
  //         initChangeAvatarModal();
  //       }
  //     } else {
  //       // No userId, handle the case when we don't need user data
  //       if (sectionId === "modal-create-profile-admin") {
  //         // Handle the creation form (doesn't require user data)
  //         openModal(sectionId, titleId);
  //         // You can initialize any other functions for this modal here
  //         // populateCreateProfileAdmin(); // If needed, add any default population logic
  //       }
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     alert("Failed to load user data");
  //   }
  // }

  async function handleModalOpen(userId, sectionId, titleId) {
    try {
      console.log("userId:", userId); // Debugging line

      // Check if userId exists (not null or undefined)
      if (userId != null && userId !== "") {
        // Fetch user data only if userId exists
        const user = await getUserData(userId);

        if (sectionId === "modal-edit-profile-admin") {
          populateEditProfileAdmin(user);
          openModal(sectionId, titleId);
        }

        if (sectionId === "modal-change-avatar") {
          populateChangeAvatar(user);
          openModal(sectionId, titleId);
          initChangeAvatarModal();
        }
      } else {
        // If userId is not provided (for "create profile" modal or others)
        if (sectionId === "modal-create-profile-admin") {
          openModal(sectionId, titleId);
          // Populate the modal for creating a profile (no user data needed)
          // Optionally, call a function to initialize default values for the "create" modal
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load user data");
    }
  }

  // The only modal that does't require user db data
  const createProfileAdminButton = document.querySelector(".create-profile-admin-button");
  createProfileAdminButton.addEventListener("click", (e) => {
      const { section, title } = e.currentTarget.dataset;
      handleModalOpen(null, section, title);
    });

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
