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

