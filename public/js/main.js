import {
  attachCloseModalListener,
  attachOpenModalListener,
  // attachAvatarPreviewListeners,
} from "./modalFunctions.js";

import { handleEmojiOpen } from "./emojiFunctions.js"

import { formActionsFromModals } from "./formActions.js";

import {
  handleUserCensusToggle,
  handleGuestCardsToggle,
  handleMemberCardsToggle,
  handleShowProfileToggle,
} from "./toggleHiddenSections.js";

import { messageBodyCharCounter } from "./miscFunctions.js";

document.addEventListener("DOMContentLoaded", () => {
  attachCloseModalListener();
  attachOpenModalListener();
  // attachAvatarPreviewListeners();

  handleEmojiOpen();

  formActionsFromModals();

  handleUserCensusToggle();
  handleGuestCardsToggle();
  handleMemberCardsToggle();
  handleShowProfileToggle();

  messageBodyCharCounter();

  // end
});
