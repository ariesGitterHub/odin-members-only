export function avatarColors() {
  document.querySelectorAll(".avatar-background").forEach((el) => {
    el.style.setProperty("--avatar-color-fg", el.dataset.avatarFg);
    el.style.setProperty("--avatar-color-bg-top", el.dataset.avatarBgTop);
    el.style.setProperty("--avatar-color-bg-bottom", el.dataset.avatarBgBottom);
  });
}
