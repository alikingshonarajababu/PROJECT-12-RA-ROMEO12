this.config = {
  name: "run",
  version: "1.0.2",
  hasPermission: 3,           // Required permission level
  credits: "KOJA XD",
  description: "Run JavaScript code",
  commandCategory: "Admin",
  usages: "[Script]",
  cooldowns: 5,               // Cooldown in seconds
};

this.run = async ({ api, event, args, Threads, Users, Currencies, models, permission }) => {
  const requireModule = require;
  const [axios, fs, { log }] = [requireModule('axios'), requireModule('fs'), console];

  // Helper to format data for sending
  const formatOutput = data => {
    if (typeof data === "object" && Object.keys(data).length !== 0) {
      return JSON.stringify(data, null, 4);
    } else if (['number', 'boolean'].includes(typeof data)) {
      return data.toString();
    } else {
      return data;
    }
  };

  // Helper to send messages
  const send = message => api.sendMessage(formatOutput(message), event.threadID, event.messageID);

  // Helper to mock POST requests via mocky.io
  const mocky = async data => {
    const response = await axios.post("https://api.mocky.io/api/mock", {
      status: 200,
      content: formatOutput(data),
      content_type: 'application/json',
      charset: 'UTF-8',
      secret: 'Quất',
      expiration: 'never'
    });
    send(response.data.link);
  };

  try {
    const { sendMessage, editMessage, shareContact } = api;
    const { threadID, messageID, senderID } = event;

    // Evaluate the user's input as async JS code
    const result = await eval(`(async() => { ${args.join(' ')} })()`, {
      api, event, args, Threads, Users, Currencies,
      models, global, permission,
      log, mocky, send,
      axios, fs,
      threadID, messageID, senderID,
      sendMessage
    }, true);

    send(result);

  } catch (error) {
    // Send the error message and translation to Vietnamese
    const translation = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encodeURIComponent(error.message)}`);
    send(`⚠️ Error: ${error.message}\n📝 Translation: ${translation.data[0][0][0]}`);
  }
};
