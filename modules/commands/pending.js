module.exports.config = {
  name: "pending",
  version: "1.5.3",
  credits: "KOJA-PROJECT",
  hasPermission: 2,
  description: "Manage pending bot messages (approve pending users/groups)",
  commandCategory: "Admin",
  usages: "",
  cooldowns: 5,
};

// Handle the reply from the admin who chooses which pending users/groups to approve
module.exports.handleReply = async function ({ api, event, handleReply }) {
  // Only the command author can respond
  if (handleReply.author !== event.senderID) return;

  // Split reply into numbers (indexes)
  const selectedIndexes = event.body.split(" ").map((x) => parseInt(x));

  let approvedList = "";

  for (let index of selectedIndexes) {
    const threadID = handleReply.listIDs[index - 1];

    // Change nickname of the bot in that thread/group
    await api.changeNickname(
      `[ ${global.config.PREFIX} ] • ${global.config.BOTNAME || "BotMilo <3"}`,
      threadID,
      api.getCurrentUserID()
    );

    // Send welcome message
    await api.sendMessage(
      `✅ Successfully connected!\nUse "${global.config.PREFIX}help" to see all bot commands.`,
      threadID
    );

    approvedList += `ID: ${threadID}\n😶\n`;
  }

  // Delete the original message and send summary
  await api.unsendMessage(handleReply.messageID);

  return api.sendMessage(
    `✅ Successfully approved the following users/groups:\n\n${approvedList}`,
    event.threadID,
    (err, info) => {
      if (!err) {
        setTimeout(() => api.unsendMessage(info.messageID), 10000);
      }
    }
  );
};

// Run command: list all pending users/groups and wait for admin’s reply
module.exports.run = async function ({ api, event }) {
  try {
    const otherThreads = await api.getThreadList(100, null, ["OTHER"]);
    const pendingThreads = await api.getThreadList(100, null, ["PENDING"]);

    // Combine and filter subscribed threads
    const pendingList = [...otherThreads, ...pendingThreads].filter(
      (t) => t.isSubscribed === true
    );

    if (pendingList.length === 0) {
      return api.sendMessage(
        "✅ There are currently no users or groups waiting for approval.",
        event.threadID,
        event.messageID
      );
    }

    // Build a readable list
    let message = "🚫 Pending message requests:\n\n";
    const listIDs = [];
    let count = 1;

    for (const group of pendingList) {
      message += `${count}. Name: ${group.name || "No name"}\nID: ${group.threadID}\n\n`;
      listIDs.push(group.threadID);
      count++;
    }

    message +=
      "Reply with the number(s) of the user(s)/group(s) you want to approve (e.g. “1 3 4”).";

    // Send message and save handleReply context
    api.sendMessage(message, event.threadID, (err, info) => {
      if (err) return console.error(err);
      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        author: event.senderID,
        listIDs,
      });
    });
  } catch (err) {
    console.error("Error fetching pending list:", err);
    api.sendMessage("❌ Failed to fetch pending message list.", event.threadID);
  }
};
