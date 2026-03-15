const youtube = require('youtube-search-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "video",
    version: "1.0.1",
    permission: 0,
    prefix: true,
    premium: false,
    credits: "ALi Koja",
    description: "Play video from YouTube",
    commandCategory: "utility",
    usages: "[title]",
    cooldowns: 10,
    dependencies: {}
};

module.exports.run = async ({ api, event }) => {
    const input = event.body;
    const text = input.substring(7).trim();

    if (!text) {
        return api.sendMessage("⚠️ Please provide a title or name of the video.", event.threadID);
    }

    try {
        api.sendMessage(`🔎 Searching for "${text}"...`, event.threadID, event.messageID);
        api.setMessageReaction("🔍", event.messageID, () => {}, true);

        // Search YouTube
        const result = await youtube.GetListByKeyword(text, false, 1);
        if (!result.items || result.items.length === 0) {
            return api.sendMessage('⚠️ No results found for your search query.', event.threadID);
        }

        const video = result.items[0];
        const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;

        // Get video info from external API
        const apiUrl = `${global.config.KOJA}/ytmp4?url=${encodeURIComponent(videoUrl)}`;
        const response = await axios.get(apiUrl); // timeout removed

        if (!response.data || !response.data.success || !response.data.download?.url) {
            return api.sendMessage('⚠️ Could not retrieve video information from the server.', event.threadID);
        }

        const { title, thumbnail, duration, views, author } = response.data.metadata;
        const { url: downloadUrl, quality } = response.data.download;

        const sanitizedTitle = title.replace(/[^\w\s]/gi, '').substring(0, 50);
        const filePath = path.join(__dirname, 'cache', `${sanitizedTitle}.mp4`);
        const writer = fs.createWriteStream(filePath);

        try {
            const videoResponse = await axios({
                url: downloadUrl,
                method: 'GET',
                responseType: 'stream' // no timeout
            });

            videoResponse.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            // Send video
            await api.sendMessage({
                body: `🎥 Here's your video:\n\n` +
                      `📛 Title: ${title}\n` +
                      `👤 Author: ${author.name}\n` +
                      `⏱️ Duration: ${duration.timestamp}\n` +
                      `👀 Views: ${views.toLocaleString()}\n` +
                      `📡 Quality: ${quality}`,
                attachment: fs.createReadStream(filePath)
            }, event.threadID);

            api.setMessageReaction("✅", event.messageID, () => {}, true);
        } catch (downloadError) {
            console.error('Download error:', downloadError.message || downloadError);
            return api.sendMessage('❌ Failed to download the video. Please try again later.', event.threadID);
        } finally {
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) console.error('Error deleting file:', err);
                });
            }
        }

    } catch (error) {
        console.error('Main error:', error.message || error);
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        api.sendMessage("❌ An error occurred while processing your request. Please try again later.", event.threadID);
    }
};
