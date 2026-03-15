module.exports.config = {
    name: "money",
    version: "1.1.1",
    hasPermission: 0,
    credits: "Quất",
    description: "Set money or check money?",
    commandCategory: "User",
    usages: "/money [ + , - , * , / , ++ , -- , +- , +% , -% ]",
    cooldowns: 0,
    usePrefix: false,
};

module.exports.run = async function ({ Currencies, api, event, args, Users, permission }) {
    const axios = require("axios");
    const { threadID, messageID, senderID, mentions, type, messageReply } = event;

    let targetID = senderID;
    if (type === 'message_reply') {
        targetID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
        targetID = Object.keys(mentions)[0];
    }

    const name = await Users.getNameUser(targetID);
    const fetchStream = (url) => axios.get(url, { responseType: "stream" }).then(r => r.data);
    const gifLink = "https://files.catbox.moe/shxujt.gif";

    const moment = require("moment-timezone");
    const time = moment.tz("Asia/Karachi").format('HH:mm:ss - DD/MM/YYYY');

    const money = (await Currencies.getData(targetID)).money;
    const amount = args[1];

    try {
        switch (args[0]) {
            case "+": {
                if (permission < 2) return api.sendMessage("You don't have permission", threadID);
                await Currencies.increaseMoney(targetID, parseInt(amount));
                return api.sendMessage({
                    body: `💸 ${name}'s money increased by ${amount}$\n💸 Now has ${money + parseInt(amount)}$\n⏰ ${time}`,
                    attachment: await fetchStream(gifLink)
                }, threadID);
            }
            case "-": {
                if (permission < 2) return api.sendMessage("You don't have permission", threadID);
                await Currencies.increaseMoney(targetID, parseInt(-amount));
                return api.sendMessage({
                    body: `💸 ${name}'s money decreased by ${amount}$\n💸 Now has ${money - amount}$\n⏰ ${time}`,
                    attachment: await fetchStream(gifLink)
                }, threadID);
            }
            case "*": {
                if (permission < 2) return api.sendMessage("You don't have permission", threadID);
                await Currencies.increaseMoney(targetID, parseInt(money * (amount - 1)));
                return api.sendMessage({
                    body: `💸 ${name}'s money multiplied by ${amount}\n💸 Now has ${money * amount}$\n⏰ ${time}`,
                    attachment: await fetchStream(gifLink)
                }, threadID);
            }
            case "/": {
                if (permission < 2) return api.sendMessage("You don't have permission", threadID);
                await Currencies.increaseMoney(targetID, parseInt(-money + (money / amount)));
                return api.sendMessage({
                    body: `💸 ${name}'s money divided by ${amount}\n💸 Now has ${money / amount}$\n⏰ ${time}`,
                    attachment: await fetchStream(gifLink)
                }, threadID);
            }
            case "++": {
                if (permission < 2) return api.sendMessage("You don't have permission", threadID);
                await Currencies.increaseMoney(targetID, Infinity);
                return api.sendMessage({
                    body: `💸 ${name}'s money set to Infinity\n💸 Now has Infinity$\n⏰ ${time}`,
                    attachment: await fetchStream(gifLink)
                }, threadID);
            }
            case "--": {
                if (permission < 2) return api.sendMessage("You don't have permission", threadID);
                await Currencies.decreaseMoney(targetID, parseInt(money));
                return api.sendMessage({
                    body: `💸 ${name}'s money reset\n💸 Now has 0$\n⏰ ${time}`,
                    attachment: await fetchStream(gifLink)
                }, threadID);
            }
            case "+-": {
                if (permission < 2) return api.sendMessage("You don't have permission", threadID);
                await Currencies.decreaseMoney(targetID, parseInt(money));
                await Currencies.increaseMoney(targetID, parseInt(amount));
                return api.sendMessage({
                    body: `💸 ${name}'s money changed to ${amount}$\n💸 Now has ${amount}$\n⏰ ${time}`,
                    attachment: await fetchStream(gifLink)
                }, threadID);
            }
            case "^": {
                if (permission < 2) return api.sendMessage("You don't have permission", threadID);
                await Currencies.increaseMoney(targetID, parseInt(-money + Math.pow(money, amount)));
                return api.sendMessage({
                    body: `💸 ${name}'s money raised to the power of ${amount}\n💸 Now has ${Math.pow(money, amount)}$\n⏰ ${time}`,
                    attachment: await fetchStream(gifLink)
                }, threadID);
            }
            case "√": {
                if (permission < 2) return api.sendMessage("You don't have permission", threadID);
                await Currencies.increaseMoney(targetID, parseInt(-money + Math.pow(money, 1 / amount)));
                return api.sendMessage({
                    body: `💸 ${name}'s money root ${amount}\n💸 Now has ${Math.pow(money, 1 / amount)}$\n⏰ ${time}`,
                    attachment: await fetchStream(gifLink)
                }, threadID);
            }
            case "+%": {
                if (permission < 2) return api.sendMessage("You don't have permission", threadID);
                await Currencies.increaseMoney(targetID, parseInt(money / (100 / amount)));
                return api.sendMessage({
                    body: `💸 ${name}'s money increased by ${amount}%\n💸 Now has ${money + (money / (100 / amount))}$\n⏰ ${time}`,
                    attachment: await fetchStream(gifLink)
                }, threadID);
            }
            case "-%": {
                if (permission < 2) return api.sendMessage("You don't have permission", threadID);
                await Currencies.increaseMoney(targetID, parseInt(-(money / (100 / amount))));
                return api.sendMessage({
                    body: `💸 ${name}'s money decreased by ${amount}%\n💸 Now has ${money - (money / (100 / amount))}$\n⏰ ${time}`,
                    attachment: await fetchStream(gifLink)
                }, threadID);
            }
            case "pay": {
                const senderMoney = (await Currencies.getData(senderID)).money;
                const bet = amount === 'all' ? senderMoney : amount;
                if (money < 1) return api.sendMessage({
                    body: "You have less than $1 or are trying to send more than your balance",
                    attachment: await fetchStream(gifLink)
                }, threadID);

                await Currencies.increaseMoney(senderID, parseInt(-bet));
                await Currencies.increaseMoney(targetID, parseInt(bet));
                return api.sendMessage(`Transferred ${bet}$ to ${name}`, threadID);
            }
        }
    } catch (e) {
        console.log(e);
    }

    if (money === Infinity) return api.sendMessage(`${name} has infinite money`, threadID);
    if (money === null) return api.sendMessage(`${name} has $0`, threadID);
    if (!args[0] || !args[1]) return api.sendMessage(`${name} has ${money}$`, threadID);
};
