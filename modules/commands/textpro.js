const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: 'textpro',
    version: '2.1.0',
    hasPermission: 0,
    prefix: true,
    credits: "KOJA-PROJECT",
    premium: false,
    description: 'Generate logos with single-text using TextPro styles',
    commandCategory: 'logos',
    usages: "<type> <text>",
    cooldowns: 25
};

const effects = {
    blackpink: ['https://textpro.me/create-blackpink-s-born-pink-album-logo-online-779.html', '[BLACKPINK]'],
    neon: ['https://textpro.me/neon-text-effect-online-963.html', '[NEON]'],
    '3d': ['https://textpro.me/create-3d-glowing-text-effect-online-1002.html', '[3D GLOW]'],
    glitch: ['https://textpro.me/create-glitch-text-effect-style-online-1027.html', '[GLITCH]'],
    gradient: ['https://textpro.me/online-3d-gradient-text-effect-style-718.html', '[GRADIENT]'],
    futuristic: ['https://textpro.me/create-a-futuristic-text-effect-online-1006.html', '[FUTURISTIC]'],
    vintage: ['https://textpro.me/create-a-vintage-style-text-effect-online-1000.html', '[VINTAGE]'],
    matrix: ['https://textpro.me/matrix-text-effect-online-911.html', '[MATRIX]'],
    christmas: ['https://textpro.me/create-a-christmas-holiday-text-effect-1005.html', '[CHRISTMAS]'],
    halloween: ['https://textpro.me/create-halloween-text-effects-online-1004.html', '[HALLOWEEN]'],
    thunder: ['https://textpro.me/online-thunder-text-effect-679.html', '[THUNDER]'],
    typography: ['https://textpro.me/create-artistic-typography-text-effect-online-982.html', '[TYPOGRAPHY]'],
    dreamy: ['https://textpro.me/create-a-dreamy-text-effect-online-1007.html', '[DREAMY]'],
    'sci-fi': ['https://textpro.me/create-galaxy-science-fiction-text-effect-1002.html', '[SCI-FI]'],
    lava: ['https://textpro.me/lava-text-effect-online-914.html', '[LAVA]'],
    watercolor: ['https://textpro.me/create-watercolor-text-effect-online-1017.html', '[WATERCOLOR]'],
    blood: ['https://textpro.me/blood-text-effect-online-828.html', '[BLOOD]'],
    chocolate: ['https://textpro.me/chocolate-cake-text-effect-899.html', '[CHOCOLATE]'],
    gold: ['https://textpro.me/create-glossy-gold-text-effect-online-1011.html', '[GOLD]'],
    silver: ['https://textpro.me/create-glossy-silver-text-effect-online-1010.html', '[SILVER]'],
    blur: ['https://textpro.me/create-a-blur-text-effect-online-1008.html', '[BLUR]'],
    space: ['https://textpro.me/create-space-text-effect-online-985.html', '[SPACE]'],
    graffiti: ['https://textpro.me/create-cool-graffiti-text-effect-868.html', '[GRAFFITI]'],
    fire: ['https://textpro.me/create-fiery-text-effect-online-1014.html', '[FIRE]'],
};

module.exports.run = async ({ event, api, args, prefix }) => {
    const { threadID, messageID } = event;

    if (args.length < 2 && !event.messageReply?.body) {
        const styleList = Object.keys(effects)
            .sort()
            .map(k => `➤ ${global.config.PREFIX}textpro ${k} <text>`)
            .join('\n');
        return api.sendMessage(
            `╭──────•◈•──────╮\n` +
            `│❌ 𝗜𝗻𝗰𝗼𝗿𝗿𝗲𝗰𝘁 𝗨𝘀𝗮𝗴𝗲\n` +
            `│Use: ${global.config.PREFIX}textpro <type> <text>\n` +
            `╰──────•◈•──────╯\n\n` +
            `🎨 Available Styles:\n${styleList}`, 
            threadID, messageID
        );
    }

    const type = args.shift().toLowerCase();
    const inputText = args.join(' ') || event.messageReply?.body;

    if (!effects[type]) {
        const available = Object.keys(effects).map(k => `• ${k}`).join('\n');
        return api.sendMessage(
            `╭──────•◈•──────╮\n` +
            `│❌ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗧𝘆𝗽𝗲: ${type}\n` +
            `╰──────•◈•──────╯\n\n` +
            `📜 Valid Styles:\n${available}`, 
            threadID, messageID
        );
    }

    if (inputText.length > 100) {
        return api.sendMessage("⚠️ Text too long! Keep under 100 characters.", threadID, messageID);
    }

    const [effectUrl, label] = effects[type];
    const encodedUrl = encodeURIComponent(effectUrl);
    const apiUrl = `${global.config.KOJA}/textpro?url=${encodedUrl}&text=${encodeURIComponent(inputText)}`;

    const filePath = path.join(__dirname, `cache/${Date.now()}_textpro.png`);
    api.sendMessage(
        `╭──────•◈•──────╮\n` +
        `│✨ 𝗖𝗿𝗲𝗮𝘁𝗶𝗻𝗴 𝗟𝗼𝗴𝗼: ${label}\n` +
        `╰──────•◈•──────╯`,
        threadID, messageID
    );

    try {
        const res = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        await fs.outputFile(filePath, res.data);

        api.sendMessage(
            {
                body:
                    `╭──────•◈•──────╮\n` +
                    `│🖼️ 𝗡𝗮𝗺𝗲: •—» ${label} «—•\n` +
                    `╰──────•◈•──────╯`,
                attachment: fs.createReadStream(filePath)
            },
            threadID,
            () => fs.unlink(filePath),
            messageID
        );
    } catch (err) {
        return api.sendMessage(`⚠️ Error: ${err.message}`, threadID, messageID);
    }
};
