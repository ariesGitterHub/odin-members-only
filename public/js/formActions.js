export function formActionsFromModals() {
  const actionTargetButtons = document.querySelectorAll(
    ".action-target-button",
  );
  const deleteUserForm = document.getElementById("delete-user-form");
  const deleteUserTargetId = document.getElementById("delete-user-target-id");

  const deleteMessageForm = document.getElementById("delete-message-form");
  const deleteMessageTopicSlug = document.getElementById("delete-message-topic-slug");  
  const deleteMessageTargetId = document.getElementById("delete-message-target-id");

  const replyMessageForm = document.getElementById("reply-message-form");
  const replyMessageTitle = document.getElementById("reply-message-title");
  const replyMessageTargetId = document.getElementById("reply-message-target-id");
  const replyMessageTopicSlug = document.getElementById("reply-message-topic-slug");
  const replyMessageTopicName = document.getElementById("reply-message-topic-name");
  
  // TODO - get Member Stuff working...
  // const becomeMemberForm = document.getElementById("become-member-form");
  // const becomeMemberTargetId = document.getElementById("become-member-target-id");

  actionTargetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;    
      const messageTitle = button.dataset.messageTitle;      
      const topicSlug = button.dataset.topicSlug;      
      const topicName = button.dataset.topicName;      
      const targetId = button.dataset.targetId;

      console.log("You are looking for this number:", targetId);

      if (deleteUserForm) {
        deleteUserForm.action = action;
        deleteUserTargetId.value = targetId;
      }

      if (deleteMessageForm) {
        deleteMessageForm.action = action;
        deleteMessageTopicSlug.value = topicSlug;
        deleteMessageTargetId.value = targetId;
      }

      if (replyMessageForm) {
        replyMessageForm.action = action;
        replyMessageTitle.value = messageTitle;
        replyMessageTopicSlug.value = topicSlug;
        replyMessageTopicName.value = topicName;
        replyMessageTargetId.value = targetId;
      }

      // if (becomeMemberForm) {
      //   becomeMemberForm.action = action;
      //   becomeMemberTargetId.value = targetId;
      // }
    });
  });
}
