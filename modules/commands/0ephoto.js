const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports.config = {
    name: 'ephoto',
    version: '2.0.0',
    hasPermission: 0,
    prefix: true,
    credits: "KOJA-PROJECT",
    premium: false,
    description: 'Generate logos using ephoto360 styles',
    commandCategory: 'logos',
    usages: "<type> <text>",
    cooldowns: 25
};

const effects = {
    embo: ['https://en.ephoto360.com/create-a-realistic-embroidery-text-effect-online-662.html', 'EMBROIDERY'],
    shadow: ['https://en.ephoto360.com/shadow-text-effects-155.html', 'SHADOW'],
    angel: ['https://en.ephoto360.com/create-colorful-angel-wing-avatars-731.html', 'ANGEL'],
    wing: ['https://en.ephoto360.com/the-effect-of-galaxy-angel-wings-289.html', 'WING'],
    jewel: ['https://en.ephoto360.com/jewel-text-effect-275.html', 'JEWEL'],
    metal: ['https://en.ephoto360.com/metal-logo-online-108.html', 'METAL'],
    snake: ['https://en.ephoto360.com/snake-text-effect-276.html', 'SNAKE'],
    football: ['https://en.ephoto360.com/create-football-team-logo-online-free-671.html', 'FOOTBALL'],
    "3dtext": ['https://en.ephoto360.com/3d-text-effects-style-274.html', '3DTEXT'],
    cake: ['https://en.ephoto360.com/writing-on-the-cakes-127.html', 'CAKE'],
    plasma: ['https://en.ephoto360.com/plasma-text-effects-online-71.html', 'PLASMA'],
    "3dcubic": ['https://en.ephoto360.com/3d-cubic-text-effect-online-88.html', '3DCUBIC'],
    colorful: ['https://en.ephoto360.com/colorful-text-effects-93.html', 'COLORFUL'],
    water: ['https://en.ephoto360.com/water-3d-text-effect-online-126.html', 'WATER'],
    leaves: ['https://en.ephoto360.com/ligatures-effects-from-leaves-146.html', 'LEAVES'],
    gold: ['https://en.ephoto360.com/gold-text-effect-pro-271.html', 'GOLD'],
    chocolate: ['https://en.ephoto360.com/write-text-on-chocolate-186.html', 'CHOCOLATE'],
    water2: ['https://en.ephoto360.com/water-text-effects-online-106.html', 'WATER 2'],
    blackboard: ['https://en.ephoto360.com/writing-chalk-on-the-blackboard-30.html', 'BLACKBOARD'],
    fcover: ['https://en.ephoto360.com/create-one-piece-facebook-cover-online-553.html', 'FCOVER'],
    heart: ['https://en.ephoto360.com/text-heart-flashlight-188.html', 'HEART'],
    bulb2: ['https://en.ephoto360.com/create-realistic-vintage-3d-light-bulb-608.html', 'LUXURY BULB'],
    neon: ['https://en.ephoto360.com/neon-text-effect-68.html', 'NEON'],
    blackpink: ['https://en.ephoto360.com/create-blackpink-s-born-pink-album-logo-online-779.html', 'BLACKPINK'],
    exposure: ['https://en.ephoto360.com/create-double-exposure-inspired-text-effect-online-free-468.html', 'EXPOSURE'],
    arrow: ['https://en.ephoto360.com/create-multicolored-signature-attachment-arrow-effect-714.html', 'SIGNATURE ARROW'],
    bulb: ['https://en.ephoto360.com/create-realistic-vintage-3d-light-bulb-608.html', 'BULB'],
    star: ['https://en.ephoto360.com/metal-star-text-online-109.html', 'STAR'],
    chrome: ['https://en.ephoto360.com/glossy-chrome-text-effect-online-424.html', 'CHROME'],
    nightstar: ['https://en.ephoto360.com/stars-night-online-1-85.html', 'NIGHT STAR'],
    water3: ['https://en.ephoto360.com/create-water-effect-text-online-295.html', 'WATER 3'],
    avatar: ['https://en.ephoto360.com/mastery-avatar-lol-246.html', 'AVATAR'],
    signature: ['https://en.ephoto360.com/create-multicolored-neon-light-signatures-591.html', 'SIGNATURE'],
    avatarfire: ['https://en.ephoto360.com/create-free-fire-avatar-online-572.html', 'AVATAR FIRE'],
    watch: ['https://en.ephoto360.com/make-overwatch-wallpaper-full-hd-for-mobile-575.html', 'OVERWATCH'],
    wallpaper: ['https://en.ephoto360.com/create-a-new-rov-wallpaper-hd-by-name-for-mobile-330.html', 'WALLPAPER'],
    legends: ['https://en.ephoto360.com/create-the-league-of-legends-wallpaper-for-mobile-315.html', 'LEGENDS'],
    wallpaper2: ['https://en.ephoto360.com/amazing-aov-wallpaper-online-full-hd-for-mobile-436.html', 'WALLPAPER 2'],
    future: ['https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html', 'FUTURE'],
    fireworks: ['https://en.ephoto360.com/vibrant-fireworks-text-effect-535.html', 'FIREWORKS'],
    ice: ['https://en.ephoto360.com/ice-text-effect-online-101.html', 'ICE']
};

