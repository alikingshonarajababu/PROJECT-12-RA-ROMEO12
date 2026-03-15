module.exports.config = {
    "name": "qtv",
    "version": "1.0.0",
    "hasPermssion": 1,
    "credits": "KOJA XD",
    "description": "Add or remove group admins",
    "commandCategory": "Group",
    "usages": "[test]",
    "cooldowns": 5
};

module.exports.run = async function ({ event, api, Currencies, args, Users, Threads }) {
    if (!args[0]) return api.sendMessage('⚠️ Please choose "add" or "remove" followed by [tag/reply]', event.threadID);

    let dataThread = (await Threads.getData(event.threadID)).threadInfo;

    // Check if the bot or sender is an admin
    if (!dataThread.adminIDs.some(item => item.id == api.getCurrentUserID()) &&
        !dataThread.adminIDs.some(item => item.id == event.senderID)) {
        return api.sendMessage('❎ You do not have permission to use this command', event.threadID, event.messageID);
    }

    if (args[0] == 'add') {
        let uid1 = event.senderID;
        let uid;

        if (event.type == "message_reply") {
            uid = event.messageReply.senderID;
        } else if (args.join().includes('@')) {
            uid = Object.keys(event.mentions)[0];
        } else {
            uid = uid1;
        }

        api.sendMessage('📌 React to this message to confirm', event.threadID, (error, info) => {
            global.client.handleReaction.push({
                name: this.config.name,
                type: 'add',
                messageID: info.messageID,
                author: uid1,
                userID: uid
            });
        });
    }

    if (args[0] == 'remove') {
        let uid1 = event.senderID;
        let uid;

        if (event.type == "message_reply") {
            uid = event.messageReply.senderID;
        } else if (args.join().includes('@')) {
            uid = Object.keys(event.mentions)[0];
        } else {
            return api.sendMessage('⚠️ Please specify a user to remove', event.threadID);
        }

        api.sendMessage('📌 React to this message to confirm', event.threadID, (error, info) => {
            global.client.handleReaction.push({
                name: this.config.name,
                type: 'remove',
                messageID: info.messageID,
                author: uid1,
                userID: uid
            });
        });
    }
};

module.exports.handleReaction = async function({ event, api, handleReaction, Currencies, Users }) {
    if (event.userID != handleReaction.author) return;

    let name = (await Users.getData(handleReaction.userID)).name;

    if (handleReaction.type == 'add') {
        api.changeAdminStatus(event.threadID, handleReaction.userID, true, function editAdminsCallback(err) {
            if (err) return api.sendMessage("❎ Bot does not have permission to add an admin", event.threadID, event.messageID);
            return api.sendMessage(`✅ ${name} has been added as a group admin`, event.threadID, event.messageID);
        });
    }

    if (handleReaction.type == 'remove') {
        api.changeAdminStatus(event.threadID, handleReaction.userID, false, function editAdminsCallback(err) {
            if (err) return api.sendMessage("❎ Bot does not have permission to remove an admin", event.threadID, event.messageID);
            return api.sendMessage(`✅ ${name} has been removed as a group admin`, event.threadID, event.messageID);
        });
    }
};
