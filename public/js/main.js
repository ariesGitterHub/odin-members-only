import {
  attachCloseModalListener,
  attachOpenModalListener,
  // reopenModalIfErrors,
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

  // reopenModalIfErrors();
  // if (document.body.dataset.reopenModal === "true") {
  //   reopenModalIfErrors();
  // }
// if (document.body.dataset.reopenModal === "true") {
//   // Pass the currentUser data safely from the backend
//   reopenModalIfErrors(currentUserWithBirthdate);
// }

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
