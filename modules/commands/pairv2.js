const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "pairv2",
  version: "1.3.0",
  hasPermssion: 0,
  credits: "Khoa ",
  description: "Randomly pairs you with another group member with a fun image",
  commandCategory: "fun",
  usages: "",
  cooldowns: 10
};

module.exports.run = async function ({ api, event }) {
  // Helper function to get user's name via API
  const getNameFromApi = (userId) => new Promise((resolve) => {
    try {
      api.getUserInfo(userId, (err, userInfo) => {
        if (err) {
          console.error("api.getUserInfo error:", err);
          return resolve(null);
        }
        if (!userInfo || !userInfo[userId] || !userInfo[userId].name)
          return resolve(null);
        return resolve(userInfo[userId].name);
      });
    } catch (e) {
      console.error("getUserInfo threw:", e);
      return resolve(null);
    }
  });

  try {
    // Get thread members
    const threadInfo = await api.getThreadInfo(event.threadID);
    const members = threadInfo.userInfo;
    const botID = api.getCurrentUserID();
    const id1 = event.senderID;

    // Get sender name
    const name1 = await getNameFromApi(id1) || "User 1";

    // Filter valid candidates (everyone except sender & bot)
    const candidates = members.filter(u => u.id !== id1 && u.id !== botID);

    if (candidates.length === 0) {
      return api.sendMessage("❌ There’s no one else to pair you with!", event.threadID, event.messageID);
    }

    // Randomly pick a partner
    const randomUser = candidates[Math.floor(Math.random() * candidates.length)];
    const id2 = randomUser.id;
    const name2 = await getNameFromApi(id2) || "User 2";

    // Random compatibility score
    const score = Math.floor(Math.random() * 100) + 1;

    // Call the pairing API for photo
    const imageUrl = `http://172.81.128.14:20541/pair?id1=${id1}&id2=${id2}&odds=${score}`;
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });

    // Save image temporarily
    const imagePath = __dirname + `/cache/pair_${id1}_${id2}.png`;
    fs.writeFileSync(imagePath, Buffer.from(response.data, "binary"));

    // Send message with photo
    api.sendMessage(
      {
        body: `💞 | ${name1} is paired with ${name2}!\n💘 Compatibility: ${score}%`,
        mentions: [{ tag: name2, id: id2 }],
        attachment: fs.createReadStream(imagePath)
      },
      event.threadID,
      () => fs.unlinkSync(imagePath),
      event.messageID
    );

  } catch (err) {
    console.error(err);
    api.sendMessage("⚠️ Something went wrong while generating your pair.", event.threadID, event.messageID);
  }
};
