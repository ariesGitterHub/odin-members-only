// Dynamically set maximum number of characters for a new message (use db to hold values? Interesting idea...)

// DONE -> TODO - refactored

// export function messageBodyCharCounter() {
//   const bodyNewMessage = document.getElementById("body-new-message");
//   const maxCharCountNewMessage = document.getElementById(
//     "max-char-count-new-message",
//   );

//   const bodyReplyMessage = document.getElementById("body-reply-message");
//   const maxCharCountReplyMessage = document.getElementById(
//     "max-char-count-reply-message",
//   );

//   const bodyEditMessage = document.getElementById("body-edit-message");
//   const maxCharCountEditMessage = document.getElementById(
//     "max-char-count-edit-message",
//   );

//   const maxChars = 700;

//   bodyNewMessage.addEventListener("input", () => {
//     const currentNewMessageLength = bodyNewMessage.value.length;
//     maxCharCountNewMessage.textContent = `(${currentNewMessageLength}/${maxChars})`;

//     if (currentNewMessageLength > maxChars) {
//       bodyNewMessage.value = bodyNewMessage.value.substring(0, maxChars); // Truncates input if too long
//     }
//   });

//   bodyReplyMessage.addEventListener("input", () => {
//     const currentReplyMessageLength = bodyReplyMessage.value.length;
//     maxCharCountReplyMessage.textContent = `(${currentReplyMessageLength}/${maxChars})`;

//     if (currentReplyMessageLength > maxChars) {
//       bodyReplyMessage.value = bodyReplyMessage.value.substring(0, maxChars); // Truncates input if too long
//     }
//   });

//   bodyEditMessage.addEventListener("input", () => {
//     const currentEditMessageLength = bodyEditMessage.value.length;
//     maxCharCountEditMessage.textContent = `(${currentEditMessageLength}/${maxChars})`;

//     if (currentEditMessageLength > maxChars) {
//       bodyEditMessage.value = bodyEditMessage.value.substring(0, maxChars); // Truncates input if too long
//     }
//   });
// }

import { fetchMaxChars } from "./dataFetchers.js";

export async function messageBodyCharCounter() {
  // const maxChars = 700;
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
    bodyMessage.addEventListener("input", () => {
      const currentLength = bodyMessage.value.length;
      maxCharCount.textContent = `(${currentLength}/${maxChars})`;

      // Truncate input if it exceeds the limit
      if (currentLength > maxChars) {
        bodyMessage.value = bodyMessage.value.substring(0, maxChars);
      }
    });
  });
}

// DRY version of select option elements used on admin-edit.ejs, member-invite.ejs, edit-profile.ejs modal
// export const usStates = [
//   { code: "", name: "Choose state" },
//   { code: "AL", name: "Alabama" },
//   { code: "AK", name: "Alaska" },
//   { code: "AZ", name: "Arizona" },
//   { code: "AR", name: "Arkansas" },
//   { code: "CA", name: "California" },
//   { code: "CO", name: "Colorado" },
//   { code: "CT", name: "Connecticut" },
//   { code: "DE", name: "Delaware" },
//   { code: "DC", name: "Washington, DC" },
//   { code: "FL", name: "Florida" },
//   { code: "GA", name: "Georgia" },
//   { code: "HI", name: "Hawaii" },
//   { code: "ID", name: "Idaho" },
//   { code: "IL", name: "Illinois" },
//   { code: "IN", name: "Indiana" },
//   { code: "IA", name: "Iowa" },
//   { code: "KS", name: "Kansas" },
//   { code: "KY", name: "Kentucky" },
//   { code: "LA", name: "Louisiana" },
//   { code: "ME", name: "Maine" },
//   { code: "MD", name: "Maryland" },
//   { code: "MA", name: "Massachusetts" },
//   { code: "MI", name: "Michigan" },
//   { code: "MN", name: "Minnesota" },
//   { code: "MS", name: "Mississippi" },
//   { code: "MO", name: "Missouri" },
//   { code: "MT", name: "Montana" },
//   { code: "NE", name: "Nebraska" },
//   { code: "NV", name: "Nevada" },
//   { code: "NH", name: "New Hampshire" },
//   { code: "NJ", name: "New Jersey" },
//   { code: "NM", name: "New Mexico" },
//   { code: "NY", name: "New York" },
//   { code: "NC", name: "North Carolina" },
//   { code: "ND", name: "North Dakota" },
//   { code: "OH", name: "Ohio" },
//   { code: "OK", name: "Oklahoma" },
//   { code: "OR", name: "Oregon" },
//   { code: "PA", name: "Pennsylvania" },
//   { code: "RI", name: "Rhode Island" },
//   { code: "SC", name: "South Carolina" },
//   { code: "SD", name: "South Dakota" },
//   { code: "TN", name: "Tennessee" },
//   { code: "TX", name: "Texas" },
//   { code: "UT", name: "Utah" },
//   { code: "VT", name: "Vermont" },
//   { code: "VA", name: "Virginia" },
//   { code: "WA", name: "Washington" },
//   { code: "WV", name: "West Virginia" },
//   { code: "WI", name: "Wisconsin" },
//   { code: "WY", name: "Wyoming" },
// ];

