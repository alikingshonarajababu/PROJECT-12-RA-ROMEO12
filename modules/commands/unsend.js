module.exports.config = {
    name: "unsend",
    version: "1.0.1",
    hasPermssion: 2,
    credits: "KOJA XD",
    description: "Deletes the bot's message",
    commandCategory: "system",
    usages: "unsend",
    cooldowns: 0
};

module.exports.languages = {
    "vi": {
        "returnCant": "Không thể gỡ tin nhắn của người khác.",
        "missingReply": "Hãy reply tin nhắn cần gỡ."
    },
    "en": {
        "returnCant": "You cannot unsend someone else's message.",
        "missingReply": "Please reply to the message you want to unsend."
    }
};

module.exports.run = function({ api, event, getText }) {
    // Check if the replied message was sent by the bot
    if (event.messageReply.senderID != api.getCurrentUserID()) {
        return api.sendMessage(getText("returnCant"), event.threadID, event.messageID);
    }
    // Check if the user replied to a message
    if (event.type != "message_reply") {
        return api.sendMessage(getText("missingReply"), event.threadID, event.messageID);
    }
    // Unsend the message
    return api.unsendMessage(event.messageReply.messageID);
};
