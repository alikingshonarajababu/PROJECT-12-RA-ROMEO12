module.exports.config = {
  name: "unban",
  version: "1.2.0",
  hasPermission: 2, // Admin-level command
  credits: "KOJA XD (English Version by ChatGPT)",
  description: "Unban a user previously banned, mentioning them in the chat. Only admins or NDH members can use this.",
  commandCategory: "system",
  usages: "[uid or reply to a user]",
  cooldowns: 3
};

module.exports.run = async ({ event, api, args, Users }) => {
  const { threadID, messageID, senderID, type, messageReply } = event;

  // Allowed users: global.config.NDH + main admins
  const ndhList = global.config.NDH || [];
  const mainAdmins = global.config.ADMINBOT || [];
  const allowedUsers = [...new Set([...ndhList, ...mainAdmins])];

  if (!allowedUsers.includes(senderID)) {
    return api.sendMessage("⚠️ You do not have permission to use this command.", threadID, messageID);
  }

  // Determine target user
  let targetID;
  if (type === "message_reply") {
    targetID = messageReply.senderID;
  } else {
    targetID = args[0];
  }

  if (!targetID || isNaN(targetID)) {
    return api.sendMessage("❌ Please provide a valid user ID or reply to the user you want to unban.", threadID, messageID);
  }

  // Check if user is banned
  const bannedData = global.data.userBanned.get(targetID);
  if (!bannedData) {
    return api.sendMessage("✅ This user is not currently banned.", threadID, messageID);
  }

  // Remove ban data
  global.data.userBanned.delete(targetID);
  let userData = await Users.getData(targetID);
  if (userData && userData.data && userData.data.banned) {
    userData.data.banned = 0;
    userData.data.reason = null;
    await Users.setData(targetID, { data: userData.data });
  }

  // Get user name
  const userName = await Users.getNameUser(targetID);

  // Mention user in the thread
  const mention = [{ tag: userName, id: targetID }];
  api.sendMessage(
    {
      body: `🟢 ${userName} has been unbanned and can now use the bot again!`,
      mentions: mention
    },
    threadID,
    messageID
  );

  // Optional: notify the user privately
  try {
    api.sendMessage(
      `✅ Hello ${userName}, you have been unbanned by an admin. You can now use the bot again!`,
      targetID
    );
  } catch (err) {
    console.log("⚠️ Couldn't send DM to unbanned user:", err);
  }
};
