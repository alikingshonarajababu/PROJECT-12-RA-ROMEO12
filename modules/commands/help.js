module.exports.config = {
	name: "help",
	version: "2.0.0",
	hasPermssion: 0,
	credits: "KOJA XD",
	description: "Advanced Help System with Beautiful Layout",
	commandCategory: "system",
	usages: "[page] | [command] | all",
	cooldowns: 1,
	envConfig: {
		autoUnsend: true,
		delayUnsend: 300
	}
};

module.exports.languages = {
	"en": {
		"moduleInfo": `✨ ──── *COMMAND INFO* ──── ✨

📛 Command: %1
📖 Description: %2
🔧 Usage: %3
📁 Category: %4
⏰ Cooldown: %5 seconds
👮 Permission: %6

💫 Coded by: %7`,

		"helpList": `📚 Total %1 commands available\nUse "%2help [command]" for details!`,
		"user": "👤 User",
		"adminGroup": "👥 Admin Group",
		"adminBot": "🤖 Admin Bot"
	}
};

module.exports.handleEvent = function ({ api, event, getText }) {
	const { commands } = global.client;
	const { threadID, messageID, body } = event;

	if (!body || typeof body == "undefined" || body.indexOf("help") != 0) return;
	const splitBody = body.slice(body.indexOf("help")).trim().split(/\s+/);
	if (splitBody.length == 1 || !commands.has(splitBody[1].toLowerCase())) return;
	const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
	const command = commands.get(splitBody[1].toLowerCase());
	const prefix = (threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX;
	
	return api.sendMessage(getText("moduleInfo", 
		command.config.name, 
		command.config.description, 
		`${prefix}${command.config.name} ${(command.config.usages) ? command.config.usages : ""}`,
		command.config.commandCategory, 
		command.config.cooldowns, 
		((command.config.hasPermssion == 0) ? getText("user") : (command.config.hasPermssion == 1) ? getText("adminGroup") : getText("adminBot")), 
		command.config.credits
	), threadID, messageID);
}

module.exports.run = async function({ api, event, args, getText, Users }) {
	const { commands } = global.client;
	const { threadID, messageID } = event;
	const command = commands.get((args[0] || "").toLowerCase());
	const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
	const { autoUnsend, delayUnsend } = global.configModule[this.config.name];
	const prefix = (threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX;

	// Help all command - Show all commands categorized
	if (args[0] == "all") {
		const commandValues = commands.values();
		let categories = [];
		let categoryMessage = "";
		
		// Group commands by category
		for (const commandConfig of commandValues) {
			const category = commandConfig.config.commandCategory.toLowerCase();
			const existingCategory = categories.find(item => item.group.toLowerCase() === category);
			
			if (!existingCategory) {
				categories.push({ 
					group: category, 
					cmds: [commandConfig.config.name] 
				});
			} else {
				existingCategory.cmds.push(commandConfig.config.name);
			}
		}

		// Create beautiful layout
		let header = `🌟 ──── *ALL COMMANDS* ──── 🌟\n\n`;
		let footer = `\n📊 Total Commands: ${commands.size}\n🔮 Prefix: ${prefix}\n\n⚠️ Please don't spam the bot! ⚠️`;
		
		// Format each category
		categories.forEach((commandGroup) => {
			const categoryName = commandGroup.group.charAt(0).toUpperCase() + commandGroup.group.slice(1);
			const commandsList = commandGroup.cmds.join(' • ');
			categoryMessage += `📂 ${categoryName}\n   └─ ${commandsList}\n\n`;
		});

		const finalMessage = header + categoryMessage + footer;
		
		return api.sendMessage(finalMessage, threadID, (err, info) => {
			if (autoUnsend) {
				setTimeout(() => { 
					return api.unsendMessage(info.messageID);
				}, delayUnsend * 1000);
			}
		}, event.messageID);
	}

	// Specific command help
	if (command) {
		return api.sendMessage(getText("moduleInfo", 
			command.config.name, 
			command.config.description, 
			`${prefix}${command.config.name} ${(command.config.usages) ? command.config.usages : ""}`,
			command.config.commandCategory, 
			command.config.cooldowns, 
			((command.config.hasPermssion == 0) ? getText("user") : (command.config.hasPermssion == 1) ? getText("adminGroup") : getText("adminBot")), 
			command.config.credits
		), threadID, messageID);
	}

	// Paginated command list
	const arrayInfo = Array.from(commands.keys());
	const page = parseInt(args[0]) || 1;
	const numberOfOnePage = 12;
	const totalPages = Math.ceil(arrayInfo.length / numberOfOnePage);
	
	// Validate page number
	if (page < 1 || page > totalPages) {
		return api.sendMessage(`❌ Invalid page! Please choose between 1-${totalPages}`, threadID, messageID);
	}

	const first = numberOfOnePage * (page - 1);
	const helpView = arrayInfo.slice(first, first + numberOfOnePage);

	// Create beautiful paginated layout
	let pageMessage = `📖 ──── *COMMAND LIST* ──── 📖\n\n`;
	
	helpView.forEach((cmd, index) => {
		const cmdInfo = commands.get(cmd).config;
		const number = first + index + 1;
		pageMessage += `${number.toString().padStart(2, '0')}. ${prefix}${cmd}\n`;
		pageMessage += `   └─ ${cmdInfo.description}\n\n`;
	});

	// Add footer with navigation
	pageMessage += `📄 Page ${page}/${totalPages} | 📚 Total: ${arrayInfo.length} commands\n`;
	pageMessage += `🔧 Use "${prefix}help [command]" for details\n`;
	pageMessage += `📋 Use "${prefix}help all" to see all commands\n`;
	
	// Add page navigation
	if (totalPages > 1) {
		const prevPage = page > 1 ? page - 1 : totalPages;
		const nextPage = page < totalPages ? page + 1 : 1;
		pageMessage += `\n⬅️ "${prefix}help ${prevPage}" | "${prefix}help ${nextPage}" ➡️`;
	}

	return api.sendMessage(pageMessage, threadID, async (error, info) => {
		if (autoUnsend) {
			await new Promise(resolve => setTimeout(resolve, delayUnsend * 1000));
			return api.unsendMessage(info.messageID);
		}
	}, event.messageID);
};