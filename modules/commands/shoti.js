const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

module.exports.config = {
    name: "shoti",
    version: "2.0.0",
    hasPermission: 0,
    description: "Random Shoti video from KOJA API",
    prefix: true,
    premium: false,
    credits: "KOJA-PROJECT",
    cooldowns: 10,
    commandCategory: "media"
};

module.exports.run = async function ({ api, event }) {
    try {
        const response = await axios.get(`${global.config.KOJA}/shoti`);
        const res = response.data;

        if (!res.success || !res.result?.video_hd) {
            return api.sendMessage("⚠️ Couldn't fetch video. Please try again later.", event.threadID, event.messageID);
        }

        const {
            title, author, username, region, views, like, comment, bookmark, published, video_hd
        } = res.result;

        const fileName = `${event.messageID}.mp4`;
        const filePath = path.join(__dirname, fileName);

        const videoStream = await axios({
            method: 'GET',
            url: video_hd,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        videoStream.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        const messageBody = 
`🎬 𝗧𝗶𝘁𝗹𝗲: ${title}
👤 𝗔𝘂𝘁𝗵𝗼𝗿: ${author} (@${username})
📍 𝗥𝗲𝗴𝗶𝗼𝗻: ${region}
👁️‍🗨️ 𝗩𝗶𝗲𝘄𝘀: ${views}
❤️ 𝗟𝗶𝗸𝗲𝘀: ${like}
💬 𝗖𝗼𝗺𝗺𝗲𝗻𝘁𝘀: ${comment}
🔖 𝗕𝗼𝗼𝗸𝗺𝗮𝗿𝗸𝘀: ${bookmark}
🕓 𝗣𝘂𝗯𝗹𝗶𝘀𝗵𝗲𝗱: ${published}`;

        api.sendMessage({
            body: messageBody,
            attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);

    } catch (err) {
        console.error("❌ Error fetching Shoti video:", err.message);
        api.sendMessage("🚫 An error occurred while getting the video. Try again later.", event.threadID, event.messageID);
    }
};
