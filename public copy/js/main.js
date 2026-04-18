import {
  attachCloseModalListener,
  attachOpenModalListener,
} from "./modalFunctions.js";

import { handleEmojiOpen } from "./emojiFunctions.js";

import { formActionsFromModals } from "./formActions.js";

import {
  handleSiteControlsToggle,
  handleSiteStatisticsToggle,
  handleGuestCardsToggle,
  handleMemberCardsToggle,
  handleShowProfileToggle,
  handleShowInfoSectionToggle,
} from "./toggleHiddenSections.js";

import { messageBodyCharCounter } from "./miscFunctions.js";

import { avatarColors } from "./avatarColors.js";

document.addEventListener("DOMContentLoaded", () => {
  attachCloseModalListener();
  attachOpenModalListener();

  handleEmojiOpen();

  formActionsFromModals();

  handleSiteControlsToggle();
  handleSiteStatisticsToggle();
  handleGuestCardsToggle();
  handleMemberCardsToggle();
  handleShowProfileToggle();
  handleShowInfoSectionToggle();

  messageBodyCharCounter();

  avatarColors();

  // Global error handler
  window.onerror = function (message, source, lineno, colno, error) {
    // Log the error in the browser console
    console.error("Error occurred:", message);
    console.error("Source:", source);
    console.error("Line:", lineno, "Column:", colno);
    console.error("Stack Trace:", error);

    // Prevent default browser behavior of showing a stack trace
    return true;
  };

  // end
});
