export function formActions() {
  const actionTargetButtons = document.querySelectorAll(
    ".action-target-button",
  );
  const deleteUserForm = document.getElementById("delete-user-form");
  const deleteMessageForm = document.getElementById("delete-message-form");
  const deleteUserTargetId = document.getElementById("delete-user-target-id");
  const deleteMessageTargetId = document.getElementById(
    "delete-message-target-id",
  );
  const deleteMessageTopicSlug = document.getElementById(
    "delete-message-topic-slug",
  );
  // const becomeMemberForm = document.getElementById("become-member-form");
  // const becomeMemberTargetId = document.getElementById("become-member-target-id");

  actionTargetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.targetId;
      const action = button.dataset.action;
      const slug = button.dataset.slug;

      console.log("You are looking for this number:", targetId);
      if (deleteUserForm) {
        deleteUserForm.action = action;
        deleteUserTargetId.value = targetId;
      }

      if (deleteMessageForm) {
        deleteMessageForm.action = action;
        deleteMessageTargetId.value = targetId;
        deleteMessageTopicSlug.value = slug;
      }

      // if (becomeMemberForm) {
      //   becomeMemberForm.action = action;
      //   becomeMemberTargetId.value = targetId;
      // }
    });
  });
}
