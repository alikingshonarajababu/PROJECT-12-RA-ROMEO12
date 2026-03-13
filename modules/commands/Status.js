const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const yts = require('yt-search');

module.exports.config = {
    name: "status",
    version: "1.0.0",
    permission: 0,
    prefix: false,
    premium: false,
    category: "media",
    credits: "✨ Miss Aliya ✨",
    description: "Get Bollywood & Pakistani WhatsApp status videos",
    commandCategory: "media",
    usages: "status [name]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const query = args.join(" ");
    const senderName = event.senderName || "User";
    
    if (!query) {
        return api.sendMessage(
            `🌸 𝗛𝗲𝘆 ${senderName}!\n\n` +
            `━━━━━━━━━━━━━━\n` +
            `🎯 𝗞𝗮𝘂𝗻 𝘀𝗮 𝘀𝘁𝗮𝘁𝘂𝘀 𝗰𝗵𝗮𝗵𝗶𝗲?\n\n` +
            `💫 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:\n` +
            `• 𝘀𝘁𝗮𝘁𝘂𝘀 𝘀𝗮𝗱\n` +
            `• 𝘀𝘁𝗮𝘁𝘂𝘀 𝗵𝗮𝗽𝗽𝘆\n` +
            `• 𝘀𝘁𝗮𝘁𝘂𝘀 𝗹𝗼𝘃𝗲\n` +
            `• 𝘀𝘁𝗮𝘁𝘂𝘀 𝗮𝘁𝘁𝗶𝘁𝘂𝗱𝗲\n` +
            `• 𝘀𝘁𝗮𝘁𝘂𝘀 𝗿𝗼𝗺𝗮𝗻𝘁𝗶𝗰\n\n` +
            `━━━━━━━━━━━━━━\n` +
            `✨ 𝗠𝗶𝘀𝘀 𝗔𝗹𝗶𝘆𝗮 ✨`,
            event.threadID,
            event.messageID
        );
    }

    // Blocked languages/regions
    const blockedKeywords = [
        'tamil', 'தமிழ்', 'kannada', 'ಕನ್ನಡ', 'telugu', 'తెలుగు', 
        'malayalam', 'മലയാളം', 'bengali', 'বাংলা', 'odia', 'ଓଡ଼ିଆ',
        'assamese', 'অসমীয়া', 'punjabi', 'ਪੰਜਾਬੀ', 'marathi', 'मराठी',
        'gujarati', 'ગુજરાતી', 'tamil song', 'kannada song', 'telugu song',
        'bengali song', 'south indian', 'south movie', 'tamil movie',
        'kannada movie', 'malayalam movie', 'bhojpuri', 'भोजपुरी'
    ];

    const frames = [
        `✨ 𝗠𝗶𝘀𝘀 𝗔𝗹𝗶𝘆𝗮 ✨\n\n🔍 "${query}" status search...\n▰▱▱▱▱▱▱▱▱▱ 10%`,
        `✨ 𝗠𝗶𝘀𝘀 𝗔𝗹𝗶𝘆𝗮 ✨\n\n📹 Status mil gaya!\n▰▰▱▱▱▱▱▱▱▱ 25%`,
        `✨ 𝗠𝗶𝘀𝘀 𝗔𝗹𝗶𝘆𝗮 ✨\n\n📥 Download...\n▰▰▰▱▱▱▱▱▱▱ 45%`,
        `✨ 𝗠𝗶𝘀𝘀 𝗔𝗹𝗶𝘆𝗮 ✨\n\n⚙️ Process...\n▰▰▰▰▱▱▱▱▱▱ 70%`,
        `✨ 𝗠𝗶𝘀𝘀 𝗔𝗹𝗶𝘆𝗮 ✨\n\n✅ Ready!\n▰▰▰▰▰▰▰▰▰▱ 95%`
    ];

    const statusMsg = await api.sendMessage(frames[0], event.threadID);

    try {
        // Bollywood & Pakistani search queries only
        const searchQueries = [
            `${query} whatsapp status bollywood`,
            `${query} status video pakistani`,
            `${query} bollywood status 2024`,
            `${query} pakistani status 2024`,
            `${query} hindi song status`,
            `${query} urdu status`,
            `${query} bollywood whatsapp status`,
            `${query} pakistani whatsapp status`,
            `${query} hindi status video`,
            `${query} urdu status video`,
            `bollywood ${query} status 30 seconds`,
            `pakistani ${query} status 30 seconds`,
            `best ${query} status hindi`,
            `best ${query} status urdu`,
            `${query} reel status bollywood`,
            `${query} trend status pakistani`,
            `new ${query} status 2024 hindi`,
            `${query} whatsapp status hindi song`,
            `${query} status video urdu song`,
            `${query} sad status hindi song`,
            `${query} love status bollywood song`,
            `${query} attitude status pakistani`
        ];
        
        // Pick a random search query
        const randomSearchQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)];
        
        // Search using yt-search
        const searchResults = await yts(randomSearchQuery);
        let videos = searchResults.videos;
        
        if (!videos || videos.length === 0) {
            api.unsendMessage(statusMsg.messageID);
            return api.sendMessage(
                `❌ "${query}" ka koi status nahi mila\n\n✨ Miss Aliya ✨`,
                event.threadID,
                event.messageID
            );
        }

        // Filter out South Indian and other regional videos
        videos = videos.filter(video => {
            const titleLower = video.title.toLowerCase();
            // Check if title contains blocked keywords
            return !blockedKeywords.some(keyword => titleLower.includes(keyword));
        });

        if (videos.length === 0) {
            api.unsendMessage(statusMsg.messageID);
            return api.sendMessage(
                `❌ "${query}" ka koi Bollywood/Pakistani status nahi mila\n\n✨ Miss Aliya ✨`,
                event.threadID,
                event.messageID
            );
        }

        // Filter videos by duration (25-45 seconds)
        const filteredVideos = videos.filter(video => {
            const duration = video.duration.seconds;
            return duration >= 20 && duration <= 50;
        });

        // Random video selection
        let selectedVideo;
        if (filteredVideos.length > 0) {
            selectedVideo = filteredVideos[Math.floor(Math.random() * filteredVideos.length)];
        } else {
            selectedVideo = videos[Math.floor(Math.random() * videos.length)];
        }
        
        const videoUrl = selectedVideo.url;
        let title = selectedVideo.title;
        const author = selectedVideo.author.name;
        const duration = selectedVideo.duration.seconds;

        // Clean title from unwanted keywords
        blockedKeywords.forEach(keyword => {
            title = title.replace(new RegExp(keyword, 'gi'), '');
        });

        await api.editMessage(frames[1], statusMsg.messageID, event.threadID);
        await api.editMessage(frames[2], statusMsg.messageID, event.threadID);

        // Fetch download URL
        let fetchRes;
        try {
            const apiUrl = `https://api.kraza.qzz.io/download/ytdl?url=${encodeURIComponent(videoUrl)}`;
            fetchRes = await axios.get(apiUrl, {
                headers: { 'Accept': 'application/json' },
                timeout: 60000
            });
        } catch (fetchError) {
            api.unsendMessage(statusMsg.messageID);
            return api.sendMessage(
                `❌ Download link nahi mila\n\n✨ Miss Aliya ✨`,
                event.threadID,
                event.messageID
            );
        }

        if (!fetchRes.data.status || !fetchRes.data.result || !fetchRes.data.result.mp4) {
            api.unsendMessage(statusMsg.messageID);
            return api.sendMessage(
                `❌ Download URL nahi mila\n\n✨ Miss Aliya ✨`,
                event.threadID,
                event.messageID
            );
        }

        const downloadUrl = fetchRes.data.result.mp4;

        await api.editMessage(frames[3], statusMsg.messageID, event.threadID);

        // Download the video file
        let videoRes;
        try {
            videoRes = await axios.get(downloadUrl, {
                responseType: 'arraybuffer',
                timeout: 180000
            });
        } catch (downloadError) {
            api.unsendMessage(statusMsg.messageID);
            return api.sendMessage(
                `❌ Download fail hua\n\n✨ Miss Aliya ✨`,
                event.threadID,
                event.messageID
            );
        }

        const cacheDir = path.join(__dirname, "cache");
        await fs.ensureDir(cacheDir);

        const tempVideoPath = path.join(cacheDir, `${Date.now()}_temp.mp4`);
        const finalVideoPath = path.join(cacheDir, `${Date.now()}_status.mp4`);
        
        fs.writeFileSync(tempVideoPath, videoRes.data);

        await api.editMessage(frames[4], statusMsg.messageID, event.threadID);

        // Random duration between 25-40 seconds
        const targetDuration = Math.floor(Math.random() * (40 - 25 + 1)) + 25;
        
        // Trim video to random duration
        const { exec } = require('child_process');
        
        const startTime = duration > targetDuration ? Math.floor((duration - targetDuration) / 2) : 0;
        const trimDuration = duration > targetDuration ? targetDuration : duration;

        await new Promise((resolve) => {
            const ffmpegCmd = `ffmpeg -i "${tempVideoPath}" -ss ${startTime} -t ${trimDuration} -c copy "${finalVideoPath}" -y`;
            
            exec(ffmpegCmd, (error) => {
                if (error) {
                    fs.copyFileSync(tempVideoPath, finalVideoPath);
                }
                resolve();
            });
        });

        // Clean up temp file
        if (fs.existsSync(tempVideoPath)) fs.unlinkSync(tempVideoPath);

        // Hindi/Urdu response messages
        const responseMessages = [
            "💝  लीजिए आपका स्टेटस!",
            "💫  बॉलीवुड स्टेटस तैयार!",
            "🌟  पाकिस्तानी स्टेटस!",
            "✨  उम्मीद है पसंद आएगा!",
            "💕  बहुत मस्त स्टेटस है!",
            "🎵  धमाकेदार स्टेटस!",
            "🔥  वायरल स्टेटस!"
        ];
        
        const randomResponse = responseMessages[Math.floor(Math.random() * responseMessages.length)];

        // Send the status video
        await api.sendMessage(
            {
                body: 
                    `✨ 𝗠𝗶𝘀𝘀 𝗔𝗹𝗶𝘆𝗮 ✨\n\n` +
                    `━━━━━━━━━━━━━━\n` +
                    `📹 𝗦𝘁𝗮𝘁𝘂𝘀: ${title.substring(0, 50)}${title.length > 50 ? '...' : ''}\n` +
                    `⏱️ 𝗗𝘂𝗿𝗮𝘁𝗶𝗼𝗻: ${trimDuration} 𝘀𝗲𝗰\n` +
                    `📺 𝗖𝗵𝗮𝗻𝗻𝗲𝗹: ${author}\n` +
                    `━━━━━━━━━━━━━━\n` +
                    `👤 𝗙𝗼𝗿: ${senderName}\n` +
                    `🎯 𝗥𝗲𝗾𝘂𝗲𝘀𝘁: "${query}"\n` +
                    `━━━━━━━━━━━━━━\n` +
                    `${randomResponse}\n` +
                    `✨ 𝗠𝗶𝘀𝘀 𝗔𝗹𝗶𝘆𝗮 ✨`,
                attachment: fs.createReadStream(finalVideoPath)
            },
            event.threadID
        );

        // Cleanup
        setTimeout(() => {
            try {
                if (fs.existsSync(finalVideoPath)) fs.unlinkSync(finalVideoPath);
                api.unsendMessage(statusMsg.messageID);
            } catch (err) {
                console.log("Cleanup error:", err);
            }
        }, 10000);

    } catch (error) {
        console.error("Status command error:", error.message);
        api.unsendMessage(statusMsg.messageID);
        return api.sendMessage(
            `❌ Error: ${error.message}\n\n✨ Miss Aliya ✨`,
            event.threadID,
            event.messageID
        );
    }
};