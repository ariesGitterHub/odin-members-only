// Dynamically set maximum number of characters for a new message (use db to hold values? Interesting idea...)

import { fetchMaxChars } from "./dataFetchers.js";

export async function messageBodyCharCounter() {
  const maxChars = await fetchMaxChars(); // fetch maxChars here

  if (maxChars === null) {
    console.error("Could not fetch maxChars. Character counter disabled.");
    return;
  }

  // Array of message body IDs and corresponding max count IDs
  const messageElements = [
    { textareaId: "body-new-message", countId: "max-char-count-new-message" },
    {
      textareaId: "body-reply-message",
      countId: "max-char-count-reply-message",
    },
    { textareaId: "body-edit-message", countId: "max-char-count-edit-message" },
  ];

  messageElements.forEach(({ textareaId, countId }) => {
    const bodyMessage = document.getElementById(textareaId);
    const maxCharCount = document.getElementById(countId);
    if (!bodyMessage || !maxCharCount) return;

    // Set initial character count
    const initialLength = bodyMessage.value.length;
    maxCharCount.textContent = `(${initialLength}/${maxChars})`;

    // Add input event listener
    // bodyMessage.addEventListener("input", () => {
    //   const currentLength = bodyMessage.value.length;
    //   maxCharCount.textContent = `(${currentLength}/${maxChars})`;

    //   // Truncate input if it exceeds the limit
    //   if (currentLength > maxChars) {
    //     bodyMessage.value = bodyMessage.value.substring(0, maxChars);
    //   }
    // });

    // Better code for a screen reader, see like below
    bodyMessage.addEventListener("input", () => {
      const currentLength = bodyMessage.value.length;

      if (currentLength > maxChars) {
        bodyMessage.value = bodyMessage.value.substring(0, maxChars);
        maxCharCount.textContent = `(${maxChars}/${maxChars})`; // screen reader announces max reached
      } else {
        maxCharCount.textContent = `(${currentLength}/${maxChars})`;
      }
    });
  });
}
