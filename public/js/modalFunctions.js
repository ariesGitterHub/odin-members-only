import {
  fetchUserData,
  fetchMessageData,
  fetchTopicNameData,
  fetchCurrentUserData,
  // fetchEmojiData,
} from "./dataFetchers.js";

import { handleEmojiOpen } from "./emojiFunctions.js"

// const usStates = [
//   //   { code: "", name: "Choose state" },
//   { code: "", name: "Choose state", disabled: true }, // Placeholder
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


// *** BASIC FUNCTIONS ***

// Open modal

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


// TODO - delete later, no longer using edit profile modal

// Helper to reopen the modal when errors exist.
// export function reopenModalIfErrors() {
//   const modal = document.getElementById("modal");
//   const editProfileModal = document.getElementById("modal-edit-profile");

//   // if (!modal && !editProfileModal) return;
//   if (!modal || !editProfileModal) return;

//   const errorExists = document.querySelector(".error");

//   if (errorExists) {
//     modal.classList.remove("hidden");
//     editProfileModal.classList.remove("hidden");
//   }
// }

// export function reopenModalIfErrors(user) {
//   const modal = document.getElementById("modal");
//   const editProfileModal = document.getElementById("modal-edit-profile");

//   if (!modal || !editProfileModal) return;

//   const errorExists = document.querySelector(".error");

//   if (errorExists) {
//     modal.classList.remove("hidden");
//     editProfileModal.classList.remove("hidden");

