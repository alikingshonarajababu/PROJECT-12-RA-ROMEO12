module.exports.config = {
    name: 'listbox',
    version: '1.0.0',
    credits: 'KOJA XD',
    hasPermssion: 3,
    description: '[Ban/Unban/Leave] List of threads the bot has joined',
    commandCategory: 'System',
    images: [],
    usages: '[page number/all]',
    cooldowns: 5
};

module.exports.handleReply = async function({ api, event, args, Threads, handleReply }) {
    const { threadID, messageID } = event;
    if (parseInt(event.senderID) !== parseInt(handleReply.author)) return;
    const moment = require("moment-timezone");
    const time = moment.tz("Asia/Karachi").format("HH:MM:ss L");
    var arg = event.body.split(" ");

    switch (handleReply.type) {
        case "reply":
            {
                if (arg[0].toLowerCase() === "ban") {
                    var arrnum = event.body.split(" ");
                    var msg = "";
                    var moduleLog = "[ MODE ] - Executing ban\n";
                    var nums = arrnum.map(n => parseInt(n));
                    nums.shift(); // remove first element (command)
                    for (let num of nums) {
                        var idgr = handleReply.groupid[num - 1];
                        var groupName = handleReply.groupName[num - 1];

                        const data = (await Threads.getData(idgr)).data || {};
                        data.banned = true;
                        data.dateAdded = time;
                        await Threads.setData(idgr, { data });
                        global.data.threadBanned.set(idgr, { dateAdded: data.dateAdded });
                        msg += groupName + '\nTID: ' + idgr + "\n";
                        console.log(moduleLog, msg)
                    }
                    api.sendMessage(`=== [ GROUP BAN ] ===\n🎀 Received command from admin, banning selected groups.\nContact admin to unban.\n🌐 Admin FB:\nfb.com/61571289612321`, idgr, () =>
                        api.sendMessage(`${global.data.botID}`, () =>
                            api.sendMessage(`[ MODE ] - Ban execution result\n${msg}`, threadID, () =>
                                api.unsendMessage(handleReply.messageID))));
                    break;
                }

                if (["unban", "ub"].includes(arg[0].toLowerCase())) {
                    var arrnum = event.body.split(" ");
                    var msg = "";
                    var moduleLog = "[ MODE ] - Executing unban\n";
                    var nums = arrnum.map(n => parseInt(n));
                    nums.shift();
                    for (let num of nums) {
                        var idgr = handleReply.groupid[num - 1];
                        var groupName = handleReply.groupName[num - 1];

                        const data = (await Threads.getData(idgr)).data || {};
                        data.banned = false;
                        data.dateAdded = null;
                        await Threads.setData(idgr, { data });
                        global.data.threadBanned.delete(idgr);
                        msg += groupName + '\nTID: ' + idgr + "\n";
                        console.log(moduleLog, msg)
                    }
                    api.sendMessage(`=== [ UNBAN ] ===\nGroups have been unbanned successfully.\nEnjoy using the bot!`, idgr, () =>
                        api.sendMessage(`${global.data.botID}`, () =>
                            api.sendMessage(`[ MODE ] - Unban execution result\n${msg}`, threadID, () =>
                                api.unsendMessage(handleReply.messageID))));
                    break;
                }

                if (arg[0].toLowerCase() === "out") {
                    var arrnum = event.body.split(" ");
                    var msg = "";
                    var moduleLog = "[ MODE ] - Executing leave\n";
                    var nums = arrnum.map(n => parseInt(n));
                    nums.shift();
                    for (let num of nums) {
                        var idgr = handleReply.groupid[num - 1];
                        var groupName = handleReply.groupName[num - 1];
                        await api.removeUserFromGroup(`${api.getCurrentUserID()}`, idgr);
                        msg += groupName + '\nTID: ' + idgr + "\n";
                        console.log(moduleLog, msg)
                    }
                    api.sendMessage(`== [ LEAVE GROUP ] ==\n🎊 Received command from admin. Leaving groups.\nContact admin to invite bot back.\n🌐 Admin FB:\nfb.com/100068096370437`, idgr, () =>
                        api.sendMessage(`${global.data.botID}`, () =>
                            api.sendMessage(`[ MODE ] - Leave execution result\n${msg}`, threadID, () =>
                                api.unsendMessage(handleReply.messageID))));
                    break;
                }
            }
    }
};

