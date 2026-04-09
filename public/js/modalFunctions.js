import {
  fetchUserData,
  fetchMessageData,
  fetchTopicNameData,
  fetchCurrentUserData,
} from "./dataFetchers.js";

import { handleEmojiOpen } from "./emojiFunctions.js";

export function openModal(sectionId, titleId) {
  const modal = document.getElementById("modal");
  if (!modal) return;

  // Hide all modal sections
  document.querySelectorAll(".modal-section").forEach((section) => {
    section.classList.add("hidden");
  });

  // Show the requested section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) targetSection.classList.remove("hidden");

  // Update the modal title for accessibility
  modal.setAttribute("aria-labelledby", titleId);

  // Show the modal itself
  modal.classList.remove("hidden");
}

// Close modal
export function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

// *** EVENT LISTENER ATTACHERS

// Attach closeModal listener
export function attachCloseModalListener() {
  document.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });
}

// Attach openModal/handleModalOpen listener -> TODO - temp import handleEmojiOpen from emojiFunctions.js in here
export function attachOpenModalListener() {
  document.querySelectorAll("[data-target-id]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const { targetId, section, title } = e.currentTarget.dataset;
      console.log("Magic Number is:", targetId);
      handleModalOpen(targetId, section, title);
      handleEmojiOpen(targetId, section, title);
    });
  });
}

// *** EVENT HANDLERS ***

// Open modal with an event
export async function handleModalOpen(targetId, sectionId, titleId) {
  try {
    console.log("handleModalOpen targetId:", targetId); // Debugging line

    // Check if targetId exists (not null or undefined)
    if (targetId != null && targetId !== "") {
      if (sectionId === "modal-new-message") {
        const currentUser = await fetchCurrentUserData(targetId);
        const topic = await fetchTopicNameData();
        populateNewMessage(currentUser);
        populateNewMessageWithTopics(topic);
        openModal(sectionId, titleId);
      }

      if (sectionId === "modal-reply-message") {
        const currentUser = await fetchCurrentUserData(targetId);
        const message = await fetchMessageData(targetId);
        populateReplyMessage(currentUser, message);
        openModal(sectionId, titleId);
      }

      if (sectionId === "modal-edit-message") {
        const currentUser = await fetchCurrentUserData(targetId);
        const message = await fetchMessageData(targetId);
        populateEditMessage(currentUser, message);
        openModal(sectionId, titleId);
      }

      if (sectionId === "modal-warning-account-deletion") {
        const user = await fetchUserData(targetId);
        populateWarningAccountDeletion(user);
        openModal(sectionId, titleId);
        console.log("modal-warning-account-deletion");
      }

      if (sectionId === "modal-warning-message-deletion") {
        const message = await fetchMessageData(targetId);
        populateWarningMessageDeletion(message);
        openModal(sectionId, titleId);
        console.log("modal-warning-message-deletion");
      }
    }
  } catch (err) {
    console.error(err);
    alert("Failed to load user data");
  }
}

// *** MODAL POPULATORS ***

// Populates the new-message.ejs partial modal with currentUser data
function populateNewMessage(user) {
  const firstName = document.getElementById("first-name-new-message");
  const lastName = document.getElementById("last-name-new-message");
  const title = document.getElementById("title-new-message");
  const body = document.getElementById("body-new-message");

  // TODO - Does this actually clear the fields?
  firstName.innerHTML = "";
  lastName.innerHTML = "";
  title.innerHTML = "";
  body.innerHTML = "";

  firstName.innerText = user.first_name;
  lastName.innerText = user.last_name;
}

// Populates the new-message.ejs partial modal with topic data
function populateNewMessageWithTopics(topics) {
  const select = document.getElementById("topic-new-message");

  // Clear existing options
  select.innerHTML = "";

  // Add placeholder option
  const placeholder = document.createElement("option");
  placeholder.value = ""; // empty value so "required" works
  placeholder.textContent = "Choose a topic";
  placeholder.disabled = true; // cannot select once another is chosen
  placeholder.selected = true; // initially selected
  select.appendChild(placeholder);

  // Add real topic options
  topics.forEach((topic) => {
    const option = document.createElement("option");
    option.className = "topic-new-message-option";
    option.value = topic.id;
    option.textContent = `➤ ${topic.name}`;
    select.appendChild(option);
  });

  // Ensure the <select> is required
  select.required = true;
}

// Populates the reply-message.ejs partial modal with currentUser data
function populateReplyMessage(user, message) {
  const firstName = document.getElementById("first-name-reply-message");
  const lastName = document.getElementById("last-name-reply-message");
  const topic = document.getElementById("topic-reply-message");
  const title = document.getElementById("title-reply-message");
  const body = document.getElementById("body-reply-message");

  firstName.innerText = user.first_name;
  lastName.innerText = user.last_name;
  topic.value = `➤ ${message.topic_name}`;
  topic.readOnly = true;
  title.value = message.title;
  title.readOnly = true;

  body.value = `💬 To "${message.first_name} ${message.last_name}" ➤ `;
}

// Populates the edit-message.ejs partial modal with currentUser data
function populateEditMessage(user, message) {
  const firstName = document.getElementById("first-name-edit-message");
  const lastName = document.getElementById("last-name-edit-message");
  const topic = document.getElementById("topic-edit-message");
  const title = document.getElementById("title-edit-message");
  const body = document.getElementById("body-edit-message");

  firstName.innerText = user.first_name;
  lastName.innerText = user.last_name;
  topic.value = `➤ ${message.topic_name}`;
  topic.readOnly = true;
  title.value = message.title;
  body.value = message.body;
}

// Populates the warning-account-deletion.ejs partial modal with user data
function populateWarningAccountDeletion(user) {
  document.getElementById("first-name-warning-account-deletion").innerText =
    user.first_name;
  document.getElementById("last-name-warning-account-deletion").innerText =
    user.last_name;
  document.getElementById("email-warning-account-deletion").innerText =
    user.email;
}

// Populates the warning-message-deletion.ejs partial modal with user and topic data
function populateWarningMessageDeletion(message) {
  document.getElementById("first-name-warning-message-deletion").innerText =
    message.first_name;
  document.getElementById("last-name-warning-message-deletion").innerText =
    message.last_name;
  document.getElementById("email-warning-message-deletion").innerText =
    message.email;
  document.getElementById("topic-name-warning-message-deletion").innerText =
    message.topic_name;
}
