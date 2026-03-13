const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const Jimp = require("jimp");

module.exports.config = {
  name: "dp11",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Miss Aliya 💫",
  description: "Create a display picture with profile pic",
  commandCategory: "Love",
  usages: "[@mention or reply to image]",
  cooldowns: 5,
};

const cacheDir = path.join(__dirname, "cache", "canvas");

// Template link
const templateUrls = [
  "https://i.ibb.co/LX3qWqB3/da0dde329b3c.jpg",
  "https://i.imgur.com/Gc3Hs2Q.png",
  "https://i.imgur.com/q9ZzTkR.png"
];
const templatePath = path.join(cacheDir, "dp11_template.png");

// Fallback template
async function createFallbackTemplate() {
  const width = 800;
  const height = 800;
  const image = await Jimp.create(width, height, 0xff69b4);
  return image;
}

async function downloadTemplate() {
  try {
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    if (fs.existsSync(templatePath)) {
      return true;
    }
    for (const url of templateUrls) {
      try {
        console.log(`Trying to download template from: ${url}`);
        const response = await axios.get(url, { 
          responseType: "arraybuffer",
          timeout: 10000,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        if (response.status === 200) {
          fs.writeFileSync(templatePath, Buffer.from(response.data));
          console.log("Template downloaded successfully!");
          return true;
        }
      } catch (err) {
        console.log(`Failed to download from ${url}:`, err.message);
        continue;
      }
    }
    console.log("Creating fallback template...");
    const fallbackImage = await createFallbackTemplate();
    await fallbackImage.writeAsync(templatePath);
    return true;
  } catch (error) {
    console.error("Error in downloadTemplate:", error);
    return false;
  }
}

async function getAvatar(uid) {
  try {
    const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const response = await axios.get(url, { responseType: "arraybuffer", timeout: 10000 });
    return Buffer.from(response.data);
  } catch (error) {
    console.error("Error getting avatar:", error);
    const fallbackImage = await Jimp.create(512, 512, 0x808080);
    return await fallbackImage.getBufferAsync(Jimp.MIME_PNG);
  }
}

async function getImageFromReply(event) {
  try {
    if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments[0]) {
      const attachment = event.messageReply.attachments[0];
      if (attachment.type === "photo") {
        const imgUrl = attachment.url;
        const response = await axios.get(imgUrl, { responseType: "arraybuffer", timeout: 10000 });
        return Buffer.from(response.data);
      }
    }
  } catch (error) {
    console.error("Error getting replied image:", error);
  }
  return null;
}

// ✅ RECTANGULAR IMAGE
async function resizeImage(buffer, width, height) {
  try {
    const image = await Jimp.read(buffer);
    image.resize(width, height);
    return image;
  } catch (error) {
    console.error("Error resizing image:", error);
    const fallback = await Jimp.create(width, height, 0xff69b4);
    return fallback;
  }
}

async function getUserInfo(api, uid) {
  return new Promise((resolve) => {
    api.getUserInfo(uid, (err, info) => {
      if (err) return resolve({});
      resolve(info[uid] || {});
    });
  });
}

function isValidName(name) {
  if (!name || name.trim() === '') return false;
  const lower = name.toLowerCase();
  if (lower === 'facebook' || lower === 'facebook user' || lower.includes('facebook user')) return false;
  if (lower === 'unknown' || lower === 'user') return false;
  return true;
}

async function getProperName(api, uid, Users, mentionName = null) {
  try {
    if (mentionName && isValidName(mentionName)) {
      const cleanName = mentionName.replace(/@/g, '').trim();
      if (isValidName(cleanName)) return cleanName;
    }
    if (Users && Users.getNameUser) {
      try {
        const name = await Users.getNameUser(uid);
        if (isValidName(name)) return name;
      } catch {}
    }
    const info = await getUserInfo(api, uid);
    if (isValidName(info.name)) return info.name;
    if (isValidName(info.firstName)) return info.firstName;
    if (isValidName(info.alternateName)) return info.alternateName;
  } catch (error) {
    console.error("Error getting name:", error);
  }
  return 'Jaan';
}

module.exports.run = async ({ api, event, Users }) => {
  const { threadID, messageID, senderID } = event;
  const mention = Object.keys(event.mentions);

  try {
    const templateDownloaded = await downloadTemplate();
    if (!templateDownloaded) {
      return api.sendMessage("❌ Template download failed! Try again later.", threadID, messageID);
    }

    // ✅ Image source: reply, mention, ya default
    let imageBuffer;
    let targetID = senderID;
    let targetName;

    const repliedImage = await getImageFromReply(event);
    
    if (repliedImage) {
      imageBuffer = repliedImage;
      targetName = "Your Image";
    } else if (mention[0]) {
      targetID = mention[0];
      imageBuffer = await getAvatar(targetID);
    } else {
      imageBuffer = await getAvatar(senderID);
    }

    let mentionName = mention[0] ? event.mentions[mention[0]] : null;
    targetName = await getProperName(api, targetID, Users, mentionName);

    // ✅ IMAGE SIZE: width 240, height 310 (jaisa tune kaha)
    const imgWidth = 240;
    const imgHeight = 310;  // ← 310 kar diya
    
    const userImage = await resizeImage(imageBuffer, imgWidth, imgHeight);

    let template;
    try {
      template = await Jimp.read(templatePath);
    } catch (error) {
      console.error("Error reading template, creating fallback:", error);
      template = await createFallbackTemplate();
    }
    
    // ⭐ SIMPLE POSITION - jese upar vale me likha tha
    const posX = 210;  // ← left-right
    const posY = 110;  // ← up-down
    
    template.composite(userImage, posX, posY);

    const outputPath = path.join(cacheDir, `dp11_${targetID}_${Date.now()}.png`);
    await template.writeAsync(outputPath);

    // ❌ Shayari nahi
    api.sendMessage(
      {
        body: `✨ 𝐌𝐑 𝐀𝐋𝐈 ✨\n\n👤 ${targetName}\n\n💕 𝐘𝐨𝐮𝐫 𝐃𝐏 𝐢𝐬 𝐫𝐞𝐚𝐝𝐲!`,
        attachment: fs.createReadStream(outputPath),
        mentions: [{ tag: targetName, id: targetID }]
      },
      threadID,
      () => {
        try {
          fs.unlinkSync(outputPath);
        } catch (e) {}
      },
      messageID
    );

  } catch (error) {
    console.error("DP11 com    api.sendMessage("❌ Error creating DP! " + error.mess
};