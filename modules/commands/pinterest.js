// ===== Pinterest Image Search Command (Simplified + Stable) =====
// 🧠 Author: ALI KOJA (Simplified by GPT-5)
// 🧩 Compatible with @dongdev/fca-unofficial
// 📦 Dependencies: axios, fs-extra, path

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "pinterest",
  version: "3.2.0",
  hasPermission: 0,
  credits: "ALI KOJA (Simplified by GPT-5)",
  commandCategory: "image search",
  description: "Search and send Pinterest images using Koja API",
  usages: "[query] -[1–16]",
  cooldowns: 20,
  dependencies: {
    axios: "",
    "fs-extra": ""
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  // Simple reply helper
  const reply = (msg) => api.sendMessage(msg, threadID, messageID);

  try {
    // Start
    await reply("🔎 Searching Pinterest...");

    // Validate arguments
    if (!args.length || !args.join(" ").includes("-")) {
      return reply(
        `⚠️ Incorrect usage!\n\nUsage: ${global.config.PREFIX}pinterest [query] -[1–16]\nExample: ${global.config.PREFIX}pinterest cats -5`
      );
    }

    const [searchTerm, num] = args.join(" ").split("-").map(s => s.trim());
    const limit = Math.max(1, Math.min(parseInt(num) || 6, 16));

    await reply(`🔍 Searching for “${searchTerm}” — expecting ${limit} images...`);

    // Fetch images from Koja API
    const apiURL = `https://koja-api.web-server.xyz/pinterest?text=${encodeURIComponent(searchTerm)}`;
    const res = await axios.get(apiURL, { timeout: 30000 });

    const images = res?.data?.images || [];
    if (!res.data.success || !images.length) {
      return reply("❌ No results found. Try a different keyword.");
    }

    // Prepare cache folder
    const cacheDir = path.join(__dirname, "cache", "pinterest");
    await fs.ensureDir(cacheDir);
    await fs.emptyDir(cacheDir);

    const attachments = [];

    for (const [index, url] of images.slice(0, limit).entries()) {
      try {
        const img = await axios.get(url, { responseType: "arraybuffer", timeout: 20000 });
        const filePath = path.join(cacheDir, `img_${index + 1}.jpg`);
        await fs.writeFile(filePath, img.data);
        attachments.push(fs.createReadStream(filePath));

        // Progress log (not message edit)
        console.log(`📥 Downloaded ${index + 1}/${limit} images...`);
      } catch (err) {
        console.error(`❌ Failed to download image ${index + 1}: ${err.message}`);
      }
    }

    if (!attachments.length) {
      return reply("❌ Failed to fetch any images. Try again later.");
    }

    // Send final results
    await api.sendMessage({
      body: `✅ Results for “${searchTerm}”\n🖼️ Total images: ${attachments.length}\n🔗 API by ALI KOJA`,
      attachment: attachments
    }, threadID);

    // Cleanup cache
    await fs.emptyDir(cacheDir);

  } catch (error) {
    console.error("Pinterest Command Error:", error);
    api.sendMessage(`❌ Error: ${error.message || "Unknown error"}`, threadID, messageID);
  }
};
