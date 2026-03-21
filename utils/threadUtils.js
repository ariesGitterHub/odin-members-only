// function buildThreadedMessages(messages) {
//   const map = {};
//   const roots = [];

//   messages.forEach((msg) => {
//     msg.children = [];
//     map[msg.id] = msg;
//     if (msg.parent_message_id) {
//       map[msg.parent_message_id]?.children.push(msg);
//     } else {
//       roots.push(msg);
//     }
//   });

//   return roots;
// }

function buildThreadedMessages(messages) {
  const map = {};
  const roots = [];

  messages.forEach((msg) => {
    msg.children = [];
    map[msg.id] = msg;
    if (msg.parent_message_id) {
      map[msg.parent_message_id]?.children.push(msg);
    } else {
      roots.push(msg);
    }
  });

  return roots;
}

module.exports = { buildThreadedMessages };