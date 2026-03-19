// Dynamically set maximum number of characters for a new message (use db to hold values? Interesting idea...)

// TODO - refactor later to use class (max-char-count-draft-message), just using this doubled up up function temporarily

export function messageBodyCharCounter() {
  const bodyNewMessage = document.getElementById("body-new-message");
  const maxCharCountNewMessage = document.getElementById(
    "max-char-count-new-message",
  );

  const bodyRequestMessage = document.getElementById("body-request-message");
  const maxCharCountRequestMessage = document.getElementById(
    "max-char-count-request-message",
  );

  const maxChars = 700;

  bodyNewMessage.addEventListener("input", () => {
    const currentNewMessageLength = bodyNewMessage.value.length;
    maxCharCountNewMessage.textContent = `(${currentNewMessageLength}/${maxChars})`;

    if (currentLength > maxChars) {
      bodyNewMessage.value = bodyNewMessage.value.substring(0, maxChars); // Truncates input if too long
    }
  });

  bodyRequestMessage.addEventListener("input", () => {
    const currentRequestMessageLength = bodyRequestMessage.value.length;
    maxCharCountRequestMessage.textContent = `(${currentRequestMessageLength}/${maxChars})`;

    if (currentLength > maxChars) {
      bodyRequestMessage.value = bodyRequestMessage.value.substring(0, maxChars); // Truncates input if too long
    }
  });
}
