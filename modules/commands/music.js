const youtube = require('youtube-search-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "music",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "KOJA XD",
    description: "Download YouTube music with enhanced features",
    commandCategory: "Media",
    credits: "ALi Koja",
    commandCategory: "utility",
    usages: "[title]",
    cooldowns: 10,
    dependencies: {}
};

module.exports.run = async ({ api, event }) => {
    const input = event.body;
    const text = input.substring(7).trim();

    if (!text) {
        return api.sendMessage("⚠️ Please provide a song title or artist name.", event.threadID);
    }

    try {
        api.sendMessage(`🔎 Searching for "${text}"...`, event.threadID, event.messageID);
        api.setMessageReaction("🔍", event.messageID, (err) => {}, true);

        // Search YouTube for the video
        const result = await youtube.GetListByKeyword(text, false, 1);
        if (!result.items || result.items.length === 0) {
            return api.sendMessage('⚠️ No results found for your query.', event.threadID);
        }

        const video = result.items[0];
        const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;
        
        // Using the specified API endpoint
        const apiUrl = `${global.config.KOJA}/ytmp3?url=${encodeURIComponent(videoUrl)}`;
        
        const response = await axios.get(apiUrl, {
            timeout: 30000 // 30 seconds timeout
        });

        if (!response.data || !response.data.success || !response.data.download?.url) {
            return api.sendMessage('⚠️ Could not retrieve music download link.', event.threadID);
        }

        const { download, metadata } = response.data;
        const { title, thumbnail, author } = metadata;
        const sanitizedTitle = title.replace(/[^\w\s]/gi, ''); // Remove special characters for filename
        
        // Create cache directory if it doesn't exist
        const cacheDir = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir);
        }

        const filePath = path.join(cacheDir, `${sanitizedTitle}.mp3`);
        
        // Download the file with progress
        api.sendMessage(`⬇️ Downloading: ${title}\n🎤 Artist: ${author.name}\n⏳ Duration: ${metadata.duration.timestamp}`, event.threadID);
        
        const writer = fs.createWriteStream(filePath);
        const downloadResponse = await axios({
            url: download.url,
            method: 'GET',
            responseType: 'stream',
            timeout: 120000 // 2 minutes timeout for larger files
        });

        downloadResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // Send the music file
        const message = {
            body: `🎵 Now Playing: ${title}\n\n` +
                  `🎤 Artist: ${author.name}\n` +
                  `⏱️ Duration: ${metadata.duration.timestamp}\n` +
                  `🔊 Quality: ${download.quality}\n\n` +
                  `Enjoy your music! 🎧`,
            attachment: fs.createReadStream(filePath)
        };
        
        api.setMessageReaction("🎵", event.messageID, (err) => {}, true);
        await api.sendMessage(message, event.threadID);

        // Clean up the file after sending
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file:', err);
        });

    } catch (error) {
        console.error('Error:', error);
        api.setMessageReaction("❌", event.messageID, (err) => {}, true);
        
        if (error.code === 'ECONNABORTED') {
            api.sendMessage("❌ Request timed out. Please try again.", event.threadID);
        } else if (error.response?.status === 404) {
            api.sendMessage("❌ Music not found or download service unavailable.", event.threadID);
        } else {
            api.sendMessage("❌ An error occurred while processing your request.", event.threadID);
        }
    }
};