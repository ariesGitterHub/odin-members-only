// export function avatarColors() {
//   document
//     .querySelectorAll(".member-directory-extra-avatar-container")
//     .forEach((el) => {
//       el.style.setProperty("--avatar-color-fg", el.dataset.avatarFg);
//       el.style.setProperty("--avatar-color-bg-top", el.dataset.avatarBgTop);
//       el.style.setProperty(
//         "--avatar-color-bg-bottom",
//         el.dataset.avatarBgBottom,
//       );
//     });
//   document.querySelectorAll(".avatar-container").forEach((el) => {
//     el.style.setProperty("--avatar-color-fg", el.dataset.avatarFg);
//     el.style.setProperty("--avatar-color-bg-top", el.dataset.avatarBgTop);
//     el.style.setProperty("--avatar-color-bg-bottom", el.dataset.avatarBgBottom);
//   });
// }
// export function avatarColors() {
//   // Helper function to apply CSS variables from data attributes
//   const applyColors = (el) => {
//     if (!el.dataset) return;
//     el.style.setProperty("--avatar-color-fg", el.dataset.avatarFg);
//     el.style.setProperty("--avatar-color-bg-top", el.dataset.avatarBgTop);
//     el.style.setProperty("--avatar-color-bg-bottom", el.dataset.avatarBgBottom);
//   };

//   // Select all elements that need the colors applied
//   const elements = [
//     ...document.querySelectorAll(".member-directory-extra-avatar-container"),
//     ...document.querySelectorAll(".avatar-container"),
//   ];

//   elements.forEach(applyColors);
// }

export function avatarColors() {
  document.querySelectorAll(".avatar-background").forEach((el) => {
    el.style.setProperty("--avatar-color-fg", el.dataset.avatarFg);
    el.style.setProperty("--avatar-color-bg-top", el.dataset.avatarBgTop);
    el.style.setProperty("--avatar-color-bg-bottom", el.dataset.avatarBgBottom);
  });
}
