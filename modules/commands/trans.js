// trans.js (CommonJS)

const request = require("request");

module.exports = {
	config: {
		name: "trans",
		version: "1.0.1",
		hasPermission: 0,
		credits: "KOJA PROJECT",
		description: "Text translation",
		commandCategory: "media",
		usages: "[en/ko/ja/vi] [Text]",
		cooldowns: 5,
		dependencies: {
			request: ""
		}
	},

	run: async function ({ api, event, args }) {
		let content = args.join(" ");

		// Handle empty input
		if (content.length === 0 && event.type !== "message_reply") {
			return api.sendMessage("⚠️ Please provide text to translate.", event.threadID, event.messageID);
		}

		let translateThis, lang;

		// Handle reply-based translation
		if (event.type === "message_reply") {
			translateThis = event.messageReply.body;
			if (content.includes("-> ")) lang = content.split("-> ")[1].trim();
			else lang = "en"; // Default language fallback
		}
		else if (content.includes(" -> ")) {
			translateThis = content.split(" -> ")[0].trim();
			lang = content.split(" -> ")[1].trim();
		} 
		else {
			translateThis = content.trim();
			lang = "en"; // Default to English
		}

		const url = encodeURI(
			`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${translateThis}`
		);

		request(url, (err, response, body) => {
			if (err) return api.sendMessage("❌ An error has occurred!", event.threadID, event.messageID);

			try {
				const retrieve = JSON.parse(body);
				let text = "";
				retrieve[0].forEach(item => {
					if (item[0]) text += item[0];
				});

				const fromLang = (retrieve[2] === retrieve[8][0][0]) ? retrieve[2] : retrieve[8][0][0];
				api.sendMessage(`🌐 Translation: ${text}\n- from ${fromLang} to ${lang}`, event.threadID, event.messageID);
			} catch (parseErr) {
				api.sendMessage("⚠️ Failed to parse translation response.", event.threadID, event.messageID);
			}
		});
	}
};
