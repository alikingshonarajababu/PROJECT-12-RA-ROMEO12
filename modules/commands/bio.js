module.exports.config = {
  name: "bio",
  version: "1.0.0",
  hasPermission: 2,
  prefix: true,
  credits: "KOJA-PROJECT",
  premium:false,
  commandCategory: "admin",
  description: "Change the bot's biography",
  usages: "bio [new biography]",
  cooldowns: 10,
};

module.exports.run = async ({ api, event, args }) => {
  try {
    // Combine arguments to form the new biography
    const newBio = args.join(" ");

    if (!newBio) {
      return api.sendMessage("Please provide a new biography.", event.threadID, event.messageID);
    }

    // Attempt to change the bot's biography
    api.changeBio(newBio, (error) => {
      if (error) {
        return api.sendMessage(`An error occurred: ${error}`, event.threadID, event.messageID);
      }
      return api.sendMessage(`Has changed the bio of the bot to account : \n${newBio}`, event.threadID, event.messageID);
    });

  } catch (error) {
    api.sendMessage(`Error in the bio command: ${error.message}`, event.threadID, event.messageID);
  }
};
