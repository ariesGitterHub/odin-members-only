import {
  attachCloseModalListener,
  attachOpenModalListener,
  // attachAvatarPreviewListeners,
} from "./modalFunctions.js";

import { handleEmojiOpen } from "./emojiFunctions.js"

import { formActionsFromModals } from "./formActions.js";

import {
  handleUserCensusToggle,
  handleMessageOverviewToggle,
  handleGuestCardsToggle,
  handleMemberCardsToggle,
  handleShowProfileToggle,
  handleShowInfoSectionToggle,
} from "./toggleHiddenSections.js";

import {
  messageBodyCharCounter,
  // generateStateSelect,
} from "./miscFunctions.js";

document.addEventListener("DOMContentLoaded", () => {
  attachCloseModalListener();
  attachOpenModalListener();
  // attachAvatarPreviewListeners();

  handleEmojiOpen();

  formActionsFromModals();

  handleUserCensusToggle();
  handleMessageOverviewToggle();
  handleGuestCardsToggle();
  handleMemberCardsToggle();
  handleShowProfileToggle();
  handleShowInfoSectionToggle();

  messageBodyCharCounter();
  // generateStateSelect();
  // usStates

  // end
});
