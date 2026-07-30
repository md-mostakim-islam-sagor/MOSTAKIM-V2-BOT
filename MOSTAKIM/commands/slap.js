module.exports.config = {
  name: "slap",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "MOSTAKIM",
  description: "Slap the friend tag & reply",
  commandCategory: "fun",
  usages: "slap [Tag & reply someone you want to slap]",
  cooldowns: 5,
};

let loadImage, createCanvas;
try { ({ loadImage, createCanvas } = require("canvas")); } catch (_) {}

module.exports.run = async ({ api, event, args }) => {
  const axios = require('axios');
  const fs = require("fs-extra");
  var out = (msg) => api.sendMessage(msg, event.threadID, event.messageID);

  if (!createCanvas) {
    return out("❌ Slap command is unavailable on this server (canvas library not supported).");
  }

  const bgURL = "https://i.ibb.co.com/svNGZGyL/6a428d5ef9481e7f98e736a7ede44377.jpg";
  const pathImg = __dirname + "/cache/slap_bg.png";
  const pathAvt = __dirname + "/cache/slap_avt.png";
  const pathSenderAvt = __dirname + "/cache/slap_sender_avt.png";

  var mention = Object.keys(event.mentions)[0];
  let targetID, tag;

  if (mention) {
    // Case 1: user tagged/mentioned someone
    targetID = mention;
    tag = event.mentions[mention].replace("@", "");
  } else if (event.messageReply) {
    // Case 2: user replied to someone's message
    targetID = event.messageReply.senderID;
  } else {
    return out("Please tag someone or reply to their message");
  }

  // Always fetch user info to get a display name for the tag
  try {
    const userInfo = await api.getUserInfo(targetID);
    if (!tag) tag = userInfo[targetID]?.name || "Unknown User";
  } catch {
    return out("❌ Unable to fetch user information.");
  }

  let avt, senderAvt, bg;
  try {
    avt = (await axios.get(
      `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: "arraybuffer" }
    )).data;

    senderAvt = (await axios.get(
      `https://graph.facebook.com/${event.senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: "arraybuffer" }
    )).data;

    bg = (await axios.get(bgURL, { responseType: "arraybuffer" })).data;

    fs.writeFileSync(pathAvt, Buffer.from(avt));
    fs.writeFileSync(pathSenderAvt, Buffer.from(senderAvt));
    fs.writeFileSync(pathImg, Buffer.from(bg));
  } catch {
    return out("Failed to generate image, please try again later!");
  }

  try {
    const base = await loadImage(pathImg);
    const avatar = await loadImage(pathAvt);
    const senderAvatar = await loadImage(pathSenderAvt);

    const canvas = createCanvas(base.width, base.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(base, 0, 0);

    // Circle position over the face of the person getting slapped
    const cx = 150, cy = 400, radius = 85;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, cx - radius, cy - radius, radius * 2, radius * 2);
    ctx.restore();

    // Circle position over the face of the person slapping (sender)
    const scx = 430, scy = 95, sradius = 90;
    ctx.save();
    ctx.beginPath();
    ctx.arc(scx, scy, sradius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(senderAvatar, scx - sradius, scy - sradius, sradius * 2, sradius * 2);
    ctx.restore();

    fs.writeFileSync(pathImg, canvas.toBuffer());
    fs.removeSync(pathAvt);
    fs.removeSync(pathSenderAvt);

    api.setMessageReaction("👊", event.messageID, (err) => {}, true);
    return api.sendMessage({
      body: "Slapped! " + tag + "\n\nবেশি ফাজলামি  করলে থাপ্পড় মেরে গাল লাল করে দিব 😾",
      mentions: [{
        tag: tag,
        id: targetID
      }],
      attachment: fs.createReadStream(pathImg)
    }, event.threadID, () => fs.unlinkSync(pathImg), event.messageID);

  } catch {
    api.setMessageReaction("😿", event.messageID, (err) => {}, true);
    return out("Failed to generate image, please try again later!");
  }
};