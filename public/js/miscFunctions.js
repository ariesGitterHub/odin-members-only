// Dynamically set maximum number of characters for a new message (use db to hold values? Interesting idea...)

// TODO - refactor later to use class (max-char-count-draft-message), just using this doubled up up function temporarily

export function messageBodyCharCounter() {
  const bodyNewMessage = document.getElementById("body-new-message");
  const maxCharCountNewMessage = document.getElementById(
    "max-char-count-new-message",
  );

  const bodyReplyMessage = document.getElementById("body-reply-message");
  const maxCharCountReplyMessage = document.getElementById(
    "max-char-count-reply-message",
  );

  const bodyEditMessage = document.getElementById("body-edit-message");
  const maxCharCountEditMessage = document.getElementById(
    "max-char-count-edit-message",
  );

  const maxChars = 700;

  bodyNewMessage.addEventListener("input", () => {
    const currentNewMessageLength = bodyNewMessage.value.length;
    maxCharCountNewMessage.textContent = `(${currentNewMessageLength}/${maxChars})`;

    if (currentNewMessageLength > maxChars) {
      bodyNewMessage.value = bodyNewMessage.value.substring(0, maxChars); // Truncates input if too long
    }
  });

  bodyReplyMessage.addEventListener("input", () => {
    const currentReplyMessageLength = bodyReplyMessage.value.length;
    maxCharCountReplyMessage.textContent = `(${currentReplyMessageLength}/${maxChars})`;

    if (currentReplyMessageLength > maxChars) {
      bodyReplyMessage.value = bodyReplyMessage.value.substring(0, maxChars); // Truncates input if too long
    }
  });

  bodyEditMessage.addEventListener("input", () => {
    const currentEditMessageLength = bodyEditMessage.value.length;
    maxCharCountEditMessage.textContent = `(${currentEditMessageLength}/${maxChars})`;

    if (currentEditMessageLength > maxChars) {
      bodyEditMessage.value = bodyEditMessage.value.substring(0, maxChars); // Truncates input if too long
    }
  });
}
