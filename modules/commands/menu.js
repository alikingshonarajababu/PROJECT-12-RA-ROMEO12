module.exports.config = {
    name: 'menu',
    version: '1.1.1',
    hasPermission: 0,
    credits: 'KOJA XD',
    description: 'View list of command groups and command information',
    commandCategory: 'Chat Box',
    usages: '[...command name | all]',
    cooldowns: 5,
    images: [],
    envConfig: {
        autoUnsend: {
            status: true,
            timeOut: 60
        }
    }
};

const { autoUnsend = this.config.envConfig.autoUnsend } = global.config == undefined ? {} : global.config.menu == undefined ? {} : global.config.menu;
const { compareTwoStrings, findBestMatch } = require('string-similarity');
const { readFileSync, writeFileSync, existsSync } = require('fs-extra');

module.exports.run = async function ({ api, event, args }) {
    const axios = require("axios");
    const moment = require("moment-timezone");
    const { sendMessage: send, unsendMessage: un } = api;
    const { threadID: tid, messageID: mid, senderID: sid } = event;
    const cmds = global.client.commands;

    const url = 'https://files.catbox.moe/amblv9.gif';
    const img = (await axios.get(url, { responseType: "stream" })).data;
    const time = moment.tz("Asia/Karachi").format("HH:mm:ss || DD/MM/YYYY");

    if (args.length >= 1) {
        if (typeof cmds.get(args.join(' ')) == 'object') {
            const body = infoCmds(cmds.get(args.join(' ')).config);
            return send(body, tid, mid);
        } else {
            if (args[0] == 'all') {
                const data = cmds.values();
                let txt = '╭─────────────⭓\n', count = 0;
                for (const cmd of data) txt += `│ ${++count}. ${cmd.config.name} | ${cmd.config.description}\n`;
                txt += `\n├────────⭔\n│ ⏳ Auto-delete message after: ${autoUnsend.timeOut}s\n╰─────────────⭓`;
                return send({ body: txt, attachment: img }, tid, (a, b) => autoUnsend.status ? setTimeout(v => un(v), 1000 * autoUnsend.timeOut, b.messageID) : '');
            } else {
                const cmdsValue = cmds.values();
                const arrayCmds = [];
                for (const cmd of cmdsValue) arrayCmds.push(cmd.config.name);
                const similarly = findBestMatch(args.join(' '), arrayCmds);
                if (similarly.bestMatch.rating >= 0.3) return send(` "${args.join(' ')}" is similar to command "${similarly.bestMatch.target}" ?`, tid, mid);
            }
        }
    } else {
        const data = commandsGroup();
        let txt = '╭─────────────⭓\n', count = 0;
        for (const { commandCategory, commandsName } of data) txt += `│ ${++count}. ${commandCategory} || has ${commandsName.length} commands\n`;
        txt += `├────────⭔\n│ 📝 Total: ${global.client.commands.size} commands\n│ ⏰ Time: ${time}\n│ 🔎 Reply with 1 to ${data.length} to select\n│ ⏳ Auto-delete message after: ${autoUnsend.timeOut}s\n╰─────────────⭓`;
        return send({ body: txt, attachment: img }, tid, (a, b) => {
            global.client.handleReply.push({ name: this.config.name, messageID: b.messageID, author: sid, 'case': 'infoGr', data });
            if (autoUnsend.status) setTimeout(v => un(v), 1000 * autoUnsend.timeOut, b.messageID);
        }, mid);
    }
};

module.exports.handleReply = async function ({ handleReply: $, api, event }) {
    const { sendMessage: send, unsendMessage: un } = api;
    const { threadID: tid, messageID: mid, senderID: sid, args } = event;
    const axios = require("axios");
    const url = 'https://files.catbox.moe/amblv9.gif';
    const img = (await axios.get(url, { responseType: "stream" })).data;

    if (sid != $.author) {
        return send(`⛔ You are not allowed to interact with this`, tid, mid);
    }

    switch ($.case) {
        case 'infoGr': {
            let data = $.data[(+args[0]) - 1];
            if (data == undefined) return send(`❎ "${args[0]}" is not in the menu list`, tid, mid);

            un($.messageID);
            let txt = `╭─────────────⭓\n│ ${data.commandCategory}\n├─────⭔\n`, count = 0;
            for (const name of data.commandsName) {
                const cmdInfo = global.client.commands.get(name).config;
                txt += `│ ${++count}. ${name} | ${cmdInfo.description}\n`;
            }
            txt += `├────────⭔\n│ 🔎 Reply with 1 to ${data.commandsName.length} to select\n│ ⏳ Auto-delete message after: ${autoUnsend.timeOut}s\n│ 📝 Use ${prefix(tid)}help + command name to see usage details\n╰─────────────⭓`;
            return send({ body: txt, attachment: img }, tid, (a, b) => {
                global.client.handleReply.push({ name: this.config.name, messageID: b.messageID, author: sid, 'case': 'infoCmds', data: data.commandsName });
                if (autoUnsend.status) setTimeout(v => un(v), 1000 * autoUnsend.timeOut, b.messageID);
            });
        }
        case 'infoCmds': {
            let data = global.client.commands.get($.data[(+args[0]) - 1]);
            if (typeof data != 'object') return send(`⚠️ "${args[0]}" is not in the menu list`, tid, mid);

            const { config = {} } = data || {};
            un($.messageID);
            return send(infoCmds(config), tid, mid);
        }
    }
};

function commandsGroup() {
    const array = [], cmds = global.client.commands.values();
    for (const cmd of cmds) {
        const { name, commandCategory } = cmd.config;
        const find = array.find(i => i.commandCategory == commandCategory);
        !find ? array.push({ commandCategory, commandsName: [name] }) : find.commandsName.push(name);
    }
    array.sort(sortCompare('commandsName'));
    return array;
}

function infoCmds(a) {
    return `╭── INFO ────⭓\n│ 📔 Command Name: ${a.name}\n│ 🌴 Version: ${a.version}\n│ 🔐 Permission: ${permissionText(a.hasPermission)}\n│ 👤 Author: ${a.credits}\n│ 🌾 Description: ${a.description}\n│ 📎 Category: ${a.commandCategory}\n│ 📝 Usage: ${a.usages}\n│ ⏳ Cooldown: ${a.cooldowns} seconds\n╰─────────────⭓`;
}

function permissionText(a) {
    return a == 0 ? 'Member' : a == 1 ? 'Group Admin' : a == 2 ? 'BOT ADMIN' : 'Bot Operator';
}

function prefix(a) {
    const tidData = global.data.threadData.get(a) || {};
    return tidData.PREFIX || global.config.PREFIX;
}

function sortCompare(k) {
    return function (a, b) {
        return (a[k].length > b[k].length ? 1 : a[k].length < b[k].length ? -1 : 0) * -1;
    };
}
