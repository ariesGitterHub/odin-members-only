// document.addEventListener("DOMContentLoaded", () => {
//   const colorInput = document.getElementById("avatar-color");
//   if (!colorInput) return; // page might not have the picker

//   const root = document.documentElement;

//   const foreground = getComputedStyle(root).getPropertyValue("--off-black").trim();

//   if (foreground) {
//     colorInput.value = foreground;
//   }

//   // Optional: keep CSS variable updated when user picks a color
//   colorInput.addEventListener("input", () => {
//     root.style.setProperty("--off-black", colorInput.value);
//   });
// });

// document.addEventListener("DOMContentLoaded", () => {
//   const colorInput = document.getElementById("background-color-top");
//   if (!colorInput) return; // page might not have the picker

//   const root = document.documentElement;

//   const backgroundTop = getComputedStyle(root).getPropertyValue("--off-white").trim();

//   if (backgroundTop) {
//     colorInput.value = backgroundTop;
//   }

//   // Optional: keep CSS variable updated when user picks a color
//   colorInput.addEventListener("input", () => {
//     root.style.setProperty("--off-white", colorInput.value);
//   });
// });

// document.addEventListener("DOMContentLoaded", () => {
//   const colorInput = document.getElementById("background-color-bottom");
//   if (!colorInput) return; // page might not have the picker

//   const root = document.documentElement;

//   const backgroundBottom = getComputedStyle(root)
//     .getPropertyValue("--off-white")
//     .trim();

//   if (backgroundBottom) {
//     colorInput.value = backgroundBottom;
//   }

//   // Optional: keep CSS variable updated when user picks a color
//   colorInput.addEventListener("input", () => {
//     root.style.setProperty("--off-white", colorInput.value);
//   });
// });

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;

  function bindColorPicker(inputId, cssVar) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const value = getComputedStyle(root).getPropertyValue(cssVar).trim();

    if (value) {
      input.value = value;
    }

    input.addEventListener("input", () => {
      root.style.setProperty(cssVar, input.value);
    });
  }

  bindColorPicker("avatar-color", "--off-black");
  bindColorPicker("background-color-top", "--off-white");
  bindColorPicker("background-color-bottom", "--off-gray");
});

// use?

// 7. Bonus: scaling this later

// Once you have this pattern, you can:

// Sync multiple color pickers to multiple CSS vars

// Save user themes to DB

// Load themes on page render

// Animate theme transitions

// Example pattern:

// const bindColorPicker = (inputId, cssVar) => {
//   const input = document.getElementById(inputId);
//   if (!input) return;

//   const root = document.documentElement;
//   input.value = getComputedStyle(root)
//     .getPropertyValue(cssVar)
//     .trim();

//   input.addEventListener('input', () => {
//     root.style.setProperty(cssVar, input.value);
//   });
// };

// TOGGLE .HIDDEN FOR ALL USER CARDS ON ADMIN PANEL
// document.querySelectorAll(".user-card").forEach((card) => {
//   const showUsers = document.querySelector("#show-users-button");
//   showUsers.addEventListener("click", () => {
//     card.classList.toggle("hidden")
//   })
// })

// TOGGLE .HIDDEN FOR ALL GUEST CARDS ON ADMIN PANEL
document.querySelectorAll(".guest-card").forEach((card) => {
  const showGuests = document.querySelector("#show-guests-button");
  showGuests.addEventListener("click", () => {
    card.classList.toggle("hidden");
    card.classList.contains("hidden")
      ? (showGuests.textContent = "open guest profiles")
      : (showGuests.textContent = "close guest profiles");
  });
});

// TOGGLE .HIDDEN FOR ALL MEMBER CARDS ON ADMIN PANEL
document.querySelectorAll(".member-card").forEach((card) => {
  const showMembers = document.querySelector("#show-members-button");
  showMembers.addEventListener("click", () => {
    card.classList.toggle("hidden");
    card.classList.contains("hidden")
      ? (showMembers.textContent = "open member profiles")
      : (showMembers.textContent = "close member profiles");
  });
});

