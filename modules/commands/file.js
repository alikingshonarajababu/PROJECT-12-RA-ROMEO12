const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "file",
  version: "1.0.0",
  hasPermission: 3,
  credits: "KOJA-PROJECT",
  premium:false,
  commandCategory: "system",
  description: "List and delete bot modules",
  usages: "list | dlt <index>",
  cooldowns: 3
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const allowedUID = ['']; 
  if (!allowedUID.includes(event.senderID)) {
      return api.sendMessage("only Koja Babu Can you Use this Command", event.threadID);
  }
  const folderPath = __dirname;

  if (!args[0]) {
    return api.sendMessage("Use:\n• file list — to view files\n• file dlt <index> — to delete a file", threadID, messageID);
  }

  const files = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));

  if (args[0] === "list") {
    if (files.length === 0) return api.sendMessage("No .js files found in this folder.", threadID, messageID);

    const list = files.map((file, i) => `${i + 1}. ${file}`).join("\n");
    return api.sendMessage(`📄 List of module files:\n\n${list}`, threadID, messageID);
  }

  if (args[0] === "dlt") {
    const index = parseInt(args[1]) - 1;
    if (isNaN(index) || index < 0 || index >= files.length) {
      return api.sendMessage("⚠️ Invalid file index.", threadID, messageID);
    }

    const fileToDelete = path.join(folderPath, files[index]);

    try {
      fs.unlinkSync(fileToDelete);
      return api.sendMessage(`🗑️ Deleted file: ${files[index]}`, threadID, messageID);
    } catch (err) {
      return api.sendMessage(`❌ Failed to delete ${files[index]}.\nError: ${err.message}`, threadID, messageID);
    }
  }

  return api.sendMessage("Invalid command. Use:\n• cmd list\n• cmd dlt <index>", threadID, messageID);
};