module.exports.run = async function({ api, event, args }) {
    switch (args[0]) {
        case "all":
            {
                var inbox = await api.getThreadList(100, null, ['INBOX']);
                let list = [...inbox].filter(group => group.isSubscribed && group.isGroup);
                var listthread = [];

                for (var groupInfo of list) {
                    listthread.push({
                        id: groupInfo.threadID,
                        name: groupInfo.name || "No Name",
                        participants: groupInfo.participants.length
                    });
                }

                var listbox = listthread.sort((a, b) => b.participants - a.participants);

                var groupid = [];
                var groupName = [];
                var page = parseInt(args[0]) || 1;
                var limit = 100000;
                var msg = "====『 GROUP LIST 』====\n\n";
                var numPage = Math.ceil(listbox.length / limit);

                for (var i = limit * (page - 1); i < limit * (page - 1) + limit; i++) {
                    if (i >= listbox.length) break;
                    let group = listbox[i];
                    msg += `━━━━━━━━━━━━━━━━━━\n${i + 1}. ${group.name}\n💌 TID: ${group.id}\n👤 Members: ${group.participants}\n\n`;
                    groupid.push(group.id);
                    groupName.push(group.name);
                }

                msg += `\nPage ${page}/${numPage}\nUse ${global.config.PREFIX}listbox + page/all\n\n`;

                api.sendMessage(msg + "━━━━━━━━━━━━━━━━━━\n→ Reply with Out, Ban, Unban + number(s)\n→ Multiple numbers separated by spaces to execute on multiple threads", event.threadID, (e, data) =>
                    global.client.handleReply.push({
                        name: this.config.name,
                        author: event.senderID,
                        messageID: data.messageID,
                        groupid,
                        groupName,
                        type: 'reply'
                    })
                );
            }
            break;

        default:
            try {
                var inbox = await api.getThreadList(100, null, ['INBOX']);
                let list = [...inbox].filter(group => group.isSubscribed && group.isGroup);
                var listthread = [];

                for (var groupInfo of list) {
                    listthread.push({
                        id: groupInfo.threadID,
                        name: groupInfo.name || "No Name",
                        messageCount: groupInfo.messageCount,
                        participants: groupInfo.participants.length
                    });
                }

                var listbox = listthread.sort((a, b) => b.participants - a.participants);

                var groupid = [];
                var groupName = [];
                var page = parseInt(args[0]) || 1;
                var limit = 100;
                var msg = "=====『 GROUP LIST 』=====\n\n";
                var numPage = Math.ceil(listbox.length / limit);

                for (var i = limit * (page - 1); i < limit * (page - 1) + limit; i++) {
                    if (i >= listbox.length) break;
                    let group = listbox[i];
                    msg += `━━━━━━━━━━━━━━━━━━\n${i + 1}. ${group.name}\n[🔰] TID: ${group.id}\n[👤] Members: ${group.participants}\n[💬] Total Messages: ${group.messageCount}\n`;
                    groupid.push(group.id);
                    groupName.push(group.name);
                }

                msg += `\n→ Page ${page}/${numPage}\nUse ${global.config.PREFIX}listbox + page/all\n`;

                api.sendMessage(msg + "━━━━━━━━━━━━━━━━━━\n→ Reply with Out, Ban, Unban + number(s)\n→ Multiple numbers separated by spaces to execute on multiple threads", event.threadID, (e, data) =>
                    global.client.handleReply.push({
                        name: this.config.name,
                        author: event.senderID,
                        messageID: data.messageID,
                        groupid,
                        groupName,
                        type: 'reply'
                    })
                );
            } catch (e) {
                return console.log(e);
            }
    }
};
