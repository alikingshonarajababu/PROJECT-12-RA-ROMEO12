module.exports.config = {
	name: "autodown",
	version: "1.2.0",
	hasPermission: 0,
	credits: "KOJA-PROJECT",
	premium: false,
	description: "Automatically download videos from Facebook, TikTok, and Instagram",
	prefix: true,
	commandCategory: "utility",
	usages: "n/a",
	cooldowns: 5
};

module.exports.handleEvent = async ({ api, event }) => {
	if (event.type !== "message" || event.senderID === api.getCurrentUserID()) {
		return;
	}

	const axios = require('axios');
	const fs = require('fs-extra');
	const path = require('path');
	
	try {
		if (event.body) {
			const fbUrlRegex = /(https?:\/\/www\.facebook\.com\/[^\s]+)/g;
			const ttUrlRegex = /(https?:\/\/vt\.tiktok\.com\/[^\s]+)|(https?:\/\/www\.tiktok\.com\/[^\s]+)/g;
			const igUrlRegex = /(https?:\/\/www\.instagram\.com\/[^\s]+)/g;
			
			// Handle TikTok links
			const ttMatches = event.body.match(ttUrlRegex);
			if (ttMatches && ttMatches.length > 0) {
				const ttScrapper = require('ruhend-scraper').ttdl;
				
				for (const tiktokLink of ttMatches) {
					try {
						const res = await ttScrapper(tiktokLink);
						if (!res.video) throw new Error("No video found");
						
						const cacheFile = `${Date.now()}_tt.mp4`;
						const cachePath = path.join(__dirname, 'cache', cacheFile);
						
						const { data } = await axios({
							method: 'GET',
							url: res.video,
							responseType: 'stream'
						});
						
						await new Promise((resolve, reject) => {
							const writer = fs.createWriteStream(cachePath);
							data.pipe(writer);
							writer.on('finish', resolve);
							writer.on('error', reject);
						});
						
						await api.sendMessage({
							body: `🎵 TikTok Video Auto-Downloaded 🎵\n\n` +
								  `Author: ${res.author || "Unknown"}\n` +
								  `Username: ${res.username || "N/A"}\n` +
								  `Views: ${res.views || 0}\n` +
								  `Likes: ${res.like || 0}\n` +
								  `Comments: ${res.comment || 0}\n` +
								  `Shares: ${res.share || 0}\n` +
								  `Music: ${res.music || "N/A"}\n` +
								  `Description: ${res.description || "No description"}`,
							attachment: fs.createReadStream(cachePath)
						}, event.threadID, () => fs.unlinkSync(cachePath), event.messageID);
						
					} catch (err) {
						console.error("TikTok download error:", err);
						api.sendMessage("❌ Failed to download TikTok video. The link may be invalid or private.", event.threadID, event.messageID);
					}
				}
			}
			
			// Handle Facebook links using KOJA API
			const fbMatches = event.body.match(fbUrlRegex);
			if (fbMatches && fbMatches.length > 0) {
				for (const facebookLink of fbMatches) {
					try {
						const apiUrl = `${global.config.KOJA}/facebook?url=${encodeURIComponent(facebookLink)}`;
						const response = await axios.get(apiUrl);
						
						if (!response.data.success || !response.data.result || response.data.result.length === 0) {
							throw new Error("Invalid API response");
						}
						
						// Get the first available download link
						const videoData = response.data.result[0];
						if (!videoData.url) throw new Error("No download URL found");
						
						const cacheFile = `${Date.now()}_fb.mp4`;
						const cachePath = path.join(__dirname, 'cache', cacheFile);
						
						const { data } = await axios({
							method: 'GET',
							url: videoData.url,
							responseType: 'stream'
						});
						
						await new Promise((resolve, reject) => {
							const writer = fs.createWriteStream(cachePath);
							data.pipe(writer);
							writer.on('finish', resolve);
							writer.on('error', reject);
						});
						
						await api.sendMessage({
							body: `📹 Facebook Video Auto-Downloaded 📹\n\n` +
								  `Resolution: ${videoData.resolution || "Unknown"}\n` +
								  `Creator: ${response.data.creator || "Unknown"}\n` +
								  `Downloaded via KOJA-PROJECT API`,
							attachment: fs.createReadStream(cachePath)
						}, event.threadID, () => fs.unlinkSync(cachePath), event.messageID);
						
					} catch (err) {
						console.error("Facebook download error:", err);
						api.sendMessage("❌ Failed to download Facebook video. The link may be invalid, private, or the API is unavailable.", event.threadID, event.messageID);
					}
				}
			}
			
			// Handle Instagram links using KOJA API
			const igMatches = event.body.match(igUrlRegex);
			if (igMatches && igMatches.length > 0) {
				for (const instagramLink of igMatches) {
					try {
						const apiUrl = `${global.config.KOJA}/instagram?url=${encodeURIComponent(instagramLink)}`;
						const response = await axios.get(apiUrl);
						
						if (!response.data.success || !response.data.result || response.data.result.length === 0) {
							throw new Error("Invalid API response");
						}
						
						const videoData = response.data.result[0];
						if (!videoData.url) throw new Error("No download URL found");
						
						const cacheFile = `${Date.now()}_ig.mp4`;
						const cachePath = path.join(__dirname, 'cache', cacheFile);
						
						const { data } = await axios({
							method: 'GET',
							url: videoData.url,
							responseType: 'stream'
						});
						
						await new Promise((resolve, reject) => {
							const writer = fs.createWriteStream(cachePath);
							data.pipe(writer);
							writer.on('finish', resolve);
							writer.on('error', reject);
						});
						
						await api.sendMessage({
							body: `📸 Instagram Video Auto-Downloaded 📸\n\n` +
								  `Creator: ${response.data.creator || "Unknown"}\n` +
								  `Downloaded via KOJA-PROJECT API`,
							attachment: fs.createReadStream(cachePath)
						}, event.threadID, () => fs.unlinkSync(cachePath), event.messageID);
						
					} catch (err) {
						console.error("Instagram download error:", err);
						api.sendMessage("❌ Failed to download Instagram video. The link may be invalid, private, or the API is unavailable.", event.threadID, event.messageID);
					}
				}
			}
		}
	} catch (err) {
		console.error("Autodl general error:", err);
	}
};

module.exports.run = async ({ api, event }) => {
	api.sendMessage(
		`🔗 Auto Downloader v1.2.0 🔗\n\n` +
		`This command automatically downloads videos when links are detected:\n\n` +
		`📹 Facebook - Uses KOJA API for reliable downloads\n` +
		`🎵 TikTok - Uses direct scraping\n` +
		`📸 Instagram - Uses KOJA API for best quality\n\n` +
		`Simply share a valid link from any supported platform.`,
		event.threadID,
		event.messageID
	);
};