function stylishFrame(text) {
    return `╭──────•◈•──────╮\n${text}\n╰──────•◈•──────╯`;
}

module.exports.run = async ({ event, api, args, prefix }) => {
    const { threadID, messageID } = event;

    if (args.length < 2) {
        const available = Object.keys(effects)
            .map(k => `│ ● ${global.config.PREFIX}ephoto ${k} <text>`)
            .join('\n');
        const msg = stylishFrame(`│❌ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗳𝗼𝗿𝗺𝗮𝘁!\n│ 𝗨𝘀𝗲: ${global.config.PREFIX}ephoto <type> <text>\n╰─ Available styles:\n${available}`);
        return api.sendMessage(msg, threadID, messageID);
    }

    const type = args.shift().toLowerCase();
    const text = args.join(' ');

    if (!effects[type]) {
        return api.sendMessage(stylishFrame('│❌ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗲𝗳𝗳𝗲𝗰𝘁 𝘁𝘆𝗽𝗲!'), threadID, messageID);
    }

    const [effectUrl, label] = effects[type];
    const encodedUrl = encodeURIComponent(effectUrl);
    const requestUrl = `${global.config.KOJA}/ephoto?url=${encodedUrl}&text=${encodeURIComponent(text)}`;

    try {
        await api.sendMessage(stylishFrame(`⏳ 𝗖𝗿𝗲𝗮𝘁𝗶𝗻𝗴 𝘆𝗼𝘂𝗿 𝗹𝗼𝗴𝗼 𝘄𝗶𝘁𝗵 𝘀𝘁𝘆𝗹𝗲: "${label}"...`), threadID, messageID);

        const { data } = await axios.get(requestUrl);
        if (!data.success || !data.result?.image) {
            throw new Error("API failed to generate image");
        }

        const imageRes = await axios.get(data.result.image, { responseType: 'stream' });
        const filePath = path.join(__dirname, 'temp_logo.png');
        const writer = fs.createWriteStream(filePath);

        imageRes.data.pipe(writer);
        writer.on('finish', () => {
            const successMsg = stylishFrame(
                `│✅ 𝗟𝗼𝗴𝗼 𝗰𝗿𝗲𝗮𝘁𝗲𝗱 𝘀𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆!\n│ ● 𝗦𝘁𝘆𝗹𝗲: ${label}\n│ ● 𝗧𝗲𝘅𝘁: ${text}\n│ ✨ 𝗕𝘆: ${data.creator || "Unknown"} ✨`
            );
            api.sendMessage({ body: successMsg, attachment: fs.createReadStream(filePath) }, threadID, () => fs.unlinkSync(filePath), messageID);
        });

        writer.on('error', () => {
            api.sendMessage(stylishFrame('❌ 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝘄𝗿𝗶𝘁𝗲 𝗳𝗶𝗹𝗲.'), threadID, messageID);
        });

    } catch (err) {
        console.error(err);
        api.sendMessage(stylishFrame('❌ 𝗘𝗿𝗿𝗼𝗿 𝗴𝗲𝗻𝗲𝗿𝗮𝘁𝗶𝗻𝗴 𝗹𝗼𝗴𝗼.\n𝗣𝗹𝗲𝗮𝘀𝗲 𝘁𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝗹𝗮𝘁𝗲𝗿.'), threadID, messageID);
    }
};