// export function generateStateSelect(id, formData) {

//   const usStateSelectId = [
//     { selectId: "us-state-admin-edit-page" },
//     { selectId: "us-state-member-invite-page" },
//     { selectId: "us-state-edit-profile" },
//   ];

//   if (
//     usStateSelectId.selectedId === "us-state-admin-edit-page" ||
//     usStateSelectId.selectedId === "us-state-member-invite-page"
//   ) {
//     let optionsFormData = usStates
//       .map((state) => {
//         const selected = formData?.us_state === state.code ? "selected" : "";
//         return `<option value="${state.code}" ${selected}>${state.name}</option>`;
//       })
//       .join("");

//     return `
//       <label class="capitalize" for="${id}">state</label>
//       <select id="${id}" name="us_state" required>
//         <option value="" disabled ${!formData?.us_state ? "selected" : ""}>Choose state</option>
//         ${optionsFormData}
//       </select>
//     `;
//   } else {
//   let optionsNoFormData = usStates
//     .map((state) => {
//       return `<option value="${state.code}">${state.name}</option>`;
//     })
//     .join("");

//   return `
//     <label class="capitalize" for="${id}">state</label>
//     <select id="${id}" name="us_state" required>
//       <option value="" disabled selected>Choose state</option>
//       ${optionsNoFormData}
//     </select>
//   `;
//   }


// }

// Function to generate the state select options

// export function generateStateSelect(id, formData) {
//   // Define the IDs for forms where formData is used
//   const dynamicFormIds = [
//     "us-state-admin-edit-page",
//     "us-state-member-invite-page"
//   ];

//   // If the form ID is in the dynamic form list, use formData
//   if (dynamicFormIds.includes(id)) {
//     let optionsFormData = usStates
//       .map((state) => {
//         const selected = formData?.us_state === state.code ? "selected" : "";
//         return `<option value="${state.code}" ${selected}>${state.name}</option>`;
//       })
//       .join("");

//     return `
//       <label class="capitalize" for="${id}">state</label>
//       <select id="${id}" name="us_state" required>
//         <option value="" disabled ${!formData?.us_state ? "selected" : ""}>Choose state</option>
//         ${optionsFormData}
//       </select>
//     `;
//   } else {
//     // For forms without formData, just show static options
//     let optionsNoFormData = usStates
//       .map((state) => {
//         return `<option value="${state.code}">${state.name}</option>`;
//       })
//       .join("");

//     return `
//       <label class="capitalize" for="${id}">state</label>
//       <select id="${id}" name="us_state" required>
//         <option value="" disabled selected>Choose state</option>
//         ${optionsNoFormData}
//       </select>
//     `;
//   }
// }