// // TOGGLE .HIDDEN FOR PROFILE's DETAILS ON ADMIN PANEL
// document.querySelectorAll(".profile-data").forEach((card) => {
//   const showProfile = document.querySelectorAll(".show-profile-button").forEach((btn) => {
//     btn.addEventListener("click", () => {
//       card.classList.toggle("hidden");
//       card.classList.contains("hidden")
//         ? (showProfile.textContent = "open this profile")
//         : (showProfile.textContent = "close this profile");
//     });
//   });

// })

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

// document.querySelectorAll(".show-profile-button").forEach((btn) => {
//   btn.addEventListener("click", () => {
//     const card = btn.closest(".card");

//     const isOpen = !card.classList.toggle("hidden");

//     card.classList.toggle("expanded", isOpen);
//     btn.setAttribute("aria-expanded", isOpen);

//     card.querySelector(".file-tab-text").textContent = isOpen
//       ? "full view:"
//       : "quick view:";
//   });
// });

function openModal(sectionId, titleId) {
  const modal = document.getElementById("modal");
  const sections = document.querySelectorAll(".modal-section");

  // Hide all sections
  sections.forEach((section) => {
    section.classList.add("hidden");
  });

  // Show target section
  const target = document.getElementById(sectionId);
  target.classList.remove("hidden");

  // Update aria-labelledby dynamically
  modal.setAttribute("aria-labelledby", titleId);

  // Show modal
  modal.classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

// Close via overlay or button
document.querySelectorAll("[data-close-modal]").forEach((el) => {
  el.addEventListener("click", closeModal);
});

// Listen for click events on "Edit" buttons
// document.querySelectorAll('.edit-user-button').forEach(button => {
//   button.addEventListener('click', async (e) => {
//     const userId = e.target.dataset.userId;  // Get the user ID from the data attribute

//     try {
//       // Fetch user data by ID
//       const response = await fetch(`/user/${userId}`);

//       if (response.ok) {
//         const user = await response.json();  // Get the user data

//         // Render the modal with the user data
//         const modalContent = document.getElementById('modal-edit-profile-admin');
//         modalContent.innerHTML = await renderEditProfileModal(user);  // Inject the user data into the modal

//         // Show the modal
//         document.getElementById('modal').classList.remove('hidden');
//       } else {
//         alert('Failed to load user details');
//       }
//     } catch (error) {
//       console.error('Error fetching user data:', error);
//     }
//   });
// });

// // Helper function to render the form dynamically
// async function renderEditProfileModal(user) {
//   return `
//     <form class="profile-data-form" action="/app/update-user/${user.id}" method="POST">
//       <label class="capitalize" for="first_name">first name (fname)</label>
//       <input class="bold" type="text" name="first_name" value="${user.first_name}" required />
//       <label class="capitalize" for="last_name">last name (lname)</label>
//       <input class="bold" type="text" name="last_name" value="${user.last_name}" required />
//       <label class="capitalize" for="email">email address</label>
//       <input class=" lowercase bold" type="email" name="email" value="${user.email}" required />
//       <button class="wide-button" type="submit">submit profile changes</button>
//     </form>
//   `;
// }

// Listen for click events on "Edit" buttons
document
  .querySelectorAll(".edit-user-profile-admin-button")
  .forEach((button) => {
    button.addEventListener("click", async (e) => {
      const userId = e.target.dataset.userId; // Get the user ID from the data attribute

      try {
        // Send AJAX request to fetch the user data by ID
        const response = await fetch(`/app/user/${userId}`);

        if (response.ok) {
          const user = await response.json(); // Get the user data from the response

          // Dynamically inject user data into the modal content
          document.getElementById("first_name").value = user.first_name;
          document.getElementById("last_name").value = user.last_name;
          document.getElementById("verified_by_admin").value =
            user.verified_by_admin;
          document.getElementById("permission_status").value =
            user.permission_status;
          document.getElementById("upgrade_request").value =
            user.member_request;
          document.getElementById("email").value = user.email;
          document.getElementById("phone").value = user.phone || "";
          document.getElementById("birthdate").value = user.birthdate;
          document.getElementById("street_address").value =
            user.street_address || "";
          document.getElementById("apt_unit").value = user.apt_unit || "";
          document.getElementById("city").value = user.city || "";
          document.getElementById("us_state").value = user.us_state || "";
          document.getElementById("zip_code").value = user.zip_code || "";
          document.getElementById("notes").value = user.notes || "";

          // Show the modal
          document.getElementById("modal").classList.remove("hidden");
        } else {
          alert("Failed to load user details");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    });
  });

document
  .querySelectorAll(".edit-user-avatar-admin-button")
  .forEach((button) => {
    button.addEventListener("click", async (e) => {
      const userId = e.target.dataset.userId; // Get the user ID from the data attribute

      try {
        // Send AJAX request to fetch the user data by ID
        const response = await fetch(`/app/user/${userId}`);

        if (response.ok) {
          const user = await response.json(); // Get the user data from the response

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

          // Dynamically inject user data into the modal content

          // TODO - add a preview of the avatar here? I deleted this because it was not working and it was time to move on, maybe come back to.

          if (user.permission_status === "guest") {
            document
              .querySelector(".change-avatar-hide-element")
              .classList.add("hidden");
            // document
            //   .querySelector(".change-avatar-hide-input")
            //   .classList.add("hidden");
          } else {
            document
              .querySelector(".change-avatar-hide-element")
              .classList.remove("hidden");
            // document
            //   .querySelector(".change-avatar-hide-input")
            //   .classList.remove("hidden");
          }

          document.getElementById("avatar_type").value = user.avatar_type || "";

          const fg = user.avatar_color_fg || avatarColorFg;
          const bgt = user.avatar_color_bg_top || avatarColorBgTop;
          const bgb = user.avatar_color_bg_bottom || avatarColorBgBottom;

          document.getElementById("avatar_color_fg").value = fg;
          document.getElementById("avatar_color_bg_top").value = bgt;
          document.getElementById("avatar_color_bg_bottom").value = bgb;

          const currentAvatarEl = document.getElementById("current_avatar");
          currentAvatarEl.textContent = user.avatar_type || "";
          currentAvatarEl.style.color = fg; // now this works
          currentAvatarEl.style.background = `linear-gradient(05deg, ${bgb}, ${bgt})`;

          // const newAvatarEl = document.getElementById("new_avatar");
          // newAvatarEl.textContent = user.avatar_type || "";

          // Show the modal
          document.getElementById("modal").classList.remove("hidden");
        } else {
          alert("Failed to load user details");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    });
  });

// document.getElementById("avatar_color_fg").addEventListener("input", async (e) => {
// const newAvatarEl = document.getElementById("new_avatar");
// newAvatarEl.style.color = e.target.value;
// console.log(e.value)
// });

// const avatarColorPickerFg = document.getElementById("avatar_color_fg");
// const avatarColorPickerBgt = document.getElementById("avatar_color_bg_top");
// const avatarColorPickerBgb = document.getElementById("avatar_color_bg_bottom");
// const newAvatarEl = document.getElementById("new_avatar");

// avatarColorPickerFg.addEventListener("input", () => {
//   newAvatarEl.style.color = avatarColorPickerFg.value;
// });

// avatarColorPickerBgt.addEventListener("input", () => {
//   newAvatarEl.style.background = `linear-gradient(05deg, ${avatarColorPickerBgt.value}, ${avatarColorPickerBgb.value})`;
//   avatarColorPickerBgt.value;
// });

// avatarColorPickerBgb.addEventListener("input", () => {
//   newAvatarEl.style.background = avatarColorPickerBgb.value;
// });




const avatarInput = document.getElementById("avatar_type");
const avatarColorPickerFg = document.getElementById("avatar_color_fg");
const avatarColorPickerBgt = document.getElementById("avatar_color_bg_top");
const avatarColorPickerBgb = document.getElementById("avatar_color_bg_bottom");
const newAvatarEl = document.getElementById("new_avatar");



// Update everything in one place
function updateAvatarPreview() {
  newAvatarEl.textContent = avatarInput.value

  newAvatarEl.style.color = avatarColorPickerFg.value;

  newAvatarEl.style.background = `
    linear-gradient(5deg, 
      ${avatarColorPickerBgb.value}, 
      ${avatarColorPickerBgt.value}
    )
  `;
}

// Attach same function to all inputs
avatarInput.addEventListener("input", updateAvatarPreview);
avatarColorPickerFg.addEventListener("input", updateAvatarPreview);
avatarColorPickerBgt.addEventListener("input", updateAvatarPreview);
avatarColorPickerBgb.addEventListener("input", updateAvatarPreview);
