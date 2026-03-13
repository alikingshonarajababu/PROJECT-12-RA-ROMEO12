const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "install",
  version: "2.0.0",
  hasPermssion: 2, // Admin only
  credits: "Reply Installer",
  description: "Install command by replying to code",
  commandCategory: "system",
  usages: ".install <filename>",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  try {
    if (!args[0])
      return api.sendMessage("⚠️ File name do!", event.threadID, event.messageID);

    if (!event.messageReply || !event.messageReply.body)
      return api.sendMessage("⚠️ Code wale message ka reply karo!", event.threadID, event.messageID);

    const fileName = args[0].endsWith(".js") ? args[0] : args[0] + ".js";
    const code = event.messageReply.body;

    const filePath = path.join(__dirname, fileName);

    await fs.writeFile(filePath, code);

    return api.sendMessage(
      `✅ ${fileName} successfully install ho gaya!\n🔄 Bot restart karo ya reload command use karo.`,
      event.threadID,
      event.messageID
    );

  } catch (err) {
    console.error(err);
    api.sendMessage("❌ Install error!", event.threadID, event.messageID);
  }
};