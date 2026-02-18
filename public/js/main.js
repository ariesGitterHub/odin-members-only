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
})

// TOGGLE .HIDDEN FOR ALL MEMBER CARDS ON ADMIN PANEL
document.querySelectorAll(".member-card").forEach((card) => {
  const showMembers = document.querySelector("#show-members-button");
  showMembers.addEventListener("click", () => {
    card.classList.toggle("hidden");
    card.classList.contains("hidden")
      ? (showMembers.textContent = "open member profiles")
      : (showMembers.textContent = "close member profiles");
  });
})

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