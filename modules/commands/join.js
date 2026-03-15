module.exports.config = {
  name: "join",
  version: "1.0.0",
  hasPermission: 2,
  prefix: true,
  credits: "KOJA-PROJECT",
  premium: false,
  commandCategory: "system",
  description: "Join the specified group chat",
  usages: "[threadID]",
  cooldowns: 0,
  hasPrefix: true
};

module.exports.run = function({ api, event, args }) {
  try {
    // If no threadID is provided, list available groups
    if (!args[0]) {
      api.getThreadList(20, null, ["INBOX"], (err, threads) => {
        if (err) {
          console.error("Error fetching thread list:", err);
          api.sendMessage("Failed to fetch group list. Try again later.", event.threadID);
          return;
        }

        const filteredThreads = threads.filter(thread => thread.name);
        if (filteredThreads.length === 0) {
          api.sendMessage("No group chats found.", event.threadID);
          return;
        }

        const formattedList = filteredThreads.map((thread, index) =>
          `│${index + 1}. ${thread.name}\n│TID: ${thread.threadID}\n│Total members: ${thread.participantIDs ? thread.participantIDs.length : "N/A"}\n│`
        );

        const message = `╭─╮\n│List of group chats:\n${formattedList.join("\n")}\n╰───────────ꔪ\nMaximum members = 250\n\nTo join a group, reply with: "join {threadID}"\nExample: "join 6799332630181479"`;

        api.sendMessage(message, event.threadID);
      });
    } else {
      // Join group by threadID
      const threadID = args[0];

      api.getThreadInfo(threadID, (err, threadInfo) => {
        if (err || !threadInfo) {
          api.sendMessage("Invalid thread ID. Please provide a valid group chat ID.", event.threadID);
          return;
        }

        if (threadInfo.participantIDs.includes(event.senderID)) {
          api.sendMessage(`You're already in the group: ${threadInfo.name}`, event.threadID);
          return;
        }

        if (threadInfo.participantIDs.length >= 250) {
          api.sendMessage(`Cannot join. The group is full: ${threadInfo.name}`, event.threadID);
          return;
        }

        api.addUserToGroup(event.senderID, threadID, (err2) => {
          if (err2) {
            console.error("Error adding user to group:", err2);
            api.sendMessage("Failed to join the group. Check bot permissions.", event.threadID);
            return;
          }
          api.sendMessage(`You have joined the group: ${threadInfo.name}`, event.threadID);
        });
      });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    api.sendMessage("An unexpected error occurred.", event.threadID);
  }
};
