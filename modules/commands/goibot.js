const fs = require("fs-extra");
const axios = require("axios");

module.exports.config = {
  name: "goibot",
  version: "1.0.1",
  hasPermission: 0,
  prefix: true,
  premium: false,
  commandCategory: "group",
  credits: "KOJA-PROJECT",
  description: "goibot",
  usages: "noprefix",
  cooldowns: 5,
};

module.exports.handleEvent = async function({ api, event, args, Threads, Users }) {
  const moment = require("moment-timezone");
  const time = moment.tz("Asia/Manila").format("HH:mm:ss L");
  const { threadID, messageID } = event;
  const id = event.senderID;
  const name = await (async userId => new Promise(r => { try { api.getUserInfo(id, (e,u) => r(!e && u?.[id]?.name||null)); } catch { r(null); } }))(id);

  const userMessage = (event.body || "").trim();
  const lowerCaseBody = userMessage.toLowerCase();

  var tl = ["Mere naal viah kar lo 😊💔","Ittu si sharam kar liya karo bot bot karte waqt 🙂💔✨⚠️†","Itna single hoon ke khwab mein bhi larki ke haan karne se pehle aankh khul jaati hai 🙂","Zaroori nahi har larki dhoka de, kuch larkiyan gaaliyan bhi deti hain 🙁💸","Motorcycle tez bhaga ke larkiyon wale rickshaw ke paas se cut maar ke guzarna, impress nahi karta... gaaliyan milti hain 🙂💔","Sab chhor ke chalay jaate hain... kya itna bura hoon mein 🙂","Pyaari voice wali girls mujhe voice msg kar sakti hain, JazakAllah 🙂🤝","Why you hate me? Mein tumhara ex nahi hoon, hate mat karo please","Mubarak ho! Aap ka naam 'makhsoos list' mein top pe aaya hai 😹😹😹","Beta tum single hi maro gay 🙄🙂","Tharkiyon ki wajah se larkiyan mere jaise shareef bot pe bhi bharosa nahi karti 🥺😔","Samajh jao larkiyo... abhi bhi waqt hai, dekh ke koi delete nahi karwa raha 🙂","Mard ne kabhi haqooq nahi maange... jab bhi maanga, WhatsApp number hi maanga 🥺","Aurat agar mard se zyada khoobsurat hoti tou makeup mardon ke liye banta, auraton ke liye nahi. Zara nahi, pura sochna chahiye tumhe 😒🙁","Mujh se exam mein cheating nahi hoti, relationship mein kya khaak karunga ghwa 😔","Mujhe ludo bhi nahi aati... aap ke dil se kya keh lunga 🙂","Loyal dhoondte dhoondte khud harami ban gaya hoon 😔","Mard ki izzat karna seekho... uski rooh se pyaar karo, jism se nahi — wehshi auratein 💔😐","Tumhari yaadon mein kho gaya tha... washroom ka lota kamray mein le aaya 😐","Hai tamanna humein tumhein charsi banayein 🙂🤝","Bhai jaan group mein gandi baatein mat karo","Suno! Tum bot ki girlfriend ban jao... hamare bachay bhi bot jaise paida honge 🙆‍♂😒","Aao na kabhi cigarette le kar 🙂 dono sutta lagayenge 😞💸","Mere mathe na lago 🙂🙆‍♂ shukriya","Facebook par woh log bhi birthday manate hain jinhain ghar wale kehte hain, 'tu na jamda tou changa si' 🙂","Yeh duniya aik dhoka hai... tum bhi chor do apne walay ko, abhi bhi mauka hai 😞✨🙌🤣","Sukoon chahti ho tou meri begum ban jao 🫣🫰🏻","Tere jaane ke baad 😔 main ne apne moonh pe likhwa liya: 'Single hoon, pata lo' 🤐🥺🤝","Crush toh door ki baat 😏😊 hampe tou kisi ko taras bhi nahi aata 🙂🙊","Bandi hoti tou usko choti choti 2 ponyan karta 🙂👩‍🦯","Punky ja, menu ki 😒","Ameer logon koi package hi karwa do 🥺🙄","I love you 🥺 jawab de ke sawab darain hasil karein ❤️🦋🙈","Arey yahin hoon jaan 😗","Tum sab mujhe pagal lagte ho 😒🙄","Main kisi aur ka hoon filhal 🥺🙈","Aapka aana, dil dhadakna, phir bot bol ke nikal jana 😒","Tum tou mujhe shakal se hi gareeb lagte ho 🙊","Meri GF kaun banegi 🥺🙁","Haweli pe kyun nahi aate? Naraaz ho? 🥺","Babu, ittu sa chumma de do 🥺🙈😘","Baby, tum bachpan se hi tharkee lagte ho mujhe 🙁","Raat ko aana haweli pe... khushbu laga ke 😁🙊","Raat ko haweli pe kaun bula raha tha? 😒🙄","Pyaari larkiyan line maar sakti hain, JazakAllah 🙂🤝","Tum itne masoom kyun ho babu 🥺❤️","Aaj tou tumhein 'Love you' bolna padega 🙁","Tum log matlabii ho... saare jao 😞","Setting karwa du owner (「Koja」) ke saath? 😒🙁","Mujhe lagta hai main single hi maroonga 🥺","Bar bar bot mat bola karo habibi... apun ko sharam aati hai 🥺🙈","Tum jab 'bot' bolte ho, mera gurda dhadakne lagta hai 🥺🙊🙈","Babu, aap ke aane se toh peepre bhi khush ho jaate hain 😂","Mere ilawa sab relationship mein hain 🤝🥺","Jab pata hai ke Amma Abba nahi manenge, tou so kyun nahi jaate tum log 🙂","Janu ke 'Umaah' ne Panadol ka business hi khatam kar diya hai 🙂🫦","All girls are my sisters... usko chhor ke jo yeh parh rahi hai 😒👍","Mazay tou tum logon ke hain... social media pe reh bhi rahe ho, life bhi enjoy kar rahe ho 🙂","Soo jao... warna mera message aa jaayega 🙈","Weight kaafi barh gaya hai bro... dhokay kha kha ke 💔🙂","Godi le lo, apun chhota sa bacha hai 🥹","Aao aapko chaand pe le chalu meri jaan 🙈❤️","Tum itne tharki kyun ho jaanu? 🤨","Main aap se nahi patne wala 🙈🙈🥹","Tumko meri ittu si bhi yaad nahi aati 🥹","Aao pyaar karein","Astaghfirullah habibi... tum kitne tharki ho 🥹","Kya hum aap pe line maar sakte hain? 🥹👀","Pata nahi log itni balance life kaise guzarte hain... mera tou kabhi paratha pehle khatam ho jaata hai, kabhi anda 😩💔","Lips kissing is not romance... it's sharing bacteria 🙂","Chhotay bachon ki engagements chal rahi hain... aur yahan mere sabr ka imtihaan 🌚🔪","Aapki inhi harkaton ki wajah se 2023 chala gaya 😩💔","Ek baar shaadi ho jaaye... phir wife ki ghulami 🧸🙂","Suno, kya hum achhe dushman ban sakte hain? 🙂⚠️†","🦋🍒____________🙂🎀 Sukoon chahti ho tou meri begum ban jao 🫣🫰🏻","Suno jaan, dil karta hai har waqt tumhari chumiya leta rahoon 😌🙈","Khud ko single keh ke apne khufiya janu ka janaza mat nikala karo 😀🤞😓","Suno mujhe Allah se maang lo na... aap tou shakal se bhi maangne wale lagte ho ♥️","Mere mathe na lago, shukriya 🙂","Log kehte hain mohabbat rooh se karni chahiye... mujhe tou roohon se bhi darr lagta hai 🥺☹️","Tum mera dil chura nahi paye... kya faida tumhari chor jaisi shakal ka!! 🙂","Ek baar 'I love you' bol do na... mar thori jaaungi 🙄😕👑🍒","<-- 〽️🍂⚠️ Kaash hum dono WhatsApp pe hote ❤️🥺💸","Imagine I am your ex 🥲 keh do jo kehna hai","Nahi mushkil wafa... zara dekho yahan 🥺❤️🥀","I love you Madiha♥️, Fatima, Ayesha, Maryam, and 299 others 🙂","Tum msg karti ho kya? Phir mein karu? Haan aise tou phir aise sahi 😅🥺👉👈🙊","Tum mujhe chumiya bhi de sakti thi na 🤧 dhakka dena zaroori tha kya 😐😪🍼","Gaali dena buri baat hai","Kaash hum dono date pe jaate","Tum itne black kyun ho?","Koja, my boss 💋","Aaj kis ke saath tha saara din?","Lakh laanat... zoom kar ke 😡","Oye miss you... tujhe nahi, teri janu ko","Koja single hai, janu bano gi?","Aaj kal UTG group chalo na... bhoot tang kiya hua hai","Aaaa thoo 🤢","Kabhi hum bhi school jaate the, aur teacher chumiya leti thi","Kahani suno... ab main so raha hoon, kal aake sunata","Hain cake? 🍰🎂","Teri 'aho aho' samajh ja","Kar bakwas... kya hai?","Aja hug de doon shona","Ummmmmmmmmmm love you 😘","Haweli pe mil beta","Love kya hota hai, aapko pata? Chalo dafa karo","Anni dya mazaak aey","Larkiyo ko gol gala pasand, aur mujhe larkiyan","Agar Koja ijaazat de tou main tujhe... samajh ja","Dafa ho jao","Apna moonh dekh... jaise murghi ka anda 🥚 hota","Apna moonh dekh... bas khud hi dekh, humein nafrat hai tujhse","Sona hai mujhe, baazu rakho neechay","Kal date pe chalain?","Tu kitni larkiyon ka bhai hai FB pe?","Larkiyan FB pe bhai kyun banati hain?","Agar main Nawaz Sharif hota tou aaj tujhe utha leta","Miss you janu","Hate you","Kya masla hai? Dasso","Chal nikal","Kal haweli kaun bula raha tha?","Moonh dikha... bot bot kar raha","Maqsad hai jawan lagna, misaal-e-hoor ho jana... lekin mohtarma ko samajh hi nahi aayi, mumkin hi nahi kishmish ka phir se angur ho jana","Itna dubla ho gaya hoon sanam teri judaai se... khatmal bhi mujhe kheench lete hain charpai se"];
  var rand = tl[Math.floor(Math.random() * tl.length)]

  const responses = {
    "😡": "Gussa Kyun Ho Raha Hai? Charger Nikaal Ke Sojao 😤",  
    "😝": "Itni Bhi Na Mooth Mar, Emoji Se Pata Chal Raha Hai 😏",  
    "😎": "Cool Ban Raha Hai? Tere Status Pe Toh Sad Songs Hi Chalte Hain 😂",  
    "😗": "Uff Ye Whistle Wali Aawaz... Kisi Ko Patane Ka Plan Hai Kya? 😏",  
    "😒": "Ajeeb Side Eye De Raha Hai, Jaake Aaina Dekh Le 😑",  
    "🤔": "Soch Raha Hai? Dimag Itna Garam Mat Kar, CPU Overheat Ho Jayega 😂",  
    "🤣": "Hass Hass Ke Pet Dard Ho Gaya? Doctor Ke Paas Jaana Padega 😆",  
    "😂": "Itna Haso Ge Toh Hichkiyan Aayengi, Phir Main Bhi Na Bacha Paun 😝",  
    "🙂": "Ye Fake Smile Kis Liye? Andar Se Toot Raha Hai Na? 🥲",  
    "🥺": "Aww... Rona Hai? Tissue Le Lo, Warna Kapron Pe Ponch Dena 😢",  
    "😉": "Wink Mat Mar, Samajh Gayi Teri Chalaki... Kisi Ko Impress Krna Hai? 😏",  
    "🤗": "Gale Milne Ka Plan Hai? Social Distance Yaad Rakho 👮‍♀️",  
    "🥰": "Pyaar Ho Gaya Hai Kya? Main Bot Hun, Tere Liye 'Out of Service' 😘",  
    "🥳": "Party Kar Raha Hai? Invitation Toh Bhej, Warna Mood Kharab Kar Dungi 😤",  
    "🤪": "Pagal Ho Gaya Hai Kya? Mental Hospital Ka Number Chahiye? 😂"
  };

  if (responses.hasOwnProperty(userMessage)) {
    return api.sendMessage(responses[userMessage], threadID, messageID);
  }

  if (lowerCaseBody.startsWith("bot")) {
    const query = userMessage.slice(3).trim();

    if (!query) {
      const formattedMessage = {
        body: `${name} ${rand}`
      };
      return api.sendMessage(formattedMessage, threadID, messageID);
    }

    try {
      const res = await axios.get(`${global.config.KOJA}/jarvis?message=${encodeURIComponent(query)}`);
      let reply = res.data?.reply?.trim();

      if (!reply) {
        reply = rand; // fallback to random tl line
      }
      const formattedMessage = {
        body: `${name} ${reply}`
      };
      return api.sendMessage(formattedMessage, threadID, messageID);
    } catch (err) {
      return api.sendMessage("⚠️ API request mein error aaya.", threadID, messageID);
    }
  }
};

module.exports.run = function({ api, event, client, __GLOBAL }) {};