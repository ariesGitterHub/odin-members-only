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

  // openModal/closeModal eventListeners - STOP USING, TODO - MAKE NEW EVENT LISTENER FOR become-member, etc.
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

  // async function fetchModalFieldsDataByUser(
  //   userId,
  //   sectionId,
  //   //  titleId
  // ) {
  //   if (userId) {
  //     try {
  //       const response = await fetch(`/app/user/${userId}`);
  //       if (!response.ok) throw new Error("Failed to fetch user");
  //       const user = await response.json();

  //       // Populate form inputs inside the modal if needed
  //       // For example, avatar or profile edit:
  //       // if (sectionId === "modal-edit-profile-admin") {
  //       //   document.getElementById("first_name").value = user.first_name;
  //       //   document.getElementById("last_name").value = user.last_name;
  //       //   document.getElementById("verified_by_admin").value =
  //       //     user.verified_by_admin;
  //       //   document.getElementById("permission_status").value =
  //       //     user.permission_status;
  //       //   document.getElementById("upgrade_request").value =
  //       //     user.member_request;
  //       //   document.getElementById("email").value = user.email;
  //       //   document.getElementById("phone").value = user.phone || "";
  //       //   document.getElementById("birthdate").value = user.birthdate;
  //       //   document.getElementById("street_address").value =
  //       //     user.street_address || "";
  //       //   document.getElementById("apt_unit").value = user.apt_unit || "";
  //       //   document.getElementById("city").value = user.city || "";
  //       //   document.getElementById("us_state").value = user.us_state || "";
  //       //   document.getElementById("zip_code").value = user.zip_code || "";
  //       //   document.getElementById("notes").value = user.notes || "";
  //       // }

  //       if (sectionId === "modal-change-avatar") {
  //         //Hide fields that are not mean to be used by a "guest"
  //         if (user.permission_status === "guest") {
  //           document
  //             .querySelector(".change-avatar-hide-element")
  //             .classList.add("hidden");
  //         } else {
  //           document
  //             .querySelector(".change-avatar-hide-element")
  //             .classList.remove("hidden");
  //         }

  //         // Access CSS variables
  //         const rootStyles = getComputedStyle(document.documentElement);
  //         // Use these values in your JavaScript
  //         const avatarColorFg = rootStyles
  //           .getPropertyValue("--avatar-color-fg")
  //           .trim();
  //         const avatarColorBgTop = rootStyles
  //           .getPropertyValue("--avatar-color-bg-top")
  //           .trim();
  //         const avatarColorBgBottom = rootStyles
  //           .getPropertyValue("--avatar-color-bg-bottom")
  //           .trim();
  //         document.getElementById("avatar_type").value = user.avatar_type || "";
  //         document.getElementById("avatar_color_fg").value =
  //           user.avatar_color_fg || avatarColorFg;
  //         document.getElementById("avatar_color_bg_top").value =
  //           user.avatar_color_bg_top || avatarColorBgTop;
  //         document.getElementById("avatar_color_bg_bottom").value =
  //           user.avatar_color_bg_bottom || avatarColorBgBottom;

  //         const currentAvatarElement =
  //           document.getElementById("current_avatar");
  //         if (currentAvatarElement) {
  //           currentAvatarElement.textContent = user.avatar_type || "";
  //           currentAvatarElement.style.color =
  //             user.avatar_color_fg || avatarColorFg;
  //           currentAvatarElement.style.background = `linear-gradient(5deg, ${user.avatar_color_bg_bottom || avatarColorBgTop}, ${user.avatar_color_bg_top || avatarColorBgBottom})`;
  //         }
  //       }
  //     } catch (err) {
  //       console.error(err);
  //       alert("Failed to load user data");
  //     }
  //   }

  //   // Open the modal section
  //   openModal(
  //     sectionId,
  //     //  titleId
  //   );
  // }

  // document.querySelectorAll(".edit-change-avatar-button").forEach((btn) => {
  //   btn.addEventListener("click", (e) => {
  //     const userId = e.target.dataset.userId;
  //     const sectionId = e.target.dataset.section;
  //     // const titleId = e.target.dataset.title;
  //     fetchModalFieldsDataByUser(
  //       userId,
  //       sectionId,
  //       //  titleId
  //     );
  //   });
  // });

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

  function populateChangeAvatar(user) {
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
      )
    `;
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

  
  //   end
})