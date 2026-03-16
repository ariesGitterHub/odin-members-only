function toggleVisibility(element) {element.classList.toggle("hidden");}

function updateButtonText(button, element, text) {
  element.classList.contains("hidden") 
    ? button.textContent = `open ${text}` 
    : button.textContent = `close ${text}`;}

// Toggle .hidden user census in admin.ejs
export function handleUserCensusToggle() {
  const userCensusButton = document.querySelector("#user-census-button");
  const userCensusDiv = document.querySelector("#user-census-div");
  const userCensusButtonText = "user census"

  if (userCensusButton && userCensusDiv) {
    userCensusButton.addEventListener("click", () => {
      toggleVisibility(userCensusDiv);
      updateButtonText(userCensusButton, userCensusDiv, userCensusButtonText);
    });
  }
}

// Toggle .hidden for all "guest cards" on admin.ejs
export function handleGuestCardsToggle() {
  const showGuestsButton = document.querySelector("#show-guests-button");
  const guestCardDivs = document.querySelectorAll(".guest-card");
  const showGuestsButtonText = "guest profiles";

  if (showGuestsButton && guestCardDivs.length > 0) {
    showGuestsButton.addEventListener("click", () => {
      guestCardDivs.forEach((card) => {
        toggleVisibility(card);
      });
      updateButtonText(showGuestsButton, guestCardDivs[0], showGuestsButtonText);
    })
  }
}

// Toggle .hidden for all "member cards" on admin.ejs
export function handleMemberCardsToggle() {
  const showMembersButton = document.querySelector("#show-members-button");
  const memberCardDivs = document.querySelectorAll(".member-card");
  const showMembersButtonText = "member profiles";

  if (showMembersButton && memberCardDivs.length > 0) {
    showMembersButton.addEventListener("click", () => {
      memberCardDivs.forEach((card) => {
        toggleVisibility(card);
      });
      updateButtonText(showMembersButton, memberCardDivs[0], showMembersButtonText);
    })
  }
}

// Toggle .hidden for that profile's details on admin.ejs
export function handleShowProfileToggle() {
  const showProfileButtons = document.querySelectorAll(".show-profile-button");
  const showProfileButtonText = "this profile";

  showProfileButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const profileDataDiv = button.closest('.card').querySelector('.profile-data-container');
      toggleVisibility(profileDataDiv);
      updateButtonText(button, profileDataDiv, showProfileButtonText);
    })
  });
}
