const axios = require('axios');
const fs = require('fs-extra');
const moment = require('moment-timezone');
const pidusage = require('pidusage');

module.exports.config = {
	name: "info",
	version: "3.0.0", 
	hasPermssion: 0,
	credits: "KOJA-PROJECT",
	description: "Premium Stylized Bot Information",
	commandCategory: "system",
	cooldowns: 5,
	dependencies: {
		"axios": "",
		"fs-extra": "",
		"moment-timezone": "",
		"pidusage": ""
	}
};

module.exports.run = async function({ api, event, args, client, Users, Threads, __GLOBAL, Currencies }) {
	try {
		// Calculate uptime
		const time = process.uptime();
		const hours = Math.floor(time / (60 * 60));
		const minutes = Math.floor((time % (60 * 60)) / 60);
		const seconds = Math.floor(time % 60);
		
		// Get current time
		const now = moment.tz("Asia/Karachi");
		const formattedTime = now.format("DD/MM/YYYY • HH:mm:ss");
		const dayOfWeek = now.format("dddd");
		
		// System performance data
		const usage = await pidusage(process.pid);
		const memoryUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
		const cpuUsage = usage.cpu.toFixed(2);
		
		// Bot statistics
		const allUsers = await Users.getAll();
		const allThreads = await Threads.getAll();
		
		// Premium image links
		const premiumImages = [
			"https://i.ibb.co/RN45QnJ/IMG-20221228-174146-278.jpg"
		];
		
		const randomImage = premiumImages[Math.floor(Math.random() * premiumImages.length)];
		
		// Create highly stylized message
		const stylizedMessage = `
╔═══════════════════════╗
   🤖 𝗕𝗢𝗧 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡 𝗦𝗬𝗦𝗧𝗘𝗠 🤖
╚═══════════════════════╝

╭──────•◈•──────╮
│ 🎯 𝗕𝗔𝗦𝗜𝗖 𝗜𝗡𝗙𝗢
╰──────•◈•──────╯
│ ✦ 𝗡𝗮𝗺𝗲: ${global.config.BOTNAME}
│ ✦ 𝗣𝗿𝗲𝗳𝗶𝘅: ${global.config.PREFIX}
│ ✦ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻: ${global.config.version}
│ ✦ 𝗣𝗹𝗮𝘁𝗳𝗼𝗿𝗺: Node.js ${process.version}

╭──────•◈•──────╮
│ 👑 𝗔𝗗𝗠𝗜𝗡 𝗜𝗡𝗙𝗢
╰──────•◈•──────╯
│ ✦ 𝗢𝘄𝗻𝗲𝗿: KOJA BABU
│ ✦ 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸: fb.com/61571289612321
│ ✦ 𝗖𝗿𝗲𝗱𝗶𝘁𝘀: ALi Jutt

╭──────•◈•──────╮
│ 📊 𝗦𝗬𝗦𝗧𝗘𝗠 𝗦𝗧𝗔𝗧𝗦
╰──────•◈•──────╯
│ ✦ 𝗨𝗽𝘁𝗶𝗺𝗲: ${hours}h ${minutes}m ${seconds}s
│ ✦ 𝗠𝗲𝗺𝗼𝗿𝘆: ${memoryUsage} MB
│ ✦ 𝗖𝗣𝗨 𝗨𝘀𝗮𝗴𝗲: ${cpuUsage}%
│ ✦ 𝗨𝘀𝗲𝗿𝘀: ${allUsers.length}
│ ✦ 𝗧𝗵𝗿𝗲𝗮𝗱𝘀: ${allThreads.length}

╭──────•◈•──────╮
│ 🕐 𝗧𝗜𝗠𝗘 𝗜𝗡𝗙𝗢
╰──────•◈•──────╯
│ ✦ 𝗗𝗮𝘆: ${dayOfWeek}
│ ✦ 𝗗𝗮𝘁𝗲 & 𝗧𝗶𝗺𝗲: ${formattedTime}
│ ✦ 𝗧𝗶𝗺𝗲𝘇𝗼𝗻𝗲: Asia/Karachi

╭──────•◈•──────╮
│ ⚡ 𝗣𝗘𝗥𝗙𝗢𝗥𝗠𝗔𝗡𝗖𝗘
╰──────•◈•──────╯
│ ✦ 𝗦𝘁𝗮𝘁𝘂𝘀: ✅ 𝗢𝗽𝗲𝗿𝗮𝘁𝗶𝗼𝗻𝗮𝗹
│ ✦ 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲: 🟢 𝗔𝗰𝘁𝗶𝘃𝗲
│ ✦ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀: 🔄 𝗟𝗼𝗮𝗱𝗲𝗱

╔═══════════════════════╗
   💫 𝗧𝗛𝗔𝗡𝗞𝗦 𝗙𝗢𝗥 𝗨𝗦𝗜𝗡𝗚
        ${global.config.BOTNAME}
╚═══════════════════════╝
`.trim();

		// Download and send image
		const path = __dirname + "/cache/premium_banner.jpg";
		
		const downloadImage = async () => {
			try {
				const response = await axios({
					method: "GET",
					url: randomImage,
					responseType: "stream",
					timeout: 10000
				});
				
				const writer = fs.createWriteStream(path);
				response.data.pipe(writer);
				
				return new Promise((resolve, reject) => {
					writer.on("finish", resolve);
					writer.on("error", reject);
				});
			} catch (error) {
				console.error("Premium image download failed:", error);
				return null;
			}
		};
		
		await downloadImage();
		
		if (fs.existsSync(path)) {
			await api.sendMessage({
				body: stylizedMessage,
				attachment: fs.createReadStream(path)
			}, event.threadID);
			
			// Clean up cache file
			fs.unlinkSync(path);
		} else {
			// Fallback without image
			await api.sendMessage(stylizedMessage, event.threadID);
		}
		
	} catch (error) {
		console.error("Error in premium info command:", error);
		api.sendMessage("❌ 𝗘𝗿𝗿𝗼𝗿: Failed to fetch bot information. Please try again later.", event.threadID);
	}
};