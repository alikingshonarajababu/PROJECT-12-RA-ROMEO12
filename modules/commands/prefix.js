module.exports = {
  config: {
    name: "prefix",
    version: "1.0.3",
    hasPermission: 0,
    credits: "KOJA-PROJECT",
    description: "Display bot prefix and usage guide",
    commandCategory: "system",
    usages: "",
    cooldowns: 5
  },

  handleEvent: async function({ event, api, prefix }) {
    const { threadID, messageID, body } = event;

    // Get Karachi time & date
    const options = {
      timeZone: 'Asia/Karachi',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    const formatter = new Intl.DateTimeFormat('en-PK', options);
    const parts = formatter.formatToParts(new Date());

    let time = '', date = '';
    parts.forEach(part => {
      if (part.type === 'hour') time = part.value;
      else if (part.type === 'minute') time += `:${part.value}`;
      else if (part.type === 'second') time += `:${part.value}`;
      else if (part.type === 'day') date = part.value;
      else if (part.type === 'month') date += `/${part.value}`;
      else if (part.type === 'year') date += `/${part.value}`;
    });

    // Trigger keywords
    const triggers = [
      "prefix", "mpre", "mprefix",
      "command mark", "bot prefix",
      "what is the prefix", "p r e f i x"
    ];

    const isTriggered = triggers.some(trigger => body.toLowerCase().includes(trigger.toLowerCase()));

    if (isTriggered) {
      const response = `
╭──────•◈•──────╮
| ● 𝗣𝗥𝗘𝗙𝗜𝗫 𝗜𝗡𝗙𝗢 
╰──────•◈•──────╯

╭┈ ❒ [ • ] 𝗕𝗢𝗧 𝗣𝗥𝗘𝗙𝗜𝗫
╰┈➤  ${global.config.PREFIX}

╭┈ ❒ 𝗛𝗢𝗪 𝗧𝗢 𝗨𝗦𝗘
╰┈➤  Type "${global.config.PREFIX}help" to see all commands.

╭┈ ❒ 𝗧𝗜𝗠𝗘 & 𝗗𝗔𝗧𝗘 
╰┈➤  [ ${time} || ${date} ]
`.trim();

      api.sendMessage(response, threadID, messageID);
    }
  },

  run: async function({ event, api }) {
    const options = {
      timeZone: 'Asia/Karachi',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    const formatter = new Intl.DateTimeFormat('en-PK', options);
    const parts = formatter.formatToParts(new Date());

    let time = '', date = '';
    parts.forEach(part => {
      if (part.type === 'hour') time = part.value;
      else if (part.type === 'minute') time += `:${part.value}`;
      else if (part.type === 'second') time += `:${part.value}`;
      else if (part.type === 'day') date = part.value;
      else if (part.type === 'month') date += `/${part.value}`;
      else if (part.type === 'year') date += `/${part.value}`;
    });

    

  }
};
