const request = require("request");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "resend",
    version: "2.0.0",
    hasPermssion: 1,
    credits: "KOJA PROJECT",
    description: "It's just a response",
    commandCategory: "general",
    usages: "resend",
    cooldowns: 0,
    hide: true,
    dependencies: {
      request: "",
      "fs-extra": "",
      axios: ""
    }
  },

  handleEvent: async function ({ event, api, client, Users }) {
    const { messageID, senderID, threadID, body: content, attachments, type } = event;
    const { writeFileSync, createReadStream } = fs;

    if (!global.logMessage) global.logMessage = new Map();
    if (!global.data.botID) global.data.botID = api.getCurrentUserID();

    const thread = global.data.threadData.get(parseInt(threadID)) || {};
    if (typeof thread["resend"] !== "undefined" && thread["resend"] === false) return;

    const vip = global.config.UNSENTVIP || [];
    if (senderID === global.data.botID) return;

    // Store messages
    if (type !== "message_unsend") {
      global.logMessage.set(messageID, {
        msgBody: content,
        attachment: attachments
      });
      return;
    }

    // Handle unsent messages
    if (type === "message_unsend" && !vip.includes(senderID)) {
      const getMsg = global.logMessage.get(messageID);
      if (!getMsg) return;

      const name = await Users.getNameUser(senderID);

      // If text only
      if (!getMsg.attachment || getMsg.attachment.length === 0) {
        return api.sendMessage(`${name} removed this message: ${getMsg.msgBody}`, threadID);
      }

      // If attachments exist
      const msg = {
        body: `${name} just removed ${getMsg.attachment.length} attachment(s).` +
          (getMsg.msgBody ? `\nContent: ${getMsg.msgBody}` : ""),
        attachment: [],
        mentions: [{ tag: name, id: senderID }]
      };

      let num = 0;
      for (const i of getMsg.attachment) {
        num++;
        const pathname = new URL(i.url).pathname;
        const ext = pathname.substring(pathname.lastIndexOf(".") + 1);
        const path = `${__dirname}/cache/${num}.${ext}`;

        const data = (await axios.get(i.url, { responseType: "arraybuffer" })).data;
        writeFileSync(path, Buffer.from(data, "utf-8"));
        msg.attachment.push(createReadStream(path));
      }

      return api.sendMessage(msg, threadID);
    }
  },

  run: async function ({ api, event, Threads }) {
    const { threadID, messageID } = event;
    const threadData = (await Threads.getData(threadID)).data || {};

    threadData["resend"] = !threadData["resend"];

    await Threads.setData(parseInt(threadID), { data: threadData });
    global.data.threadData.set(parseInt(threadID), threadData);

    return api.sendMessage(
      `Successfully ${threadData["resend"] ? "turned on" : "turned off"} resend!`,
      threadID,
      messageID
    );
  }
};
