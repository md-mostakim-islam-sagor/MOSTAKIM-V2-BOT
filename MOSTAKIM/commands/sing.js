const { ytdown } = require("mostakim-media-downloaders");
const yts         = require("yt-search");
const axios       = require("axios");
const fs          = require("fs");
const path        = require("path");

module.exports.config = {
  name:            "sing",
  aliases:         ["music", "play"],
  version:         "2.0.0",
  hasPermssion:    0,
  credits:         "SaGor / MOSTAKIM",
  commandCategory: "media",
  usages:          "[song name or YouTube link]",
  cooldowns:       5,
  description:     "Search and send song from YouTube.",
  dependencies: {
    "mostakim-media-downloaders": "",
    "yt-search": ""
  }
};

module.exports.languages = {
  en: {
    noArgs:      "❌ Please provide a song name.",
    searching:   "🔍 Searching song...",
    downloading: "⬇️ Downloading song...",
    notFound:    "❌ Song not found.",
    failDl:      "❌ Failed to download audio.",
    error:       "❌ An error occurred: %1"
  }
};

const CACHE_DIR = path.join(process.cwd(), "MAIN", "tmp");
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

module.exports.run = async function ({ api, args, event, getLang }) {
  const { threadID, messageID } = event;

  if (!args[0]) return api.sendMessage(getLang("noArgs"), threadID, messageID);

  let searchingMsg, downloadingMsg;

  try {
    // ── Search ─────────────────────────────────────────────────────────────────
    searchingMsg = await api.sendMessage(getLang("searching"), threadID);

    const search = await yts(args.join(" "));
    const video  = search.videos[0];

    try { api.unsendMessage(searchingMsg.messageID); } catch {}

    if (!video) return api.setMessageReaction("❌", messageID, () => {}, true);

    // ── Download via mostakim-media-downloaders (ytdown → nayan API) ──────────
    downloadingMsg = await api.sendMessage(getLang("downloading"), threadID);

    const result = await ytdown(video.url);

    // ytdown returns audio field; if missing try video as fallback
    const audioUrl = result?.data?.audio || result?.data?.video;
    if (!result?.status || !audioUrl) {
      try { api.unsendMessage(downloadingMsg.messageID); } catch {}
      return api.setMessageReaction("❌", messageID, () => {}, true);
    }

    const filePath = path.join(CACHE_DIR, `sing_${Date.now()}.mp3`);

    // ── Stream audio to file ──────────────────────────────────────────────────
    const response = await axios({
      url:          audioUrl,
      method:       "GET",
      responseType: "stream",
      timeout:      90000,
      headers:      { "User-Agent": "Mozilla/5.0" }
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      try { api.unsendMessage(downloadingMsg.messageID); } catch {}

      // Check file is not empty before sending
      const sizeMB = fs.existsSync(filePath) ? fs.statSync(filePath).size / (1024 * 1024) : 0;
      if (sizeMB < 0.001) {
        try { fs.unlinkSync(filePath); } catch {}
        return api.setMessageReaction("❌", messageID, () => {}, true);
      }

      api.sendMessage(
        {
          body:       `🎵 ${result.data.title || video.title}\n⏱ ${video.timestamp} | 👁 ${video.views?.toLocaleString() || "N/A"} views\n📦 ${sizeMB.toFixed(1)} MB\n⚡ MOSTAKIM V2 BOT`,
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        (err) => {
          try { fs.unlinkSync(filePath); } catch {}
          api.setMessageReaction(err ? "❌" : "✅", messageID, () => {}, true);
        },
        messageID
      );
    });

    writer.on("error", (e) => {
      try { api.unsendMessage(downloadingMsg.messageID); } catch {}
      try { fs.unlinkSync(filePath); } catch {}
      api.setMessageReaction("❌", messageID, () => {}, true);
    });

  } catch (e) {
    try { if (searchingMsg)   api.unsendMessage(searchingMsg.messageID);   } catch {}
    try { if (downloadingMsg) api.unsendMessage(downloadingMsg.messageID); } catch {}
    api.sendMessage(getLang("error", e.message), threadID, messageID);
  }
};
