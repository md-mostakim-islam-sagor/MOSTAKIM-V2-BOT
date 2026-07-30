module.exports.config = {
  name: "propose",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "MOSTAKIM",
  description: "Propose some tag & reply",
  commandCategory: "fun",
  usages: "proposal [Tag & reply someone you want to propose]",
  cooldowns: 5,
};

let loadImage, createCanvas;
try { ({ loadImage, createCanvas } = require("canvas")); } catch (_) {}

module.exports.run = async ({ api, event, args }) => {
  const axios = require('axios');
  const fs = require("fs-extra");
  var out = (msg) => api.sendMessage(msg, event.threadID, event.messageID);

  if (!createCanvas) {
    return out("❌ Proposal command is unavailable on this server (canvas library not supported).");
  }

  const bgURL = "https://i.ibb.co.com/b5ttpDzC/9c8e008f152e10b620ec8af6dafe1218.jpg";
  const pathImg = __dirname + "/cache/proposal_bg.png";
  const pathAvt = __dirname + "/cache/proposal_avt.png";
  const pathSenderAvt = __dirname + "/cache/proposal_sender_avt.png";

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

    // Sender = boy (left, offering the flower)
    const scx = 100, scy = 110, sradius = 75;
    ctx.save();
    ctx.beginPath();
    ctx.arc(scx, scy, sradius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(senderAvatar, scx - sradius, scy - sradius, sradius * 2, sradius * 2);
    ctx.restore();

    // Target = girl (right, receiving the flower)
    const cx = 600, cy = 140, radius = 75;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, cx - radius, cy - radius, radius * 2, radius * 2);
    ctx.restore();

    fs.writeFileSync(pathImg, canvas.toBuffer());
    fs.removeSync(pathAvt);
    fs.removeSync(pathSenderAvt);

    api.setMessageReaction("💐", event.messageID, (err) => {}, true);
    return api.sendMessage({
      body: "💐 প্রপোজ করা হলো " + tag + " কে!\n\nসে কি রাজি হবে? 😳",
      mentions: [{
        tag: tag,
        id: targetID
      }],
      attachment: fs.createReadStream(pathImg)
    }, event.threadID, () => fs.unlinkSync(pathImg), event.messageID);

  } catch {
    api.setMessageReaction("🙈", event.messageID, (err) => {}, true);
    return out("Failed to generate image, please try again later!");
  }
};