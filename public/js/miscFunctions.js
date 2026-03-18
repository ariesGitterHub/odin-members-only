// Dynamically set maximum number of characters for a new message (use db to hold values? Interesting idea...)
export function messageBodyCharCounter() {
  const bodyNewMessage = document.getElementById("body-new-message");
  const maxCharCountNewMessage = document.getElementById(
    "max-char-count-new-message",
  );
  const maxChars = 700;

  bodyNewMessage.addEventListener("input", () => {
    const currentMessageLength = bodyNewMessage.value.length;
    maxCharCountNewMessage.textContent = `(${currentMessageLength}/${maxChars})`;

    if (currentLength > maxChars) {
      bodyNewMessage.value = bodyNewMessage.value.substring(0, maxChars); // Truncates input if too long
    }
  });
}