//     if (user) {
//       populateEditProfileUser(user); // safely fill in inputs (never password)
//     }
//   }
// }



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
        populateReplyMessage(
          currentUser,
          message);
        openModal(sectionId, titleId);
      }

      if (sectionId === "modal-edit-message") {
        const currentUser = await fetchCurrentUserData(targetId);
        const message = await fetchMessageData(targetId);
        populateEditMessage(
          currentUser,
          message,
        );
        openModal(sectionId, titleId);
      }

      // TODO - delete later no longer using edit profile modal
      //  if (sectionId === "modal-edit-profile") {
      //    const currentUser = await fetchCurrentUserData(targetId);
      //    console.log(JSON.stringify(currentUser.birthdate));
      //    populateEditProfileUser(currentUser);
      //    openModal(sectionId, titleId);
      //  }

      // TODO - Decide where this goes later, testing emoji/avatar related code in emojiFunctions.js
      //  if (sectionId === "modal-change-avatar-user") {
      //    const currentUser = await fetchCurrentUserData(targetId);
      //    populateChangeAvatar(currentUser);
      //    openModal(sectionId, titleId);
      //    initChangeAvatarModal();
      //    console.log("modal-change-avatar-user");
      //  }

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

  // Populates the edit-profile.ejs partial modal with currentUser data
  // function populateEditProfileUser(user) {
  //   document.getElementById("first-name-edit-profile").value = user.first_name;
  //   document.getElementById("last-name-edit-profile").value = user.last_name;
  //   document.getElementById("email-edit-profile").value = user.email;
  //   document.getElementById("phone-edit-profile").value = user.phone || "";

  //   // document.getElementById("birthdate-edit-profile").value = user.birthdate;

  //   // Format birthdate for input/display
  //   let rawBirthdate = user.birthdate;
  //   console.log(rawBirthdate);

  //   if (rawBirthdate.includes("T")) {
  //     rawBirthdate = rawBirthdate.split("T")[0];
  //   }

  //   console.log(rawBirthdate);
  //   document.getElementById("birthdate-edit-profile").value = rawBirthdate;
  //   // document.getElementById("password-edit-profile").value = user.password_hash;
  //   document.getElementById("street-address-edit-profile").value =
  //     user.street_address || "";
  //   document.getElementById("apt-unit-edit-profile").value =
  //     user.apt_unit || "";
  //   document.getElementById("city-edit-profile").value = user.city || "";
  //   document.getElementById("us-state-edit-profile").value =
  //     user.us_state || "";
  //   document.getElementById("zip-code-edit-profile").value =
  //     user.zip_code || "";

  //   //NEW

  //   // Add placeholder option
  //   const select = document.getElementById("us-state-edit-profile");
  //   const placeholder = document.createElement("option");
  //   placeholder.value = ""; // empty value so "required" works
  //   placeholder.textContent = "Choose state";
  //   placeholder.disabled = true; // cannot select once another is chosen
  //   placeholder.selected = true; // initially selected
  //   select.appendChild(placeholder);

  //   // Add real topic options
  //   usStates.forEach((state) => {
  //     const option = document.createElement("option");
  //     // option.className = "topic-new-message-option";
  //     option.value = state.code;
  //     option.textContent = state.name;
  //     select.appendChild(option);
  //   });

  //   // Ensure the <select> is required
  //   select.required = true;
  // }

  // function populateEditProfileUser(user) {
  //   document.getElementById("first-name-edit-profile").value = user.first_name;
  //   document.getElementById("last-name-edit-profile").value = user.last_name;
  //   document.getElementById("email-edit-profile").value = user.email;
  //   document.getElementById("phone-edit-profile").value = user.phone || "";

  //   // Format birthdate for input/display
  //   let rawBirthdate = user.birthdate;
  //   if (rawBirthdate && rawBirthdate.includes("T")) {
  //     rawBirthdate = rawBirthdate.split("T")[0];
  //   }
  //   document.getElementById("birthdate-edit-profile").value =
  //     rawBirthdate || "";

  //   document.getElementById("street-address-edit-profile").value =
  //     user.street_address || "";
  //   document.getElementById("apt-unit-edit-profile").value =
  //     user.apt_unit || "";
  //   document.getElementById("city-edit-profile").value = user.city || "";
  //   document.getElementById("zip-code-edit-profile").value =
  //     user.zip_code || "";

  //   // Populate the state dropdown
  //   const select = document.getElementById("us-state-edit-profile");

  //   // Clear existing options (to prevent duplicating entries)
  //   select.innerHTML = "";

  //   // Add state options
  //   usStates.forEach((state) => {
  //     const option = document.createElement("option");
  //     option.value = state.code;
  //     option.textContent = state.name;

  //     // Set the selected option if it matches the user's state
  //     if (state.code === user.us_state) {
  //       option.selected = true;
  //     }

  //     select.appendChild(option);
  //   });

  //   // Ensure the <select> is required
  //   // select.required = true;
  // }

    // function populateEditProfileUser(user) {

    //   //Because the modal needs to reopen when using error messages, I need to get the data resent using forData
    //   document.getElementById("first-name-edit-profile").value = user.first_name;
    //   document.getElementById("last-name-edit-profile").value = user.last_name;
    //   document.getElementById("email-edit-profile").value = user.email;
    //   document.getElementById("phone-edit-profile").value = user.phone || "";

    //   // Format birthdate for input/display
    //   let rawBirthdate = user.birthdate;
    //   if (rawBirthdate && rawBirthdate.includes("T")) {
    //     rawBirthdate = rawBirthdate.split("T")[0];
    //   }
    //   document.getElementById("birthdate-edit-profile").value =
    //     rawBirthdate || "";

    //   document.getElementById("street-address-edit-profile").value =
    //     user.street_address || "";
    //   document.getElementById("apt-unit-edit-profile").value =
    //     user.apt_unit || "";
    //   document.getElementById("city-edit-profile").value = user.city || "";
    //   document.getElementById("zip-code-edit-profile").value =
    //     user.zip_code || "";

    //   // Populate the state dropdown
    //   const select = document.getElementById("us-state-edit-profile");

    //   // Clear existing options (to prevent duplicating entries)
    //   select.innerHTML = "";

    //   // Add state options
    //   usStates.forEach((state) => {
    //     const option = document.createElement("option");
    //     option.value = state.code;
    //     option.textContent = state.name;

    //     // Set the selected option if it matches the user's state
    //     if (state.code === user.us_state) {
    //       option.selected = true;
    //     }

    //     select.appendChild(option);
    //   });
    // }

  // Populates the new-message.ejs partial modal with currentUser data
    function populateNewMessage(user) {
      const firstName =  document.getElementById("first-name-new-message");
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
  function populateReplyMessage(
      user,
      message,
      // topic
    ) {
    const firstName = document.getElementById("first-name-reply-message");
    const lastName = document.getElementById("last-name-reply-message");
    // const replyFirstName = document.getElementById("reply-to-first-name-draft-message");
    // const replyLastName = document.getElementById("reply-to-last-name-draft-message");
    const topic = document.getElementById("topic-reply-message");
    const title = document.getElementById("title-reply-message");
    const body = document.getElementById("body-reply-message");

    firstName.innerText = user.first_name;
    lastName.innerText = user.last_name;
    // replyFirstName.innerText = message.first_name;
    // replyLastName.innerText = message.last_name;
    topic.value = `➤ ${message.topic_name}`;
    topic.readOnly = true;
    title.value = message.title;  
    title.readOnly = true;
    
    body.value = `💬 To "${message.first_name} ${message.last_name}" ➤ `;
  }

  // Populates the edit-message.ejs partial modal with currentUser data
  function populateEditMessage(
      user,
      message,
      // topic
    ) {
    const firstName = document.getElementById("first-name-edit-message");
    const lastName = document.getElementById("last-name-edit-message");
    // const replyFirstName = document.getElementById("reply-to-first-name-draft-message");
    // const replyLastName = document.getElementById("reply-to-last-name-draft-message");
    const topic = document.getElementById("topic-edit-message");
    const title = document.getElementById("title-edit-message");
    const body = document.getElementById("body-edit-message");

    firstName.innerText = user.first_name;
    lastName.innerText = user.last_name;
    // replyFirstName.innerText = message.first_name;
    // replyLastName.innerText = message.last_name;
    topic.value = `➤ ${message.topic_name}`;
    topic.readOnly = true;
    title.value = message.title;  
    // title.readOnly = true;
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

    


