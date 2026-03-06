// I almost had an issue where I needed to stop using id to query elements and switch to using class, though this was discarded due to me getting rid of the need to have the same code in two places. So unique ids are now unique for real again.
//But this is a good refresher on how to conveniently use and add document.querySelectorAll for when there are multiple class targeted elements in the DOM.

// See the use of formElements.forEach(form => {}) in all of these.
async function populateChangeAvatar(user) {
  // Find all instances of forms with the class "profile-data-form"
  const formElements = document.querySelectorAll(".profile-data-form");

  formElements.forEach((form) => {
    // Hide fields that are not meant to be used by a "guest"
    const changeAvatarHideElement = form.querySelector(
      ".change-avatar-hide-element",
    );
    if (user.permission_status === "guest") {
      changeAvatarHideElement.classList.add("hidden");
    } else {
      changeAvatarHideElement.classList.remove("hidden");
    }

    // Access CSS variables
    const rootStyles = getComputedStyle(document.documentElement);
    const avatarColorFg = rootStyles
      .getPropertyValue("--avatar-color-fg")
      .trim();
    const avatarColorBgTop = rootStyles
      .getPropertyValue("--avatar-color-bg-top")
      .trim();
    const avatarColorBgBottom = rootStyles
      .getPropertyValue("--avatar-color-bg-bottom")
      .trim();

    // Populate input fields inside the current form
    form.querySelector(".avatar_type").value = user.avatar_type || "";
    form.querySelector(".avatar_color_fg").value =
      user.avatar_color_fg || avatarColorFg;
    form.querySelector(".avatar_color_bg_top").value =
      user.avatar_color_bg_top || avatarColorBgTop;
    form.querySelector(".avatar_color_bg_bottom").value =
      user.avatar_color_bg_bottom || avatarColorBgBottom;

    // Update the current avatar (for each form instance)
    const currentAvatarElements = form.querySelectorAll(".current-avatar");
    currentAvatarElements.forEach((currentAvatarElement) => {
      currentAvatarElement.textContent = user.avatar_type || "";
      currentAvatarElement.style.color = user.avatar_color_fg || avatarColorFg;
      currentAvatarElement.style.background = `linear-gradient(5deg, ${user.avatar_color_bg_bottom || avatarColorBgTop}, ${user.avatar_color_bg_top || avatarColorBgBottom})`;
    });

    // Update the avatar type text
    const avatarTypeTextElements = form.querySelectorAll(".avatar-type-text");
    avatarTypeTextElements.forEach(async (avatarTypeText) => {
      avatarTypeText.textContent = await findInitialEmojiText(user.avatar_type);
    });

    // Initialize the emoji picker for each form
    emojiPickerDiv();
  });
}

async function emojiPickerDiv() {
  // Find all instances of emoji panel within each form
  const formElements = document.querySelectorAll(".profile-data-form");

  formElements.forEach(async (form) => {
    // Select emoji panel and emoji list within the current form
    const emojiPanel = form.querySelector(".emoji-panel");
    const emojiList = form.querySelector(".emoji-list");

    if (!emojiPanel || !emojiList) return;

    // Load and sort the emoji data
    const emojiMapSorted = await loadEmojis(); // Ensure loadEmojis() is already optimized

    // Clear any existing options
    emojiList.innerHTML = "";

    // Create radio button options for each emoji
    emojiMapSorted.forEach((emoji, index) => {
      const emojiOption = document.createElement("div");
      emojiOption.classList.add("emoji-option");

      const input = document.createElement("input");
      input.type = "radio";
      input.name = `emoji-${form.id}`; // Ensure each form has unique name for radio buttons
      input.id = `emoji-${form.id}-${index}`;
      input.value = emoji.emoji;
      input.dataset.text = emoji.text; // Use data-text to store the emoji text
      input.setAttribute("aria-label", emoji.text);

      const label = document.createElement("label");
      label.setAttribute("for", `emoji-${form.id}-${index}`);
      label.setAttribute("aria-labelledby", `emoji-${form.id}-${index}`);

      const span = document.createElement("span");
      span.className = "emoji";
      span.textContent = `${emoji.emoji}`;

      const p = document.createElement("p");
      p.textContent = ` - ${emoji.text}`;

      label.appendChild(span);
      label.appendChild(p);
      emojiOption.appendChild(input);
      emojiOption.appendChild(label);

      emojiList.appendChild(emojiOption);
    });

    // Handle radio button selection
    emojiList.addEventListener("change", (e) => {
      if (e.target.name.startsWith("emoji-")) {
        const selectedEmoji = e.target.value;
        const selectedText = e.target.dataset.text; // Access the data-text attribute

        // Perform the necessary action with selectedEmoji, e.g., updating the preview
        const avatarTypeText = form.querySelector(".avatar-type-text");
        const avatarInput = form.querySelector(".avatar_type");
        const newAvatarElement = form.querySelector(".new-avatar");

        avatarTypeText.textContent = selectedText; // Set selected text
        avatarInput.value = selectedEmoji; // Set emoji value
        newAvatarElement.textContent = selectedEmoji; // Update preview
      }
    });
  });
}

