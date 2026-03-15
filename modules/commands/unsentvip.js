const fs = require("fs-extra");
const path = require("path");

// Path to config.json
const CONFIG_PATH = path.join(__dirname, "..", "..", "config.json");

module.exports.config = {
    name: "unsentvip",
    version: "1.2.0",
    hasPermission: 2,
    credits: "Koja Babu",
    description: "Manage the Unsent VIP list (add, remove, show users) with ID, mention, or reply",
    commandCategory: "config",
    usages: "[add/remove/show] [userID]",
    cooldowns: 5,
    dependencies: {
        "fs-extra": ""
    }
};

// Load config.json
function loadConfig() {
    if (!fs.existsSync(CONFIG_PATH)) {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify({ UNSENTVIP: [] }, null, 4), "utf8");
    }
    const data = fs.readFileSync(CONFIG_PATH, "utf8");
    const config = JSON.parse(data);
    if (!Array.isArray(config.UNSENTVIP)) config.UNSENTVIP = [];
    return config;
}

// Save config.json
function saveConfig(config) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 4), "utf8");
}

module.exports.run = async function({ api, event, args, Users }) {
    const { threadID, messageID, messageReply, mentions } = event;

    if (!args[0]) {
        return api.sendMessage("Please specify a subcommand: `add`, `remove`, or `show`.", threadID, messageID);
    }

    const subCommand = args[0].toLowerCase();
    const config = loadConfig();
    const UNSENTVIP = config.UNSENTVIP;

    // SHOW command
    if (subCommand === "show") {
        if (!UNSENTVIP.length) {
            return api.sendMessage("The Unsent VIP list is currently empty.", threadID, messageID);
        }

        const userList = await Promise.all(
            UNSENTVIP.map(async uid => {
                try {
                    const name = await Users.getNameUser(uid);
                    return `${name} (${uid})`;
                } catch {
                    return uid;
                }
            })
        );

        return api.sendMessage(`[ Unsent VIP List ]\n- ${userList.join("\n- ")}`, threadID, messageID);
    }

    // Helper: get IDs from numeric args, mentions, or reply
    const getTargetUserIds = () => {
        let userIds = args.slice(1).filter(arg => !isNaN(arg)); // numeric IDs
        if (Object.keys(mentions || {}).length) {
            userIds = userIds.concat(Object.keys(mentions));
        }
        if (messageReply) {
            userIds.push(messageReply.senderID);
        }
        return [...new Set(userIds)]; // remove duplicates
    };

    const targetUserIds = getTargetUserIds();

    if (!targetUserIds.length) {
        return api.sendMessage("Please provide at least one user ID, mention, or reply to a user.", threadID, messageID);
    }

    // ADD command
    if (subCommand === "add") {
        const addedUsers = [];

        for (const userId of targetUserIds) {
            if (!UNSENTVIP.includes(userId)) {
                UNSENTVIP.push(userId);

                let userName = userId;
                try {
                    userName = await Users.getNameUser(userId);
                } catch {}

                addedUsers.push(`${userName} (${userId})`);
            }
        }

        if (!addedUsers.length) {
            return api.sendMessage("All provided users are already in the Unsent VIP list.", threadID, messageID);
        }

        saveConfig(config);
        return api.sendMessage(`[ OK ] Added ${addedUsers.length} user(s) to the Unsent VIP list:\n- ${addedUsers.join("\n- ")}`, threadID, messageID);
    }

    // REMOVE command
    if (subCommand === "remove") {
        const removedUsers = [];

        for (const userId of targetUserIds) {
            const index = UNSENTVIP.indexOf(userId);
            if (index !== -1) {
                UNSENTVIP.splice(index, 1);

                let userName = userId;
                try {
                    userName = await Users.getNameUser(userId);
                } catch {}

                removedUsers.push(`${userName} (${userId})`);
            }
        }

        if (!removedUsers.length) {
            return api.sendMessage("None of the provided users were in the Unsent VIP list.", threadID, messageID);
        }

        saveConfig(config);
        return api.sendMessage(`[ OK ] Removed ${removedUsers.length} user(s) from the Unsent VIP list:\n- ${removedUsers.join("\n- ")}`, threadID, messageID);
    }

    return api.sendMessage("Invalid subcommand. Use `add`, `remove`, or `show`.", threadID, messageID);
};
