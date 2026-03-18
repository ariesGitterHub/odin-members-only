export function formActionsFromModals() {
  const actionTargetButtons = document.querySelectorAll(
    ".action-target-button",
  );
  const deleteUserForm = document.getElementById("delete-user-form");
  const deleteUserTargetId = document.getElementById("delete-user-target-id");

  const deleteMessageForm = document.getElementById("delete-message-form");
  const deleteMessageTopicSlug = document.getElementById("delete-message-topic-slug");  
  const deleteMessageTargetId = document.getElementById("delete-message-target-id");
  
  // TODO - get Member Stuff working...
  // const becomeMemberForm = document.getElementById("become-member-form");
  // const becomeMemberTargetId = document.getElementById("become-member-target-id");

  actionTargetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;    
      const slug = button.dataset.slug;      
      const targetId = button.dataset.targetId;

      console.log("You are looking for this number:", targetId);

      if (deleteUserForm) {
        deleteUserForm.action = action;
        deleteUserTargetId.value = targetId;
      }

      if (deleteMessageForm) {
        deleteMessageForm.action = action;
        deleteMessageTopicSlug.value = slug;
        deleteMessageTargetId.value = targetId;
      }

      // if (becomeMemberForm) {
      //   becomeMemberForm.action = action;
      //   becomeMemberTargetId.value = targetId;
      // }
    });
  });
}