function initChangeAvatarModal() {
  // Find all forms with the avatar change modal structure
  const formElements = document.querySelectorAll(".profile-data-form");

  formElements.forEach((form) => {
    const avatarInput = form.querySelector(".avatar_type");
    const avatarColorPickerFg = form.querySelector(".avatar_color_fg");
    const avatarColorPickerBgt = form.querySelector(".avatar_color_bg_top");
    const avatarColorPickerBgb = form.querySelector(".avatar_color_bg_bottom");
    const newAvatarElement = form.querySelector(".new-avatar");

    // Exit safely if any necessary elements are missing
    if (
      !avatarInput ||
      !avatarColorPickerFg ||
      !avatarColorPickerBgt ||
      !avatarColorPickerBgb ||
      !newAvatarElement
    ) {
      return;
    }

    function updateAvatarPreview() {
      newAvatarElement.textContent = avatarInput.value;
      newAvatarElement.style.color = avatarColorPickerFg.value;
      newAvatarElement.style.background = `
        linear-gradient(5deg,
          ${avatarColorPickerBgb.value},
          ${avatarColorPickerBgt.value}
        )`;
    }

    // Attach listeners once for each form instance
    avatarInput.addEventListener("input", updateAvatarPreview);
    avatarColorPickerFg.addEventListener("input", updateAvatarPreview);
    avatarColorPickerBgt.addEventListener("input", updateAvatarPreview);
    avatarColorPickerBgb.addEventListener("input", updateAvatarPreview);

    // Run once on init so preview matches loaded values
    updateAvatarPreview();
  });
}

<% 
  const states = [
    { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" }, { code: "AZ", name: "Arizona" },
    { code: "AR", name: "Arkansas" }, { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
    { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" }, { code: "DC", name: "Washington, DC" },
    { code: "FL", name: "Florida" }, { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" },
    { code: "ID", name: "Idaho" }, { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" },
    { code: "IA", name: "Iowa" }, { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" },
    { code: "LA", name: "Louisiana" }, { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" },
    { code: "MA", name: "Massachusetts" }, { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" },
    { code: "MS", name: "Mississippi" }, { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" },
    { code: "NE", name: "Nebraska" }, { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" },
    { code: "NJ", name: "New Jersey" }, { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" },
    { code: "NC", name: "North Carolina" }, { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" },
    { code: "OK", name: "Oklahoma" }, { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" },
    { code: "RI", name: "Rhode Island" }, { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" },
    { code: "TN", name: "Tennessee" }, { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" },
    { code: "VT", name: "Vermont" }, { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" },
    { code: "WV", name: "West Virginia" }, { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" }
  ];
%>

<select id="us-state-admin-edit-page" name="us_state" required>
  <% states.forEach(state => { %>
    <option value="<%= state.code %>" <%= user.us_state === state.code ? "selected" : "" %>>
      <%= state.name %>
    </option>
  <% }) %>
</select>

 <pre><%= JSON.stringify(currentUser, null, 2) %></pre>