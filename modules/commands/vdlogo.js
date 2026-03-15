const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "vdlogo",
  version: "3.0.0",
  hasPermission: 0,
  prefix: true,
  credits: "KOJA-PROJECT",
  premium: false,
  description: "Generate logos using ephoto360 styles",
  commandCategory: "logos",
  usages: "<type> <text>",
  cooldowns: 25
};

// Available effects
const effects = {
  pubg: ["https://en.ephoto360.com/create-pubg-style-glitch-video-avatar-554.html", "PUBG"],
  intro: ["https://en.ephoto360.com/free-logo-intro-video-maker-online-558.html", "INTRO"],
  elegant: ["https://en.ephoto360.com/create-elegant-rotation-logo-online-586.html", "ELEGANT"],
  tiger: ["https://en.ephoto360.com/create-digital-tiger-logo-video-effect-723.html", "TIGER"]
};

// Pretty frame for messages
function stylishFrame(text) {
  return `╭──────•◈•──────╮\n${text}\n╰──────•◈•──────╯`;
}

// Helper to download file
async function downloadFile(url, outputPath) {
  const response = await axios.get(url, { responseType: "stream" });
  const writer = fs.createWriteStream(outputPath);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

module.exports.run = async ({ event, api, args, prefix }) => {
  const { threadID, messageID } = event;

  // Validate input
  if (args.length < 2) {
    const available = Object.keys(effects)
      .map(k => `│ ● ${global.config.PREFIX || prefix} vdlogo ${k} <text>`)
      .join("\n");
    const msg = stylishFrame(
      `│❌ Invalid format!\n│ Use: ${global.config.PREFIX || prefix}vdlogo <type> <text>\n╰─ Available styles:\n${available}`
    );
    return api.sendMessage(msg, threadID, messageID);
  }

  const type = args.shift().toLowerCase();
  const text = args.join(" ");

  if (!effects[type]) {
    return api.sendMessage(stylishFrame("│❌ Invalid effect type!"), threadID, messageID);
  }

  const [effectUrl, label] = effects[type];
  const encodedUrl = encodeURIComponent(effectUrl);
  const apiUrl = `${global.config.KOJA}/ephoto?url=${encodedUrl}&text=${encodeURIComponent(text)}`;
  const tempFile = path.join(__dirname, "temp_logo.mp4");

  try {
    await api.sendMessage(
      stylishFrame(`⏳ Creating your logo with style: "${label}"...`),
      threadID,
      messageID
    );

    const { data } = await axios.get(apiUrl);

    if (!data?.success || !data?.result?.image) {
      throw new Error("Invalid API response");
    }

    await downloadFile(data.result.image, tempFile);

    const successMsg = stylishFrame(
      `│✅ Logo created successfully!\n│ ● Style: ${label}\n│ ● Text: ${text}\n│ ✨ By: ${data.creator || "Unknown"} ✨`
    );

    api.sendMessage(
      { body: successMsg, attachment: fs.createReadStream(tempFile) },
      threadID,
      () => fs.unlinkSync(tempFile),
      messageID
    );
  } catch (err) {
    console.error("[EPHOTO ERROR]", err.message);
    api.sendMessage(
      stylishFrame("❌ Error generating logo.\nPlease try again later."),
      threadID,
      messageID
    );

    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  }
};
