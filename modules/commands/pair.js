module.exports.config = {
  name: "pair",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "KOJA",
  description: "Randomly pairs two members in the chat and calculates love compatibility.",
  commandCategory: "Fun",
  usages: "pair",
  cooldowns: 5
};

module.exports.run = async function({ api, event, Threads, Users }) {
  const axios = require("axios");
  const fs = require("fs-extra");

  // Get thread participants
  const threadData = await Threads.getData(event.threadID);
  const participantIDs = threadData.threadInfo.participantIDs;

  const botID = api.getCurrentUserID();
  const userID = event.senderID;
  const otherUserIDs = participantIDs.filter(id => id !== botID && id !== userID);

  if (otherUserIDs.length === 0) {
    return api.sendMessage("No other members to pair with!", event.threadID, event.messageID);
  }

  const randomUserID = otherUserIDs[Math.floor(Math.random() * otherUserIDs.length)];

  const userData = await Users.getData(userID);
  const otherUserData = await Users.getData(randomUserID);

  const userName = userData.name;
  const otherUserName = otherUserData.name;

  const mentions = [
    { id: userID, tag: userName },
    { id: randomUserID, tag: otherUserName }
  ];

  // Love percentage
  const lovePercentage = Math.floor(Math.random() * 101);

  // List of Imgur images/gifs
  const imgurLinks = [
    "https://i.ibb.co/JF0xCVt4/love1.gif",
    "https://i.ibb.co/8nVxSYBp/love2.gif",
    "https://i.ibb.co/RGwDcqB0/love3.gif",
    "https://i.ibb.co/fdBQKhXB/love4.gif",
    "https://i.ibb.co/W7JY2dp/love5.gif",
    "https://i.ibb.co/gZNQtT1s/love6.gif"
  ];

  const selectedImgur = imgurLinks[Math.floor(Math.random() * imgurLinks.length)];

  // Download gif
  const gifData = (await axios.get(selectedImgur, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(__dirname + "/cache/giflove.gif", Buffer.from(gifData, "utf-8"));

  // Download avatars
  const avatar1 = (await axios.get(
    `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
    { responseType: "arraybuffer" }
  )).data;
  fs.writeFileSync(__dirname + "/cache/avt1.png", Buffer.from(avatar1, "utf-8"));

  const avatar2 = (await axios.get(
    `https://graph.facebook.com/${randomUserID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
    { responseType: "arraybuffer" }
  )).data;
  fs.writeFileSync(__dirname + "/cache/avt2.png", Buffer.from(avatar2, "utf-8"));

  const attachments = [
    fs.createReadStream(__dirname + "/cache/avt1.png"),
    fs.createReadStream(__dirname + "/cache/giflove.gif"),
    fs.createReadStream(__dirname + "/cache/avt2.png")
  ];

  const message = {
    body: `💘 LOOK! YOU’VE FOUND YOUR LIFE PARTNER 💘\nLove Compatibility: ${lovePercentage}%\n${userName} 💖 ${otherUserName}`,
    mentions: mentions,
    attachment: attachments
  };

  return api.sendMessage(message, event.threadID, event.messageID);
};
