import {
  attachCloseModalListener,
  attachOpenModalListener,
  // attachAvatarPreviewListeners,
} from "./modalFunctions.js";

import { handleEmojiOpen } from "./emojiFunctions.js"

import { formActions } from "./formActions.js";

import {
  handleUserCensusToggle,
  handleGuestCardsToggle,
  handleMemberCardsToggle,
  handleShowProfileToggle,
} from "./toggleHiddenSections.js";

import { messageBodyCharCounter } from "./newMessageFunctions.js";

document.addEventListener("DOMContentLoaded", () => {
  attachCloseModalListener();
  attachOpenModalListener();
  // attachAvatarPreviewListeners();

  handleEmojiOpen();

  formActions();

  handleUserCensusToggle();
  handleGuestCardsToggle();
  handleMemberCardsToggle();
  handleShowProfileToggle();

  messageBodyCharCounter();
});
