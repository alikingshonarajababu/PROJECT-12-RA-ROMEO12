const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "userinfo",
  version: "1.0.3",
  hasPermission: 0,
  credits: "KOJA-PROJECT",
  description: "Get information about a user and send their avatar photo",
  usages: "[userID | mention]",
  cooldowns: 5,
  commandCategory: "info",
  hasPrefix: true
};

module.exports.run = async function({ api, event, args }) {
  try {
    // Get mentioned user or use first argument
    const mentioned = Object.keys(event.mentions || {});
    const targetId = mentioned.length ? mentioned[0] : args[0];

    if (!targetId) {
      api.sendMessage("Please provide a user ID or mention a user.", event.threadID);
      return;
    }

    api.getUserInfo(targetId, async (err, userInfo) => {
      if (err || !userInfo[targetId]) {
        console.error(err);
        api.sendMessage("Could not fetch user information. Make sure the ID is valid.", event.threadID);
        return;
      }

      const info = userInfo[targetId];
      const gender = info.gender === "MALE" ? "👨 Male" : info.gender === "FEMALE" ? "👩 Female" : "❓ Unknown";
      const isFriend = info.isFriend ? "✅ Friend" : "❌ Not a Friend";
      const isBirthday = info.isBirthday ? "🎉 Birthday Today!" : "";

      // Download avatar to temp file
      const avatarPath = path.join(__dirname, `avatar_${targetId}.jpg`);
      const response = await axios.get(info.thumbSrc, { responseType: "arraybuffer" });
      fs.writeFileSync(avatarPath, Buffer.from(response.data, "binary"));

      const message = 
        `📝 User Information:\n\n` +
        `👤 Name: ${info.name}\n` +
        `🆔 User ID: ${targetId}\n` +
        `🧑 First Name: ${info.firstName}\n` +
        `⚧ Gender: ${gender}\n` +
        `🤝 Friend Status: ${isFriend}\n` +
        `${isBirthday}`;

      // Send message with avatar
      api.sendMessage({ body: message, attachment: fs.createReadStream(avatarPath) }, event.threadID, () => {
        // Delete temporary avatar file
        fs.unlinkSync(avatarPath);
      });
    });

  } catch (error) {
    console.error("Unexpected error in userinfo command:", error);
    api.sendMessage("An unexpected error occurred while fetching user info.", event.threadID);
  }
};
