module.exports.config = {
    name: "ping",
    version: "1.0.5",
    hasPermssion: 1,
    credits: "Mirai Team",
    description: "Tag all members",
    commandCategory: "group",
    usages: "[Text]",
    cooldowns: 80
};

module.exports.run = async function({ api, event, args }) {
    try {
        const botID = api.getCurrentUserID();
        let listAFK, listUserID;

        // Get list of AFK users if available
        global.moduleData["afk"] && global.moduleData["afk"].afkList 
            ? listAFK = Object.keys(global.moduleData["afk"].afkList || []) 
            : listAFK = [];

        // Filter out bot and sender from participants
        listUserID = event.participantIDs.filter(ID => ID != botID && ID != event.senderID);
        // Remove AFK users from the list
        listUserID = listUserID.filter(item => !listAFK.includes(item));

        // Default message if no text is provided
        let body = (args.length != 0) ? args.join(" ") : "You have been removed from the group by an administrator.";
        let mentions = [], index = 0;

        for (const idUser of listUserID) {
            body = "‎" + body;
            mentions.push({ id: idUser, tag: "‎", fromIndex: index - 1 });
            index -= 1;
        }

        return api.sendMessage({ body, mentions }, event.threadID, event.messageID);

    } catch (e) { 
        return console.log(e); 
    }
}
